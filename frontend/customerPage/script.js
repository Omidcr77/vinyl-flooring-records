// Sample customer data
const customers = [
    { 
        id: 1,
        name: "علی رضایی", 
        phone: "09123456789", 
        balance: 200000,  // Stored in تومان
        img: "assets/customer.jpg", 
        purchaseDate: "2024-01-20",
        vinyls: [
            { type: "Luxury Vinyl", color: "Gray", length: "5m", width: "2m", entryDate: "2024-01-10" },
            { type: "Classic Vinyl", color: "Brown", length: "4m", width: "2m", entryDate: "2024-01-15" }
        ],
        receipts: [
            { date: "2024-01-21", amount: 50000 },
            { date: "2024-01-25", amount: 70000 }
        ]
    },
    { 
        id: 2,
        name: "محمد قاسمی", 
        phone: "09234567890", 
        balance: 50000,  // Stored in تومان
        img: "assets/customer.jpg", 
        purchaseDate: "2024-01-18",
        vinyls: [
            { type: "Premium Vinyl", color: "Black", length: "3m", width: "1.5m", entryDate: "2024-01-12" }
        ],
        receipts: [
            { date: "2024-01-19", amount: 20000 }
        ]
    }
];

// Update statistics (total customers and balance in USD)
function updateStatistics() {
    let totalCustomers = customers.length;
    
    // Convert total balance to USD (1 USD = 50,000 تومان)
    let totalBalanceToman = customers.reduce((sum, customer) => sum + customer.balance, 0);
    let totalBalanceUSD = (totalBalanceToman / 50000).toFixed(2); 

    // Ensure the elements exist before updating them
    if (document.getElementById("totalCustomers")) {
        document.getElementById("totalCustomers").textContent = totalCustomers;
    }
    if (document.getElementById("totalBalance")) {
        document.getElementById("totalBalance").textContent = `${totalBalanceUSD} دالر`;
    }
}

// Load customers into the grid
function loadCustomers() {
    let customerGrid = document.getElementById("customerGrid");
    if (!customerGrid) return;
    
    customerGrid.innerHTML = "";

    customers.forEach(customer => {
        let balanceUSD = (customer.balance / 50000).toFixed(2); // Convert to USD

        let card = document.createElement("div");
        card.className = "customer-card";
        card.setAttribute("data-id", customer.id);
        card.innerHTML = `
            <img src="${customer.img}" alt="${customer.name}">
            <h3>${customer.name}</h3>
            <p><strong>شماره تلفون:</strong> ${customer.phone}</p>
            <p><strong>حساب:</strong> ${balanceUSD} دالر</p>
        `;
        
        card.addEventListener("click", () => {
            localStorage.setItem("selectedCustomer", JSON.stringify(customer));
            window.location.href = "customerDetails.html";
        });

        customerGrid.appendChild(card);
    });

    // Update stats after loading customers
    updateStatistics();
}

// Load customers and update stats on page load
document.addEventListener("DOMContentLoaded", loadCustomers);

// Search Customers
function searchCustomer() {
    let input = document.getElementById("searchInput").value.toLowerCase();
    let customerCards = document.querySelectorAll(".customer-card");

    customerCards.forEach(card => {
        let name = card.querySelector("h3").innerText.toLowerCase();
        card.style.display = name.includes(input) ? "block" : "none";
    });
}
