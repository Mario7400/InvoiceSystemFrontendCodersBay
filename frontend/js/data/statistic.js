let numOfListedProducts = 5;

document.addEventListener("DOMContentLoaded", function () {
    fetchInvoiceData();
});

function fetchInvoiceData() {
    const apiUrl = "http://localhost:8080/invoices/complete";

    fetch(apiUrl)
        .then((response) => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then((data) => {
            const products = aggregateProductSales(data);
            const sortedProducts = sortProductsBySales(products);
            renderDropdown(sortedProducts);
            renderChart(sortedProducts.slice(0, numOfListedProducts));
        })
        .catch((error) => {
            console.error("Error fetching product sales:", error);
        });
}

function aggregateProductSales(data) {
    const products = {};
    data.forEach((invoice) => {
        invoice.products.forEach((product) => {
            if (!products[product.name]) {
                products[product.name] = {
                    name: product.name,
                    totalSales: 0,
                    unitsSold: 0,
                };
            }
            const productIndex = invoice.products.findIndex((p) => p.id === product.id);
            if (productIndex !== -1 && productIndex < invoice.realSellingPrices.length) {
                products[product.name].totalSales +=
                    invoice.realSellingPrices[productIndex] * invoice.amountOfSoldProduct[productIndex];
                products[product.name].unitsSold += invoice.amountOfSoldProduct[productIndex];
            }
        });
    });
    return products;
}

function sortProductsBySales(products) {
    return Object.values(products).sort((a, b) => b.totalSales - a.totalSales);
}

function renderDropdown(sortedProducts) {
    const dropdown = document.getElementById("numOfListedProducts");
    sortedProducts.forEach((product, index) => {
        const option = document.createElement("option");
        option.value = index + 1;
        option.textContent = index + 1;
        dropdown.appendChild(option);
    });
    dropdown.value = numOfListedProducts;
    dropdown.addEventListener("change", function () {
        numOfListedProducts = parseInt(this.value);
        document.getElementById("numOfProductsText").textContent = numOfListedProducts;
        renderChart(sortedProducts.slice(0, numOfListedProducts));
    });
}

function renderChart(products) {
    const productNames = products.map((item) => item.name);
    const salesData = products.map((item) => item.totalSales);
    const unitsSoldData = products.map((item) => item.unitsSold);

    const options = {
        series: [
            {
                name: "Total Sales [€]",
                data: salesData,
            },
            {
                name: "Units Sold [stk]",
                data: unitsSoldData,
            },
        ],
        chart: {
            type: "bar",
            height: 400,
        },
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: "55%",
                distributed: true,
            },
        },
        dataLabels: {
            enabled: false,
        },
        xaxis: {
            categories: productNames,
            labels: {
                formatter: function (val) {
                    return val;
                },
            },
        },
        yaxis: {
            title: {
                text: "Sales and Units Sold",
            },
        },
    };

    const chartElement = document.querySelector("#chart");
    chartElement.innerHTML = "";
    const chart = new ApexCharts(chartElement, options);
    chart.render();
}
