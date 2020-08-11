const currentYear = new Date().getFullYear();

document.addEventListener('DOMContentLoaded', restore_options);
const filterForm = document.getElementById('filter-form');
filterForm.addEventListener('submit', save_options);

const dateRangeFromInput = document.getElementById('dateRangeFrom');
dateRangeFromInput.max = currentYear;

const dateRangeToInput = document.getElementById('dateRangeTo');
dateRangeToInput.placeholder = `Max: ${currentYear}`;
dateRangeToInput.max = currentYear;

// Saves options to chrome.storage
function save_options(event) {
    // Prevent the form from refreshing the page
    event.preventDefault();

    var dateRangeFrom = dateRangeFromInput.value;
    var dateRangeTo = dateRangeToInput.value;
    chrome.storage.sync.set(
        {
            dateRangeFrom,
            dateRangeTo,
        },
        function () {
            // Update status to let user know options were saved.
            var status = document.getElementById('filter-status');
            status.textContent = 'Options saved!';
            setTimeout(function () {
                status.textContent = '';
            }, 1000);
        }
    );
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
    chrome.storage.sync.get(
        {
            dateRangeFrom: '-8000',
            dateRangeTo: currentYear,
        },
        function (items) {
            dateRangeFromInput.value = items.dateRangeFrom;
            dateRangeToInput.value = items.dateRangeTo;
        }
    );
}
