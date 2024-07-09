let cart = {
    realSellingPrices: [],
    amountOfSoldProduct: [],
    invoiceDate: new Date().toISOString(),
    customerId: null,
    productIds: [],
    productNames: [],
};

$(document).ready(function () {
    loadCustomersFromDB();
    loadProductsFromDB();
    loadCartFromBackend();
    updateCartItemCount();

    $("#cartModal").on("hidden.bs.modal", function () {
        $("#empty-cart").hide();
    });

    $(document).on("click", ".add-to-cart", addToCartHandler);
    $(document).on("click", "#cartButton", openCartModal);
    $(document).on("click", ".remove-from-cart", removeFromCartHandler);
    $(document).on("click", "#resetButton", resetCartHandler);
    $(document).on("click", "#checkoutButton", checkoutHandler);

    $(document).on("change", ".cart-price-input", changePriceHandler);
    $(document).on("change", ".cart-amount-input", changeAmountHandler);
});

function addToCartHandler() {
    const selectedCustomer = $("#customerSelect").val();
    if (!selectedCustomer) {
        $("#noCustomerModal").modal("show");
        return;
    }

    const productID = $(this).data("id");
    const productName = $(this).data("name");
    let productPrice = parseFloat($(this).data("price"));

    const priceInput = $(this).closest("tr").find(".price-input");
    if (priceInput.length > 0) {
        productPrice = parseFloat(priceInput.val());
    }

    const productAmount = parseInt($(this).closest("tr").find(".amount-input").val(), 10);

    if (cart.productIds.includes(productID)) {
        $("#productInCartModal").modal("show");
        return;
    }

    cart.customerId = selectedCustomer;
    cart.productIds.push(productID);
    cart.realSellingPrices.push(productPrice);
    cart.amountOfSoldProduct.push(productAmount);
    cart.productNames.push(productName);

    updateCart();
    saveCartToBackend(cart);

    const cartButton = $("#cartButton");
    cartButton.addClass("pulse");
    setTimeout(() => {
        cartButton.removeClass("pulse");
    }, 500);

    $(this).blur();
}

function openCartModal() {
    $("#cartModal").modal("show");
    $(this).blur();
}

function removeFromCartHandler() {
    const index = $(this).data("index");
    cart.productIds.splice(index, 1);
    cart.realSellingPrices.splice(index, 1);
    cart.amountOfSoldProduct.splice(index, 1);
    updateCart();
    saveCartToBackend(cart);
    $(this).blur();
}

function resetCartHandler() {
    resetCart();
    $(this).blur();
}

function checkoutHandler() {
    if (cart.productIds.length === 0) {
        $("#empty-cart").show();
        $(this).blur();
        return;
    }
    $("#empty-cart").hide();

    const invoiceDTO = {
        realSellingPrices: cart.realSellingPrices,
        amountOfSoldProduct: cart.amountOfSoldProduct,
        invoiceDate: new Date(),
        customerId: cart.customerId,
        productIds: cart.productIds,
    };

    fetch("http://localhost:8080/invoices/post", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(invoiceDTO),
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            console.log("Invoice created successfully!");
            $("#cartModal").modal("hide");
            $("#checkoutSuccessModal").modal("show");
            resetCart();
        })
        .catch((error) => {
            console.error("Error creating invoice:", error);
        });

    $(this).blur();
}

function changePriceHandler() {
    const index = $(this).data("index");
    const newPrice = parseFloat($(this).val());
    if (!isNaN(newPrice) && newPrice >= 0) {
        cart.realSellingPrices[index] = newPrice;
        updateCart();
        saveCartToBackend(cart);
    }
    $(this).blur();
}

function changeAmountHandler() {
    const index = $(this).data("index");
    const newAmount = parseInt($(this).val(), 10);
    if (!isNaN(newAmount) && newAmount >= 0) {
        cart.amountOfSoldProduct[index] = newAmount;
        updateCart();
        saveCartToBackend(cart);
    }
    $(this).blur();
}

function updateCartItemCount() {
    let itemCount = 0;
    cart.amountOfSoldProduct.forEach(amount => {
        itemCount += amount;
    });
    $("#cartItemCount").text(itemCount);
}

function updateCart() {
    const cartItems = $("#cartItems");
    cartItems.empty();
    let total = 0;

    cart.productIds.forEach((productId, index) => {
        const productName = cart.productNames[index];
        const productPrice = cart.realSellingPrices[index];
        const productAmount = cart.amountOfSoldProduct[index];

        total += productPrice * productAmount;
        const listItem = `<li class="list-group-item cart-item">
                          <span class="cart-item-label">${productName}</span>
                          <div class="cart-item-buttons">
                            <div class="cart-item-quantity">
                              <input type="number" class="form-control form-control-sm cart-item-input cart-price-input" value="${productPrice}" data-index="${index}">
                              <span>€ x amount:</span>
                              <input type="number" class="form-control form-control-sm cart-item-input cart-amount-input" value="${productAmount}" data-index="${index}">
                            </div>
                            <button class="btn btn-danger btn-sm remove-from-cart" data-index="${index}">&times;</button>
                          </div>
                        </li>`;
        cartItems.append(listItem);
    });

    $("#cartTotal").text(`€${total.toFixed(2)}`);
    updateCartItemCount();
}

function updateInputsFromCart() {
    cart.productIds.forEach((productId, index) => {
        const productIndex = $(`#productTable tr`).filter(function () {
            return $(this).find("button").data("id") === productId;
        }).index();

        if (productIndex >= 0) {
            const priceInput = $(`#productTable tr:eq(${productIndex})`).find(".price-input");
            if (priceInput.length > 0) {
                priceInput.val(cart.realSellingPrices[index]);
            }

            const amountInput = $(`#productTable tr:eq(${productIndex})`).find(".amount-input");
            if (amountInput.length > 0) {
                amountInput.val(cart.amountOfSoldProduct[index]);
            }
        }
    });
}

function resetCart() {
    cart = {
        realSellingPrices: [],
        amountOfSoldProduct: [],
        invoiceDate: new Date().toISOString(),
        customerId: null,
        productIds: [],
        productNames: [],
    };

    updateCart();
    updateCartItemCount();
    saveCartToBackend(cart);

    loadCustomersFromDB();
    loadProductsFromDB();
}

function saveCartToBackend(cart) {
    fetch(`http://localhost:8080/redis/post/1`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(cart),
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            console.log("Cart updated successfully!");
        })
        .catch((error) => {
            console.error("Error saving cart:", error);
        });
}

function loadCartFromBackend() {
    fetch(`http://localhost:8080/redis/get/1`)
        .then((response) => {
            if (!response.ok) {
                if (response.status === 404) {
                    console.log("No cart items found for key 1.");
                    resetCart();
                    return null;
                }
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then((data) => {
            if (data) {
                cart = {
                    realSellingPrices: data.realSellingPrices || [],
                    amountOfSoldProduct: data.amountOfSoldProduct || [],
                    invoiceDate: data.invoiceDate || new Date().toISOString(),
                    customerId: data.customerId || null,
                    productIds: data.productIds || [],
                    productNames: [],
                };

                if (cart.productIds.length > 0) {
                    const productPromises = cart.productIds.map(productId => getProductById(productId));
                    return Promise.all(productPromises);
                } else {
                    return [];
                }
            }
            return [];
        })
        .then(products => {
            if (products.length > 0) {
                cart.productNames = products.map(product => product.name);
            }
            if (cart.customerId) {
                $("#customerSelect").val(cart.customerId);
            }
            updateInputsFromCart();
            updateCart();
        })
        .catch((error) => {
            console.error("Error loading cart:", error);
            resetCart();
        });
}


function getProductById(productId) {
    return fetch(`http://localhost:8080/products/${productId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Hier musst du die Produktinformationen entsprechend zurückgeben
            return data; // Annahme: data ist ein JSON-Objekt mit den Produktinformationen
        })
        .catch(error => {
            console.error('Error fetching product:', error);
            return { id: productId, name: 'Unknown Product', description: '', price: 0, availability: false };
        });
}

function loadCustomersFromDB() {
    fetch("http://localhost:8080/customers/all")
        .then((response) => {
            if (!response.ok) {
                throw new Error("Network response was not ok " + response.statusText);
            }
            return response.json();
        })
        .then((data) => {
            if (data && data.length > 0) {
                renderCustomers(data);
            } else {
                console.log("No customers found.");
            }
        })
        .catch((error) => {
            console.error("Error loading customers:", error);
        });
}

function renderCustomers(customers) {
    const selectElement = $("#customerSelect");
    selectElement.empty();
    const defaultOption = "<option selected disabled>Select Customer</option>";
    selectElement.append(defaultOption);
    customers.forEach((customer) => {
        const option = `<option value="${customer.id}">${customer.name} ${customer.secondName}, ${customer.street} ${customer.streetNr}, ${customer.plz} ${customer.town}</option>`;
        selectElement.append(option);
    });

    if (cart.customerId) {
        selectElement.val(cart.customerId);
    }
}

function loadProductsFromDB() {
    fetch("http://localhost:8080/products/all")
        .then((response) => {
            if (!response.ok) {
                throw new Error("Network response was not ok " + response.statusText);
            }
            return response.json();
        })
        .then((data) => {
            if (data && data.length > 0) {
                renderProducts(data);
                if (cart.productIds.length > 0) {
                    updateInputsFromCart();
                }
            } else {
                console.log("No products found.");
            }
        })
        .catch((error) => {
            console.error("Error loading products:", error);
        });
}

function renderProducts(products) {
    const tableBody = $("#productTable");
    tableBody.empty();
    products.forEach((product) => {
        if (product.availability) {
            const row = `<tr>
                      <td class="truncate-text">${product.name}</td>
                      <td class="truncate-text">${product.description}</td>
                      <td><input type="number" value="${product.price}" class="form-control price-input" aria-label="Price for ${product.name}"></td>
                      <td><input type="number" value="1" class="form-control amount-input" aria-label="Amount for ${product.name}"></td>
                      <td><button class="btn btn-primary add-to-cart" data-id="${product.id}" data-name="${product.name}" data-price="${product.price}"><i class="fas fa-cart-plus"></i></button></td>
                    </tr>`;
            tableBody.append(row);
        }
    });
}
