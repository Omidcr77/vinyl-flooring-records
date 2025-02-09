const API_URL = `http://localhost:5000/api/customers`;

// ✅ Get customer ID from URL
const urlParams = new URLSearchParams(window.location.search);
const customerId = urlParams.get("id");



// ✅ Load customer details from the backend
async function loadCustomerDetails() {
    try {
        const response = await fetch(`${API_URL}/${customerId}`);

        if (!response.ok) {
            throw new Error(`❌ Error ${response.status}: Failed to fetch customer details`);
        }

        const customer = await response.json();

        document.getElementById("profileImg").src = customer.img || "assets/user.png";
        document.getElementById("customerName").textContent = customer.name;
        document.getElementById("customerBalance").textContent = `💰 Balance: ${customer.balance.toLocaleString()} USD`;
        document.getElementById("customerPhone").textContent = customer.phone;
        document.getElementById("customerAddress").textContent = customer.address;

        populatePurchaseList(customer.purchases || []);
        populateReceiptList(customer.receipts || []);

    } catch (error) {
        console.error("❌ Fetch error:", error);
        alert("Failed to load customer data. Please try again later.");
    }
}





// ✅ Populate vinyl purchases
function populatePurchaseList(purchases) {
    let purchaseList = document.getElementById("vinylList"); // Reuse the table
    purchaseList.innerHTML = "";

    if (purchases.length === 0) {
        purchaseList.innerHTML = "<tr><td colspan='3'>❌ No Purchases Found</td></tr>";
        return;
    }

    purchases.forEach(p => {
        let formattedDate = p.date ? new Date(p.date).toLocaleDateString() : "N/A";
        let row = document.createElement("tr");
        row.innerHTML = `
            <td>${p.billNumber || 'N/A'}</td>
            <td>${formattedDate}</td>
            <td>${p.totalAmount.toLocaleString()} دالر</td>
        `;
        purchaseList.appendChild(row);
    });
}



// ✅ Populate receipts list
function populateReceiptList(receipts) {
    let receiptList = document.getElementById("receiptList");
    receiptList.innerHTML = "";

    if (receipts.length === 0) {
        receiptList.innerHTML = "<li>❌ No Receipts Found</li>";
        return;
    }

    receipts.forEach(r => {
        let formattedDate = r.date ? new Date(r.date).toLocaleDateString() : "N/A";
        let li = document.createElement("li");
        li.innerHTML = `📅 ${formattedDate}: مبلغ <strong>${r.amount.toLocaleString()}</strong> دالر - ${r.details || 'بدون توضیحات'}`;
        receiptList.appendChild(li);
    });

    // Hide all modals on page load
    document.querySelectorAll(".modal").forEach(modal => {
        modal.style.display = "none";
    });
}


// ✅ Add a new receipt and update balance
async function addReceipt() {
    try {
        let newReceipt = {
            date: document.getElementById("receiptDate").value,
            amount: parseFloat(document.getElementById("receiptAmount").value),
            details: document.getElementById("receiptDetails").value
        };

        const response = await fetch(`${API_URL}/${customerId}/receipts`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newReceipt)
        });

        if (!response.ok) throw new Error("Failed to add receipt");

        const updatedCustomer = await response.json();
        console.log("🔄 Updated Customer Data:", updatedCustomer); // Debugging Log

        // ✅ Update UI Balance
        document.getElementById("customerBalance").textContent =
            `💰 Balance: ${updatedCustomer.balance.toLocaleString()} USD`;

        // ✅ Refresh the receipts list
        populateReceiptList(updatedCustomer.receipts);

        closeModal('receiptModal');
    } catch (error) {
        console.error("❌ Error adding receipt:", error);
    }
}




// ✅ Add new balance (New Vinyl Purchase)
async function addPurchase() {
    try {
        let purchaseDate = document.getElementById("purchaseDate").value;
        let billNumber = document.getElementById("billNumber").value;
        let totalAmount = parseFloat(document.getElementById("balanceAmount").value);

        if (!purchaseDate || !billNumber || isNaN(totalAmount) || totalAmount <= 0) {
            alert("❌ لطفاً تمام فیلدها را به درستی پر کنید!");
            return;
        }

        let newPurchase = { date: purchaseDate, billNumber, totalAmount };

        const response = await fetch(`${API_URL}/${customerId}/purchases`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newPurchase)
        });

        if (!response.ok) throw new Error("Failed to add purchase");

        loadCustomerDetails();
        closeModal('balanceModal');

    } catch (error) {
        console.error("Error adding purchase:", error);
    }
}


// ✅ Delete a vinyl purchase
async function deleteVinyl(vinylId) {
    try {
        const response = await fetch(`${API_URL}/${customerId}/vinyls/${vinylId}`, {
            method: "DELETE"
        });

        if (!response.ok) throw new Error("Failed to delete vinyl");

    customer.vinyls = customer.vinyls.filter(v => v.type !== vinylType);
    localStorage.setItem("selectedCustomer", JSON.stringify(customer));
        loadCustomerDetails();
    } catch (error) {
        console.error("Error deleting vinyl:", error);
    }
}

// ✅ Ensure all modals are hidden when the page loads
function hideAllModals() {
    document.querySelectorAll(".modal").forEach(modal => {
        modal.style.display = "none";
        modal.classList.remove("visible");
    });
}

// ✅ Open Modal
function openModal(modalId) {
    let modal = document.getElementById(modalId);
    modal.style.display = "flex";
    setTimeout(() => {
        modal.classList.add("visible");
    }, 10);
}

// ✅ Close Modal
function closeModal(modalId) {
    let modal = document.getElementById(modalId);
    modal.classList.remove("visible");
    setTimeout(() => {
        modal.style.display = "none";
    }, 300);
}

// ✅ Close modal when clicking outside
window.onclick = function(event) {
    document.querySelectorAll(".modal").forEach(modal => {
        if (event.target === modal) {
            closeModal(modal.id);
        }
    });
};

// ✅ Close modal when pressing ESC key
document.addEventListener("keydown", function(event) {
    if (event.key === "Escape") {
        document.querySelectorAll(".modal").forEach(modal => {
            if (modal.style.display === "flex") {
                closeModal(modal.id);
            }
        });
    }
});

// ✅ Prevent modals from being open when page is refreshed
document.addEventListener("DOMContentLoaded", () => {
    hideAllModals();
    loadCustomerDetails();

    if (!customerId) {
        alert("❌ Customer ID not found!");
        window.history.back();
        return; // ✅ Stops further execution
    }
});
