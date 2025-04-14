// prettier-ignore
import {
    artworkCacheKeys,
    escape,
    filterFields,
    getJsonData,
    getSettings,
    noDepartmentTerm,
    saveSettings,
} from './lib.js';

const contemporaryArt = 'Contemporary Art';

const baseQuery = {
    resources: 'artworks',
    size: 0,
    aggregations: {},
};

const departmentQuery = Object.assign({}, baseQuery);
departmentQuery.aggregations = {
    departments: {
        terms: {
            field: filterFields.department,
        },
    },
};

const settings = getSettings();

const selectDaily = document.querySelector('#daily');
selectDaily.value = settings.dailyMode;

selectDaily.addEventListener('change', (e) => {
    settings.dailyMode = e.target.value === 'true';
    save();
});

const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
const lastFetchedMoreThanAWeekAgo = (Date.now() - settings.departmentOptions.lastFetched) > oneWeekMs;

if (settings.departmentOptions.options.length === 0 || lastFetchedMoreThanAWeekAgo) {
    const departmentData = await getJsonData(departmentQuery);
    // prettier-ignore
    const departmentOptions = departmentData.aggregations.departments.buckets
        .map((b) => b.key)
        .filter(o => o !== contemporaryArt) // for some reason, filtering on contemporary art yields zero results, despite there being many artworks with that department
        .sort();
    departmentOptions.push(noDepartmentTerm);
    settings.departmentOptions.options = departmentOptions;
    settings.departmentOptions.lastFetched = Date.now();
    save();
}

const divDepartments = document.getElementById('departments');

for (const o of settings.departmentOptions.options) {
    const sanitized = escape(o);
    const template = document.createElement('div');
    template.innerHTML = `<label class="checkbox"><input type="checkbox" value="${sanitized}">${sanitized}</label>`;
    divDepartments.append(...template.children);
}

function updateDepartment(e) {
    settings.departmentOptions.selected = Array.from(divDepartments.querySelectorAll('input:checked')).map(
        (i) => i.value
    );
    save();
    // clear cached artwork data so that preferences are respected immediately
    Object.values(artworkCacheKeys).forEach(k => localStorage.removeItem(k));
}

if (settings.departmentOptions.selected.length === 0) {
    divDepartments.querySelectorAll('input').forEach((i) => (i.checked = true));
} else {
    settings.departmentOptions.selected.forEach((o) => {
        const option = divDepartments.querySelector(`[value="${o}"]`);
        // guard against options disappearing or being renamed
        if(option) {
            option.checked = true;
        }
    });
}

divDepartments.querySelectorAll('input').forEach((i) => i.addEventListener('change', updateDepartment));

function save() {
    saveSettings();
}
