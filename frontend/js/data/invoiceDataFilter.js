document.addEventListener("DOMContentLoaded", setupFilters);

function setupFilters() {
    var customerFilter = document.getElementById("customerFilter");
    var dateFilter = document.getElementById("dateFilter");
    var plzFilter = document.getElementById("plzFilter");
    var invoiceNumberFilter = document.getElementById("invoiceNumberFilter");
    var tableBody = document.getElementById("invoiceTableBody");

    customerFilter.addEventListener("change", filterInvoices);
    dateFilter.addEventListener("change", filterInvoices);
    plzFilter.addEventListener("change", filterInvoices);
    invoiceNumberFilter.addEventListener("keyup", filterInvoices);

    function filterInvoices() {
        var selectedCustomerId = customerFilter.value;
        var selectedDate = dateFilter.value;
        var selectedPlz = plzFilter.value;
        var selectedInvoiceNumber = invoiceNumberFilter.value.trim();

        var rows = tableBody.getElementsByTagName("tr");

        for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
            var cells = row.getElementsByTagName("td");
            var custId = cells[1].textContent;
            var invoiceDate = cells[6].textContent;
            var plz = cells[4].textContent;
            var invoiceNumber = cells[0].textContent;

            var shouldDisplay = true;

            if (selectedCustomerId && custId !== selectedCustomerId) {
                shouldDisplay = false;
            }

            if (selectedDate && invoiceDate !== selectedDate) {
                shouldDisplay = false;
            }

            if (selectedPlz && plz !== selectedPlz) {
                shouldDisplay = false;
            }

            if (
                selectedInvoiceNumber &&
                invoiceNumber.indexOf(selectedInvoiceNumber) === -1
            ) {
                shouldDisplay = false;
            }

            row.style.display = shouldDisplay ? "" : "none";
        }
    }
}
