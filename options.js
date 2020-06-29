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
            dateRangeFrom: "8000 BCE",
            dateRangeTo: "Present"
        },
        function(items) {
            document.getElementById("dateRangeFrom").value =
                items.dateRangeFrom;
            document.getElementById("dateRangeTo").value = items.dateRangeTo;
        }
    );
}
document.addEventListener("DOMContentLoaded", restore_options);
document
    .getElementById("submit-button")
    .addEventListener("click", save_options);
