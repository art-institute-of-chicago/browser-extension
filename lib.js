const apiURL = 'https://api.artic.edu/api/v1/search';
const noDepartmentTerm = 'None (No Department Association)';

function getJson(body, callback, forceNew) {
    let request = new XMLHttpRequest();
    request.open('POST', apiURL, true);
    request.setRequestHeader('Content-Type', 'application/json');
    request.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            callback(JSON.parse(this.responseText), forceNew);
        }
    };
    request.send(JSON.stringify(body));
}

function getJsonData(body) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            reject('request timed out');
        }, 30 * 1000);
        getJson(body, (data) => {
            resolve(data);
        });
    });
}

function escape(s) {
    const bad1 = /&/g;
    const good1 = '&amp;';

    const bad2 = /</g;
    const good2 = '&lt;';

    const bad3 = />/g;
    const good3 = '&gt;';

    const bad4 = /"/g;
    const good4 = '&quot;';

    const bad5 = /'/g;
    const good5 = '&apos;';

    // prettier-ignore
    return s
      .replace(bad1, good1)
      .replace(bad2, good2)
      .replace(bad3, good3)
      .replace(bad4, good4)
      .replace(bad5, good5);
}

function merge(target, source) {
    for (const key in source) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
            if (!target[key] || typeof target[key] !== 'object') {
                target[key] = {};
            }
            merge(target[key], source[key]);
        } else {
            target[key] = source[key];
        }
    }
}

// initialize settings with defaults
const settings = {
    dailyMode: false,
    departmentOptions: {
        options: [],
        lastFetched: null,
        selected: [],
    },
};

// load settings if they exist
const extensionSettingsKey = 'extensionSettings';
merge(settings, JSON.parse(localStorage.getItem(extensionSettingsKey)));
saveSettings(); // save in case there are new default settings or settings are not persisted yet

function getSettings() {
    return settings;
}

function getStoredSettings() {
    // ensure we are always reading from localStorage so we don't load stale data
    return JSON.parse(localStorage.getItem(extensionSettingsKey));
}

function saveSettings() {
    localStorage.setItem(extensionSettingsKey, JSON.stringify(settings));
}

const filterFields = {
    department: 'department_title.keyword',
};

const artworkCacheKeys = {
    // LocalStorage keys for reference
    savedResponseKey: 'response',
    preloadedImagesKey: 'preloaded',
    preloadingImagesKey: 'preloading',
    lastLoadedDateKey: 'lastLoadedDate',
};

// prettier-ignore
export {
    artworkCacheKeys,
    escape,
    filterFields,
    getJson,
    getJsonData,
    getSettings,
    getStoredSettings,
    merge,
    noDepartmentTerm,
    saveSettings,
};
