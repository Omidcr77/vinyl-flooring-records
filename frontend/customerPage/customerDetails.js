// Load selected customer details
function loadCustomerDetails() {
    let customer = JSON.parse(localStorage.getItem("selectedCustomer"));
    if (!customer) return;

    let balanceUSD = (customer.balance / 50000).toFixed(2); // Example conversion rate

    // Set Profile Info
    document.getElementById("profileImg").src = customer.img;
    document.getElementById("customerName").textContent = customer.name;
    document.getElementById("customerBalance").textContent = 
        `💰 حساب باقی‌مانده: ${customer.balance.toLocaleString()} دالر (${balanceUSD} دلار)`;
    document.getElementById("customerPhone").textContent = `📞 شماره تلفون: ${customer.phone}`;

    // Populate Vinyl List
    let vinylList = document.getElementById("vinylList");
    vinylList.innerHTML = "";
    customer.vinyls.forEach(v => {
        let li = document.createElement("li");
        li.innerHTML = `<strong>${v.type}</strong> - رنگ: ${v.color}, ${v.length} x ${v.width} - ورود: ${v.entryDate}`;
        vinylList.appendChild(li);
    });

    // Populate Receipts List
    let receiptList = document.getElementById("receiptList");
    receiptList.innerHTML = "";
    customer.receipts.forEach(r => {
        let li = document.createElement("li");
        li.innerHTML = `📅 ${r.date}: مبلغ <strong>${r.amount.toLocaleString()}</strong> دالر`;
        receiptList.appendChild(li);
    });
}

// Load data when page is opened
document.addEventListener("DOMContentLoaded", loadCustomerDetails);
