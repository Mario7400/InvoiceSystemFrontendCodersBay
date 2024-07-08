$(document).ready(function () {
    fetchCustomers();
    fetchTowns();

    $("#editCustomerModal").on("hidden.bs.modal", function () {
        resetEditCustomerForm();
    });

    $("#saveEditedCustomerBtn").click(function () {
        saveEditedCustomer();
    });

    $("#unableToDeleteModal").on("hidden.bs.modal", function () {
        $("#unableToDeleteModalMessage").text("");
    });
});

let customers = [];
let currentEditingIndex = -1;

function fetchCustomers() {
    fetch("http://localhost:8080/customers/all")
        .then((response) => {
            if (!response.ok) {
                throw new Error("Failed to fetch customers");
            }
            return response.json();
        })
        .then((customersData) => {
            customers = customersData;
            renderCustomers();
        })
        .catch((error) => {
            console.error("Error fetching customers:", error);
        });
}

function renderCustomers() {
    const customerTableBody = document.getElementById("customerTableBody");
    customerTableBody.innerHTML = "";
    customers.forEach((customer, index) => {
        const { name, secondName, email, phoneNumber, street, streetNr, town, plz, companyName } = customer;
        const row = `
            <tr>
                <td>${name} ${secondName}</td>
                <td>${street} ${streetNr}, ${town}, ${plz}</td>
                <td>${phoneNumber}</td>
                <td>${email}</td>
                <td>${companyName}</td>
                <td>
                    <i class="fas fa-edit action-icons" onclick="editCustomer(${index})"></i>
                    <i class="fas fa-trash-alt action-icons" onclick="deleteCustomer(${index})"></i>
                </td>
            </tr>
        `;
        customerTableBody.innerHTML += row;
    });
}

function deleteCustomer(index) {
    const customer = customers[index];
    if (!customer.boughtSomething) {
        fetch(`http://localhost:8080/customers/delete/${customer.id}`, {
            method: "DELETE",
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to delete customer");
                }
                $("#deleteCustomerModal").modal("show");
                customers.splice(index, 1);
                renderCustomers();
            })
            .catch((error) => {
                $("#unableToDeleteModal").modal("show");
            });
    } else {
        $("#unableToDeleteModal").modal("show");
    }
}

function fetchTowns() {
    fetch("http://localhost:8080/towns/all")
        .then((response) => {
            if (!response.ok) {
                throw new Error("Failed to fetch towns");
            }
            return response.json();
        })
        .then((towns) => {
            const editCustomerPlzSelect = document.getElementById("editCustomerPlz");
            towns.forEach((town) => {
                const option = document.createElement("option");
                option.value = town.id;
                option.text = `${town.plz} ${town.town}`;
                editCustomerPlzSelect.appendChild(option);
            });
        })
        .catch((error) => {
            console.error("Error fetching towns:", error);
        });
}

function editCustomer(index) {
    currentEditingIndex = index;
    const customer = customers[index];
    document.getElementById("editCustomerName").value = customer.name;
    document.getElementById("editCustomerSecondName").value = customer.secondName;
    document.getElementById("editCustomerStreet").value = customer.street;
    document.getElementById("editCustomerStreetNr").value = customer.streetNr;
    document.getElementById("editCustomerEmail").value = customer.email;
    document.getElementById("editCustomerPhoneNumber").value = customer.phoneNumber;
    document.getElementById("editCustomerCompany").value = customer.companyName;

    const editCustomerPlzSelect = document.getElementById("editCustomerPlz");

    for (let i = 0; i < editCustomerPlzSelect.options.length; i++) {
        const option = editCustomerPlzSelect.options[i];

        if (option.value === customer.town.plz) {
            option.selected = true;
            break;
        }
    }

    $("#editCustomerModal").modal("show");
}

function saveEditedCustomer() {
    const editedCustomer = {
        name: document.getElementById("editCustomerName").value,
        email: document.getElementById("editCustomerEmail").value,
        phoneNumber: document.getElementById("editCustomerPhoneNumber").value,
        street: document.getElementById("editCustomerStreet").value,
        streetNr: document.getElementById("editCustomerStreetNr").value,
        secondName: document.getElementById("editCustomerSecondName").value,
        companyName: document.getElementById("editCustomerCompany").value,
        townId: document.getElementById("editCustomerPlz").value,
    };

    fetch(`http://localhost:8080/customers/update/${customers[currentEditingIndex].id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(editedCustomer),
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error("Failed to update customer");
            }
            customers[currentEditingIndex] = editedCustomer;
            fetchCustomers();
            renderCustomers();
            $("#editCustomerModal").modal("hide");
        })
        .catch((error) => {
            console.error("Error updating customer:", error);
        });
}

function resetEditCustomerForm() {
    document.getElementById("editCustomerName").value = "";
    document.getElementById("editCustomerSecondName").value = "";
    document.getElementById("editCustomerStreet").value = "";
    document.getElementById("editCustomerStreetNr").value = "";
    document.getElementById("editCustomerEmail").value = "";
    document.getElementById("editCustomerPhoneNumber").value = "";
    document.getElementById("editCustomerCompany").value = "";
    document.getElementById("editCustomerPlz").selectedIndex = 0;
}
