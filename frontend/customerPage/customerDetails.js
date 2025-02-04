// Load selected customer details
function loadCustomerDetails() {
    let customer = JSON.parse(localStorage.getItem("selectedCustomer"));
    if (!customer) return;

    let balanceUSD = (customer.balance / 50000).toFixed(2); // Convert to USD

    // Set Profile Info
    if (document.getElementById("profileImg")) {
        document.getElementById("profileImg").src = customer.img;
    }
    if (document.getElementById("customerName")) {
        document.getElementById("customerName").textContent = customer.name;
    }
    if (document.getElementById("customerBalance")) {
        document.getElementById("customerBalance").textContent = `💰 حساب باقی‌مانده: ${balanceUSD} دالر`;
    }
    if (document.getElementById("customerPhone")) {
        document.getElementById("customerPhone").textContent = `📞 شماره تلفون: ${customer.phone}`;
    }

    // Populate Vinyl List
    let vinylList = document.getElementById("vinylList");
    if (vinylList) {
        vinylList.innerHTML = "";
        customer.vinyls.forEach(v => {
            let li = document.createElement("li");
            li.innerHTML = `<strong>${v.type}</strong> - رنگ: ${v.color}, ${v.length} x ${v.width} - ورود: ${v.entryDate}`;
            vinylList.appendChild(li);
        });
    }

    // Populate Receipts List
    let receiptList = document.getElementById("receiptList");
    if (receiptList) {
        receiptList.innerHTML = "";
        customer.receipts.forEach(r => {
            let amountUSD = (r.amount / 50000).toFixed(2); // Convert to USD
            let li = document.createElement("li");
            li.innerHTML = `📅 ${r.date}: مبلغ <strong>${amountUSD}</strong> دالر`;
            receiptList.appendChild(li);
        });
    }
}

// Load data when page is opened
document.addEventListener("DOMContentLoaded", loadCustomerDetails);
