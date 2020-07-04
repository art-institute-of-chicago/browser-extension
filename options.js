// Saves options to chrome.storage
function save_options() {
    var dateRangeFrom = document.getElementById("dateRangeFrom").value;
    var dateRangeTo = document.getElementById("dateRangeTo").value;
    chrome.storage.sync.set(
        {
            dateRangeFrom,
            dateRangeTo
        },
        function() {
            // Update status to let user know options were saved.
            var status = document.getElementById("filter-status");
            status.textContent = "Options saved!";
            setTimeout(function() {
                status.textContent = "";
            }, 1000);
        }
    );
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
    // Use default value color = 'red' and likesColor = true.
    chrome.storage.sync.get(
        {
            dateRangeFrom: "-8000",
            dateRangeTo: "2020"
        },
        function(items) {
            document.getElementById("dateRangeFrom").value =
                items.dateRangeFrom;
            document.getElementById("dateRangeTo").value = items.dateRangeTo;
        }
    );
}

function validateDateInputs() {
    const dateRangeFromInput = document.getElementById("dateRangeFrom");
    const dateRangeToInput = document.getElementById("dateRangeTo");

    const dateRangeFrom = Number(dateRangeFromInput.value);
    const dateRangeTo = Number(dateRangeToInput.value);

    if (dateRangeFrom < -8000) {
        dateRangeFromInput.style.borderColor = "red";
        return false;
    } else if (dateRangeFrom > dateRangeTo) {
        dateRangeFromInput.style.borderColor = "red";
        dateRangeToInput.style.borderColor = "red";
        return false;
    } else if (dateRangeTo < -8000 || dateRangeTo > new Date().getFullYear()) {
        dateRangeToInput.style.borderColor = "red";
        return false;
    }
    dateRangeFromInput.style.borderColor = "initial";
    dateRangeToInput.style.borderColor = "initial";
    return true;
}

function validate() {
    if (!validateDateInputs()) {
        document.getElementById("submit-button").disabled = true;
        return;
    }

    document.getElementById("submit-button").disabled = false;
}

document.addEventListener("DOMContentLoaded", restore_options);
document
    .getElementById("submit-button")
    .addEventListener("click", save_options);

document.getElementById("dateRangeFrom").addEventListener("change", validate);

document.getElementById("dateRangeTo").addEventListener("change", validate);
