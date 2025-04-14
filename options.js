const extensionSettingsKey = 'extensionSettings';
const settings = JSON.parse(localStorage.getItem(extensionSettingsKey)) || {};

const selectDaily = document.querySelector('#daily');
selectDaily.value = settings.dailyMode;

selectDaily.addEventListener('change', e => {
    settings.dailyMode = e.target.value === 'true';
    localStorage.setItem(extensionSettingsKey, JSON.stringify(settings));
})
