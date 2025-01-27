const SOLD_API_URL = "http://localhost:5000/api/sold/"; // ✅ Correct API URL
const socket = io("http://localhost:5000"); // ✅ Ensure Socket.io is connected


// year
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("year").textContent = new Date().getFullYear();
});


// 🔄 Function to Fetch and Display Sold Vinyl Records
async function fetchSoldRecords(query = "") {
    try {
        let url = SOLD_API_URL;
        if (query.trim()) url += `/search?query=${encodeURIComponent(query)}`;

        console.log(`📡 Fetching from: ${url}`);
        const response = await fetch(url);

        if (!response.ok) throw new Error(`Server Error: ${response.status} - ${response.statusText}`);
        const records = await response.json();
        console.log("✅ Sold Records:", records);

        let tableBody = document.getElementById("soldRecordsTable");
        if (!tableBody) {
            console.error("❌ Error: Table body element not found.");
            return;
        }

        // ✅ Clear existing rows
        tableBody.innerHTML = "";

        // ✅ Show "No Records" message if empty
        if (records.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="9">No matching sold records found</td></tr>`;
            return;
        }

        // ✅ Append each record to the table
        records.forEach((record, index) => {
            let soldDateFormatted = record.soldDate ? new Date(record.soldDate).toLocaleDateString() : "Unknown Date";
            let entryDateFormatted = record.entryDate ? new Date(record.entryDate).toLocaleDateString() : "Unknown Date";
            let customerName = record.customerName || "Unknown Customer";

            let row = `
            <tr>
                <td>${index + 1}</td>
                <td>${customerName}</td>
                <td>${record.vinylName}</td>
                <td>${record.type}</td>
                <td>${record.color}</td>
                <td>${record.length}</td>
                <td>${record.width}</td>
                <td>${entryDateFormatted}</td>
                <td>${soldDateFormatted}</td>
            </tr>`;
            tableBody.innerHTML += row;
        });

        // ✅ Enable Download Button After Data Loads
        document.getElementById("downloadPdfBtn").disabled = false;

    } catch (error) {
        console.error("❌ Error fetching sold records:", error);
    }
}


// 🔍 Function to handle real-time search input changes
function handleSearchInput() {
    const query = document.getElementById("searchInput").value.trim();
    
    if (query === "") {
        fetchSoldRecords(); // ✅ If input is empty, load all records
    } else {
        fetchSoldRecords(query);
    }
}

// ✅ Attach event listeners
document.addEventListener("DOMContentLoaded", () => {
    fetchSoldRecords(); // ✅ Fetch all records on page load

    // ✅ Listen for "Enter" key press in search input
    document.getElementById("searchInput").addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault(); // Prevent form submission
            handleSearchInput();
        }
    });

    // ✅ Trigger search as user types (Instant search)
    document.getElementById("searchInput").addEventListener("input", handleSearchInput);

    // ✅ Listen for real-time updates via Socket.io
    socket.on("updateSoldRecords", () => {
        console.log("🔄 New sale detected, updating records...");
        fetchSoldRecords();
    });
});

// ✅ Go Back to Main Dashboard
function goBack() {
    window.location.href = "../index.html";
}
function downloadTableAsPDF() {
    const headers = Array.from(document.querySelectorAll("th")).map(header => ({ text: header.innerText, bold: true, fillColor: '#007BFF', color: 'white' }));
    const data = Array.from(document.querySelectorAll("tbody tr")).map(row => 
        Array.from(row.querySelectorAll("td")).map(cell => cell.innerText)
    );

    const docDefinition = {
        content: [
            { text: 'رکوردهای فروخته شده وینیل', alignment: 'center', fontSize: 16, bold: true, margin: [0, 10] },
            {
                table: {
                    headerRows: 1,
                    widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
                    body: [headers, ...data]
                }
            }
        ],
        defaultStyle: {
            font: 'Roboto'
        }
    };

    pdfMake.createPdf(docDefinition).download("Sold_Vinyl_Records.pdf");
}

document.getElementById("downloadPdfBtn").addEventListener("click", downloadTableAsPDF);
