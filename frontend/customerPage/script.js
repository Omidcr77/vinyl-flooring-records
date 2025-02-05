// Sample customer data (All balances stored in USD)
let customers = JSON.parse(localStorage.getItem("customers")) || [
    { 
        id: 1,
        name: "علی رضایی", 
        phone: "09123456789", 
        balance: 200000, // USD
        img: "assets/customer.jpg", 
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
        balance: 50000, // USD
        img: "assets/customer.jpg", 
        vinyls: [
            { type: "Premium Vinyl", color: "Black", length: "3m", width: "1.5m", entryDate: "2024-01-12" }
        ],
        receipts: [
            { date: "2024-01-19", amount: 20000 }
        ]
    }
];

// Update statistics (Total customers & total balance in USD)
function updateStatistics() {
    let totalCustomers = customers.length;
    let totalBalance = customers.reduce((sum, customer) => sum + customer.balance, 0).toLocaleString(); // Summing USD directly

    document.getElementById("totalCustomers").textContent = totalCustomers;
    document.getElementById("totalBalance").textContent = `${totalBalance} دالر`;
}

// Function to add a new customer
function addCustomer() {
    let name = document.getElementById("customerName").value.trim();
    let phone = document.getElementById("customerPhone").value.trim();
    let balance = parseFloat(document.getElementById("customerBalance").value);

    if (!name || !phone || isNaN(balance) || balance < 0) {
        alert("لطفاً تمام فیلدها را به درستی پر کنید!");
        return;
    }

    let newCustomer = {
        id: Date.now(), // Unique ID
        name: name,
        phone: phone,
        balance: balance,
        img: "assets/customer.jpg", // Default Image
        vinyls: [],
        receipts: []
    };

    // Retrieve existing customers and update
    customers.push(newCustomer);
    localStorage.setItem("customers", JSON.stringify(customers));

    // Reload UI
    loadCustomers();
    updateStatistics();
    closeModal("addCustomerModal");

    // Clear form fields
    document.getElementById("customerName").value = "";
    document.getElementById("customerPhone").value = "";
    document.getElementById("customerBalance").value = "";
}

// Function to load customers into the UI
function loadCustomers() {
    let customerGrid = document.getElementById("customerGrid");
    customerGrid.innerHTML = "";

    customers.forEach(customer => {
        let card = document.createElement("div");
        card.className = "customer-card";
        card.setAttribute("data-id", customer.id);
        card.innerHTML = `
            <img src="${customer.img}" alt="${customer.name}">
            <h3>${customer.name}</h3>
            <p><strong>شماره تلفون:</strong> ${customer.phone}</p>
            <p><strong>حساب:</strong> ${customer.balance.toLocaleString()} دالر</p>
        `;

        card.addEventListener("click", () => {
            localStorage.setItem("selectedCustomer", JSON.stringify(customer));
            window.location.href = "customerDetails.html";
        });

        customerGrid.appendChild(card);
    });

    updateStatistics();
}

// Function to open a modal
function openModal(modalId) {
    let modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add("visible");
    }
}

// Function to close a modal
function closeModal(modalId) {
    let modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove("visible");
        setTimeout(() => {
            modal.style.display = "none"; // Ensure it's hidden after animation
        }, 300);
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    let modals = document.querySelectorAll(".modal");
    modals.forEach(modal => {
        if (event.target === modal) {
            closeModal(modal.id);
        }
    });
}

// Close modal when pressing ESC key
document.addEventListener("keydown", function(event) {
    if (event.key === "Escape") {
        let modals = document.querySelectorAll(".modal");
        modals.forEach(modal => {
            if (modal.classList.contains("visible")) {
                closeModal(modal.id);
            }
        });
    }
});


// Search Customers
function searchCustomer() {
    let input = document.getElementById("searchInput").value.toLowerCase();
    let customerCards = document.querySelectorAll(".customer-card");

    customerCards.forEach(card => {
        let name = card.querySelector("h3").innerText.toLowerCase();
        card.style.display = name.includes(input) ? "block" : "none";
    });
}

// Load customers when the page loads
document.addEventListener("DOMContentLoaded", loadCustomers);
