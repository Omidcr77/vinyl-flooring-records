// Load selected customer details
function loadCustomerDetails() {
    let customer = JSON.parse(localStorage.getItem("selectedCustomer"));
    if (!customer) return;

    // Set Profile Info
    document.getElementById("profileImg").src = customer.img;
    document.getElementById("customerName").textContent = customer.name;
    document.getElementById("customerBalance").textContent = 
        `💰 حساب باقی‌مانده: ${customer.balance.toLocaleString()} دالر`;
    document.getElementById("customerPhone").textContent = `📞 شماره تلفون: ${customer.phone}`;

    // Populate Vinyl Table
    let vinylList = document.getElementById("vinylList");
    vinylList.innerHTML = "";
    customer.vinyls.forEach(v => {
        let row = document.createElement("tr");
        row.innerHTML = `
            <td>${v.name || 'N/A'}</td>
            <td>${v.type}</td>
            <td>${v.color}</td>
            <td>${v.length}</td>
            <td>${v.width}</td>
            <td>${v.entryDate}</td>
            <td><button class="delete-btn" onclick="deleteVinyl('${v.type}')">🗑️ حذف</button></td>
        `;
        vinylList.appendChild(row);
    });

    // Populate Receipts List
    let receiptList = document.getElementById("receiptList");
    receiptList.innerHTML = "";
    customer.receipts.forEach(r => {
        let li = document.createElement("li");
        li.innerHTML = `📅 ${r.date}: مبلغ <strong>${r.amount.toLocaleString()}</strong> دالر - ${r.details || ''}`;
        receiptList.appendChild(li);
    });

    // Ensure all modals are hidden on page load
    document.querySelectorAll(".modal").forEach(modal => {
        modal.style.display = "none";
    });
}

// Function to add a new receipt
function addReceipt() {
    let customer = JSON.parse(localStorage.getItem("selectedCustomer"));
    if (!customer) return;

    let newReceipt = {
        date: document.getElementById("receiptDate").value,
        amount: parseFloat(document.getElementById("receiptAmount").value),
        details: document.getElementById("receiptDetails").value
    };

    customer.receipts.push(newReceipt);
    localStorage.setItem("selectedCustomer", JSON.stringify(customer));
    loadCustomerDetails();
    closeModal('receiptModal');
}

// Function to add new balance
function addBalance() {
    let customer = JSON.parse(localStorage.getItem("selectedCustomer"));
    if (!customer) return;

    let newBalance = parseFloat(document.getElementById("balanceAmount").value);
    let billNumber = document.getElementById("billNumber").value;
    let purchaseDate = document.getElementById("purchaseDate").value;

    customer.balance += newBalance; // Update balance
    customer.vinyls.push({ 
        name: `Purchase - ${billNumber}`, 
        type: "N/A", 
        color: "N/A", 
        length: "N/A", 
        width: "N/A", 
        entryDate: purchaseDate 
    });

    localStorage.setItem("selectedCustomer", JSON.stringify(customer));
    loadCustomerDetails();
    closeModal('balanceModal');
}

// Function to delete a vinyl purchase
function deleteVinyl(vinylType) {
    let customer = JSON.parse(localStorage.getItem("selectedCustomer"));
    if (!customer) return;

    customer.vinyls = customer.vinyls.filter(v => v.type !== vinylType);
    localStorage.setItem("selectedCustomer", JSON.stringify(customer));
    loadCustomerDetails();
}

// Function to open a modal
function openModal(modalId) {
    let modal = document.getElementById(modalId);
    modal.style.display = "flex";
    setTimeout(() => {
        modal.classList.add("visible");
    }, 10);
}

// Function to close a modal
function closeModal(modalId) {
    let modal = document.getElementById(modalId);
    modal.classList.remove("visible");
    setTimeout(() => {
        modal.style.display = "none";
    }, 300);
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
            if (modal.style.display === "flex") {
                closeModal(modal.id);
            }
        });
    }
});

// Load data when page is opened
document.addEventListener("DOMContentLoaded", loadCustomerDetails);
