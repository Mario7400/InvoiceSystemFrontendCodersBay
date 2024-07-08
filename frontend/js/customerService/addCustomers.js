$(document).ready(function () {
    setupPLZTownData();
    setupCustomerForm();
    setupButtonBlur();
});

function setupPLZTownData() {
    fetch("http://localhost:8080/towns/all")
        .then((response) => response.json())
        .then((data) => {
            const plzTownSelect = document.getElementById("customerPLZTown");
            plzTownSelect.innerHTML = '<option value="" disabled selected>Select Postal Code and Town</option>';
            data.forEach((item) => {
                const option = document.createElement("option");
                option.value = item.id;
                option.textContent = `${item.plz} ${item.town}`;
                plzTownSelect.appendChild(option);
            });
        })
        .catch((error) =>
            console.error("Error loading PLZ and town data:", error)
        );
}

function addNewPLZTown(plz, town) {
    const countryCode = document.getElementById("countryCodeSelect").value;
    const combinedPLZ = countryCode + "-" + plz;

    fetch("http://localhost:8080/towns/post", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ plz: combinedPLZ, town }),
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error("PLZ and town combination already exists.");
            }
            return response.json();
        })
        .then((data) => {
            setupPLZTownData();
            $("#addPLZTownModal").modal("hide");
            document.getElementById("newPLZInput").value = "";
            document.getElementById("newTownInput").value = "";
            document.getElementById("error-message").style.display = "none";
        })
        .catch((error) => {
            document.getElementById("error-message").style.display = "block";
        });
}

function setupButtonBlur() {
    $(document).on("click", "button", function () {
        $(this).blur();
    });
}

function setupCustomerForm() {
    document.getElementById("addNewPLZTownBtn").addEventListener("click", function () {
        document.getElementById("error-message").style.display = "none";
        $("#addPLZTownModal").modal("show");
    });

    document.getElementById("saveNewPLZTownBtn").addEventListener("click", function () {
        const newPLZ = document.getElementById("newPLZInput").value.trim();
        const newTown = document.getElementById("newTownInput").value.trim();
        if (newPLZ && newTown) {
            addNewPLZTown(newPLZ, newTown);
        }
    });

    document.getElementById("addCustomerForm").addEventListener("submit", function (event) {
        event.preventDefault();
        const customerData = {
            name: document.getElementById("customerName").value.trim(),
            secondName: document.getElementById("customerSecondName").value.trim(),
            street: document.getElementById("customerStreet").value.trim(),
            streetNr: document.getElementById("customerStreetNr").value.trim(),
            townId: document.getElementById("customerPLZTown").value,
            email: document.getElementById("customerEmail").value.trim(),
            phoneNumber: document.getElementById("customerPhoneNumber").value.trim(),
            companyName: document.getElementById("companyName").value.trim(),
        };

        fetch("http://localhost:8080/customers/post", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(customerData),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then((data) => {
                $("#customerAddedModal").modal("show");
                document.getElementById("addCustomerForm").reset();
                document.getElementById("customerPLZTown").selectedIndex = 0;
            })
            .catch((error) => {
                if (error.response) {
                    error.response.json().then((errorMessage) => {
                        $("#customerErrorModal .modal-body").text("Error adding customer: " + errorMessage.message);
                        $("#customerErrorModal").modal("show");
                    });
                } else {
                    $("#customerErrorModal").modal("show");
                }
            });
    });
}
