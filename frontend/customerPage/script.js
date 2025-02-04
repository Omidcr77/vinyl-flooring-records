// Sample customer data
const customers = [
    { name: "علی رضایی", phone: "09123456789", balance: 200000, img: "assets/customer.jpg", purchaseDate: "2024-01-20" },
    { name: "محمد قاسمی", phone: "09234567890", balance: 50000, img: "assets/customer.jpg", purchaseDate: "2024-01-18" }
];

// Load customers into the grid
function loadCustomers() {
    let customerGrid = document.getElementById("customerGrid");
    let totalCustomers = customers.length;
    let totalBalance = customers.reduce((sum, customer) => sum + customer.balance, 0);

    document.getElementById("totalCustomers").textContent = totalCustomers;
    document.getElementById("totalBalance").textContent = totalBalance.toLocaleString() + " دالر";

    customerGrid.innerHTML = "";
    customers.forEach(customer => {
        let card = document.createElement("div");
        card.className = "customer-card";
        card.innerHTML = `
            <img src="${customer.img}" alt="${customer.name}">
            <h3>${customer.name}</h3>
            <p><strong>شماره تلفون:</strong> ${customer.phone}</p>
            <p><strong>حساب:</strong> ${customer.balance.toLocaleString()} دالر</p>
            <p><strong>تاریخ خرید:</strong> ${customer.purchaseDate}</p>
            <button class="edit-btn">ویرایش</button>
        `;
        customerGrid.appendChild(card);
    });
}

// Search Customers
function searchCustomer() {
    let input = document.getElementById("searchInput").value.toLowerCase();
    let customerCards = document.querySelectorAll(".customer-card");

    customerCards.forEach(card => {
        let name = card.querySelector("h3").innerText.toLowerCase();
        card.style.display = name.includes(input) ? "block" : "none";
    });
}

// Load customers on page load
document.addEventListener("DOMContentLoaded", loadCustomers);
