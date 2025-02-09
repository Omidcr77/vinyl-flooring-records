const API_URL = "http://localhost:5000/api/customers"; // Ensure API URL is correctly defined

const socket = io("http://localhost:5000"); // Change to your backend URL

let customers = [];

let uploadedImagePath = ""; // Store uploaded image path before customer creation


// ✅ Listen for new customer added
socket.on("customerAdded", (newCustomer) => {
    customers.push(newCustomer);
    loadCustomers();
});

// ✅ Listen for customer balance updates
socket.on("balanceUpdated", (updatedCustomer) => {
    let index = customers.findIndex(c => c._id === updatedCustomer._id);
    if (index !== -1) {
        customers[index] = updatedCustomer;
        loadCustomers();
    }
});

// ✅ Listen for customer deletion
socket.on("customerDeleted", (customerId) => {
    customers = customers.filter(c => c._id !== customerId);
    loadCustomers();
});

// ✅ Variable to store selected customer
let selectedCustomerId = null;

// ✅ Function to delete a customer
async function deleteSelectedCustomer() {
    if (!selectedCustomerId) {
        alert("❌ لطفاً یک مشتری را انتخاب کنید.");
        return;
    }

    try {
        const response = await fetch(`http://localhost:5000/api/customers/${selectedCustomerId}`, {
            method: "DELETE"
        });

        if (!response.ok) throw new Error("❌ حذف مشتری انجام نشد.");

        // Emit deletion event
        socket.emit("deleteCustomer", selectedCustomerId);

        selectedCustomerId = null; // Reset selection
        loadCustomers();
        alert("✅ مشتری با موفقیت حذف شد!");

    } catch (error) {
        console.error("Error deleting customer:", error);
    }
}

// ✅ Function to update statistics
function updateStatistics() {
    let totalCustomers = customers.length;
    let totalBalance = customers.reduce((sum, customer) => sum + customer.balance, 0).toLocaleString();

    document.getElementById("totalCustomers").textContent = totalCustomers;
    document.getElementById("totalBalance").textContent = `${totalBalance} دالر`;
}

async function uploadProfilePicture(customerId) {
    try {
        const fileInput = document.getElementById("customerPic");
        if (fileInput.files.length === 0) {
            alert("❌ Please select a file to upload.");
            return;
        }

        const formData = new FormData();
        formData.append("profilePic", fileInput.files[0]);

        const response = await fetch(`http://localhost:5000/api/customers/${customerId}/upload`, {
            method: "POST",
            body: formData,
        });

        if (!response.ok) throw new Error("Failed to upload profile picture");

        const data = await response.json();
        console.log("✅ Image Uploaded:", data);

        // ✅ Update the image preview
        document.getElementById("profileImg").src = `http://localhost:5000${data.imagePath}`;

    } catch (error) {
        console.error("❌ Error uploading profile picture:", error);
        alert("Failed to upload profile picture.");
    }
}




// ✅ Add Customer with Uploaded Image
async function addCustomer() {
    try {
        // Step 1: Gather customer data from the form
        const customerData = {
            name: document.getElementById("customerName").value,
            phone: document.getElementById("customerPhone").value,
            address: document.getElementById("customerAddress").value,
            balance: parseFloat(document.getElementById("customerBalance").value),
        };

        // Step 2: Send request to create the customer first
        const response = await fetch("http://localhost:5000/api/customers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(customerData),
        });

        if (!response.ok) throw new Error("Failed to create customer");

        const newCustomer = await response.json();
        const customerId = newCustomer._id; // ✅ Get the newly created customer's ID
        console.log("✅ Customer Created:", newCustomer);

        // Step 3: Check if an image is selected and upload it
        const fileInput = document.getElementById("customerPic");
        if (fileInput.files.length > 0) {
            await uploadProfilePicture(customerId);
        }

        alert("✅ Customer added successfully!");
        window.location.reload(); // Refresh to update customer list

    } catch (error) {
        console.error("❌ Error adding customer:", error);
        alert("Failed to add customer.");
    }
}

// ✅ Function to load customers into the UI
async function loadCustomers() {
    try {
        const response = await fetch("http://localhost:5000/api/customers");
        if (!response.ok) throw new Error("❌ دریافت لیست مشتریان انجام نشد.");

        customers = await response.json();

        let customerGrid = document.getElementById("customerGrid");
        customerGrid.innerHTML = "";

        customers.forEach(customer => {
    let card = document.createElement("div");
    card.className = "customer-card";
    card.setAttribute("data-id", customer._id);
    
    // ✅ Ensure correct image path
    let imageUrl = customer.img 
        ? `http://localhost:5000/uploads/${customer.img}`
        : "assets/user.png"; // Default avatar

    card.innerHTML = `
        <img src="${imageUrl}" alt="${customer.name}" class="customer-avatar">
       <a href="customerDetails.html?id=${customer._id}" class="customer-link">
                            ${customer.name}
                        </a>
        <p><strong>📞 شماره تلفون:</strong> ${customer.phone}</p>
        <p><strong>📍 آدرس:</strong> ${customer.address}</p>
        <p><strong>💰 حساب:</strong> ${customer.balance.toLocaleString()} دالر</p>
        <button class="select-btn" onclick="selectCustomer('${customer._id}')">✔️ انتخاب</button>
    `;

    customerGrid.appendChild(card);
});


        updateStatistics();
    } catch (error) {
        console.error("Error loading customers:", error);
    }
}

// ✅ Function to select a customer
function selectCustomer(customerId) {
    selectedCustomerId = customerId;
}

// ✅ Function to open a modal
function openModal(modalId) {
    let modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = "flex"; // Show modal before animation
        setTimeout(() => {
            modal.classList.add("visible");
        }, 10);
    }
}

// ✅ Function to close a modal
function closeModal(modalId) {
    let modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove("visible");
        setTimeout(() => {
            modal.style.display = "none"; // Ensure it's hidden after animation
        }, 300);
    }
}

// ✅ Close modal when clicking outside
window.onclick = function(event) {
    let modals = document.querySelectorAll(".modal");
    modals.forEach(modal => {
        if (event.target === modal) {
            closeModal(modal.id);
        }
    });
};

// ✅ Close modal when pressing ESC key
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

// ✅ Search Customers
function searchCustomer() {
    let input = document.getElementById("searchInput").value.toLowerCase();
    let customerCards = document.querySelectorAll(".customer-card");

    customerCards.forEach(card => {
        let name = card.querySelector("h3").innerText.toLowerCase();
        card.style.display = name.includes(input) ? "block" : "none";
    });
}

// ✅ Load customers when the page loads
document.addEventListener("DOMContentLoaded", loadCustomers);
