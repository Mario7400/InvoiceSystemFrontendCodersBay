document.addEventListener("DOMContentLoaded", setupInvoiceTable);

function setupInvoiceTable() {
    var apiUrl = "http://localhost:8080/invoices/complete";
    var tableBody = document.getElementById("invoiceTableBody");

    fetch(apiUrl)
        .then((response) => response.json())
        .then((data) => {
            var uniqueCustomerIds = new Set();
            var uniqueDates = new Set();
            var uniquePlzs = new Set();

            data.forEach(function (invoice) {
                var customerInfo =
                    invoice.customer.name + " " + invoice.customer.secondName;
                var addressInfo =
                    invoice.customer.street + " " + invoice.customer.streetNr;
                var plzInfo = invoice.customer.plz;
                var townInfo = invoice.customer.town;

                var invoiceDate = new Date(
                    invoice.invoiceDate
                ).toLocaleDateString("de-AT");

                customerInfo = truncateText(customerInfo, 20);
                addressInfo = truncateText(addressInfo, 20);
                plzInfo = truncateText(plzInfo, 10);
                townInfo = truncateText(townInfo, 20);

                var row =
                    "<tr>" +
                    "<td>" +
                    invoice.invoiceNumber +
                    "</td>" +
                    "<td>" +
                    invoice.customer.id +
                    "</td>" +
                    "<td>" +
                    customerInfo +
                    "</td>" +
                    "<td>" +
                    addressInfo +
                    "</td>" +
                    "<td>" +
                    plzInfo +
                    "</td>" +
                    "<td>" +
                    townInfo +
                    "</td>" +
                    "<td>" +
                    invoiceDate +
                    "</td>" +
                    "</tr>";

                tableBody.innerHTML += row;

                uniqueCustomerIds.add(invoice.customer.id);
                uniqueDates.add(invoiceDate);
                uniquePlzs.add(plzInfo);
            });

            addOptionsFromSet(document.getElementById("customerFilter"), uniqueCustomerIds);
            addOptionsFromSet(document.getElementById("dateFilter"), uniqueDates);
            addOptionsFromSet(document.getElementById("plzFilter"), uniquePlzs);
        })
        .catch((error) => {
            console.error("Error fetching invoices:", error);
        });

    function addOptionsFromSet(selectElement, optionsSet) {
        optionsSet.forEach((option) => {
            var optionElement = document.createElement("option");
            optionElement.value = option;
            optionElement.textContent = option;
            selectElement.appendChild(optionElement);
        });
    }

    function truncateText(text, maxLength) {
        if (text.length > maxLength) {
            return text.substring(0, maxLength - 3) + "...";
        } else {
            return text;
        }
    }
}
