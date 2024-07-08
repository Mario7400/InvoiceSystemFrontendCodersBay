$(document).ready(function () {
    fetchProducts();
    setupAddProductForm();
});

let products = [];

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
        })
        .catch((error) => {
            console.error("Error fetching products:", error);
        });
}

function setupAddProductForm() {
    document.getElementById("addProductForm").addEventListener("submit", async function (event) {
        event.preventDefault();

        const name = document.getElementById("productName").value.trim();
        const description = document.getElementById("productDescription").value.trim();
        const price = parseFloat(document.getElementById("productPrice").value);
        const availability = document.getElementById("productAvailability").value === "true";

        const productExists = products.some((product) => product.name === name);

        if (!productExists) {
            try {
                const response = await fetch("http://localhost:8080/products/post", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name,
                        description,
                        price,
                        availability,
                    }),
                });

                if (response.ok) {
                    fetchProducts();
                    this.reset();
                    document.activeElement.blur();
                    const productAddedModal = new bootstrap.Modal(document.getElementById("productAddedModal"));
                    productAddedModal.show();
                } else {
                    console.error("Failed to add product:", response.statusText);
                }
            } catch (error) {
                console.error("Error adding product:", error.message);
            }
        } else {
            this.reset();
            const productExistsModal = new bootstrap.Modal(document.getElementById("productExistsModal"));
            productExistsModal.show();
        }
    });
}
