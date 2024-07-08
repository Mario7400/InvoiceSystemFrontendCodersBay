document.addEventListener("DOMContentLoaded", function () {
    fetchProducts();

    $("#editProductModal").on("hidden.bs.modal", function () {
        resetEditProductForm();
    });

    $("#saveEditedProductBtn").click(function () {
        saveEditedProduct();
    });

    $("#unableToDeleteModal").on("hidden.bs.modal", function () {
        $("#unableToDeleteModalMessage").text("");
    });
});

let products = [];
let currentEditingIndex = -1;

function fetchProducts() {
    fetch("http://localhost:8080/products/all")
        .then((response) => {
            if (!response.ok) {
                throw new Error("Failed to fetch products");
            }
            return response.json();
        })
        .then((productsData) => {
            products = productsData;
            renderProducts();
        })
        .catch((error) => {
            console.error("Error fetching products:", error);
        });
}

function renderProducts() {
    const productTableBody = document.getElementById("productTableBody");
    productTableBody.innerHTML = "";
    products.forEach((product, index) => {
        const { name, description, price, availability } = product;
        const row = `
            <tr>
                <td>${name}</td>
                <td>${description}</td>
                <td>${price}</td>
                <td>${availability ? "Available" : "Not Available"}</td>
                <td>
                    <i class="fas fa-edit action-icons" onclick="editProduct(${index})"></i>
                    <i class="fas fa-trash-alt action-icons" onclick="deleteProduct(${index})"></i>
                </td>
            </tr>
        `;
        productTableBody.innerHTML += row;
    });
}

function deleteProduct(index) {
    const product = products[index];
    fetch(`http://localhost:8080/products/delete/${product.name}`, {
        method: "DELETE",
    })
        .then((response) => {
            if (!response.ok) {
                if (response.status === 409) {
                    throw new Error("Product is in use and cannot be deleted.");
                } else {
                    throw new Error("Failed to delete product");
                }
            }
            $("#deleteProductModal").modal("show");
            products.splice(index, 1);
            renderProducts();
        })
        .catch((error) => {
            $("#unableToDeleteModal").modal("show");
            const modalMessageElement = document.getElementById("unableToDeleteModalMessage");
            if (modalMessageElement) {
                modalMessageElement.innerText = "An error occurred while deleting the product.";
            }
        });
}

function editProduct(index) {
    currentEditingIndex = index;
    const product = products[index];
    document.getElementById("editProductName").value = product.name;
    document.getElementById("editProductDescription").value = product.description;
    document.getElementById("editProductPrice").value = product.price;
    document.getElementById("editProductAvailability").checked = product.availability;

    $("#editProductModal").modal("show");
}

function saveEditedProduct() {
    const editedProductName = document.getElementById("editProductName").value;
    const editedProduct = {
        name: editedProductName,
        description: document.getElementById("editProductDescription").value,
        price: parseFloat(document.getElementById("editProductPrice").value),
        availability: document.getElementById("editProductAvailability").checked,
    };

    const existingProductIndex = products.findIndex(
        (product, index) =>
            product.name === editedProductName && index !== currentEditingIndex
    );
    if (existingProductIndex !== -1) {
        $("#editProductModal").modal("hide");
        $("#errorMessageModal").modal("show");
        return;
    }

    fetch(`http://localhost:8080/products/update/${products[currentEditingIndex].name}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(editedProduct),
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error("Failed to update product");
            }
            products[currentEditingIndex] = editedProduct;
            renderProducts();
            $("#editProductModal").modal("hide");
        })
        .catch((error) => {
            console.error("Error updating product:", error);
        });
}

function resetEditProductForm() {
    document.getElementById("editProductName").value = "";
    document.getElementById("editProductDescription").value = "";
    document.getElementById("editProductPrice").value = "";
    document.getElementById("editProductAvailability").checked = false;
}
