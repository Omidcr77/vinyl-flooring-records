// Search Function
function searchCustomer() {
    let input = document.getElementById("searchInput").value.toLowerCase();
    let table = document.getElementById("customerTable");
    let rows = table.getElementsByTagName("tr");

    for (let i = 0; i < rows.length; i++) {
        let cells = rows[i].getElementsByTagName("td");
        let found = false;

        for (let j = 0; j < cells.length; j++) {
            if (cells[j].innerText.toLowerCase().includes(input)) {
                found = true;
                break;
            }
        }

        rows[i].style.display = found ? "" : "none";
    }
}

// Future Functionality (Add Customer)
document.querySelector(".add-btn").addEventListener("click", function() {
    alert("این ویژگی در حال توسعه است.");
});
