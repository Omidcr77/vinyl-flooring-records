const API_URL = "http://localhost:5000/api/vinyl";
const SOLD_API_URL = "http://localhost:5000/api/sold"; 
const SELL_API_URL = "http://localhost:5000/api/sold/sell"; // ✅ Corrected Sell API URL
const socket = io("http://localhost:5000");

let editingVinylId = null; // Store the ID of the vinyl being edited


let deleteVinylId = null;
let sellingVinylId = null;

document.addEventListener("DOMContentLoaded", () => {

    document.addEventListener("DOMContentLoaded", function () {
        // Ensure the date picker library is loaded
        if (typeof $ !== "undefined" && $.fn.persianDatepicker) {
            $("#vinylEntryDate").persianDatepicker({
                format: "YYYY/MM/DD",  
                autoClose: true,        
                initialValue: false,    
                observer: true,
                calendar: {
                    persian: {
                        locale: 'fa',  
                        leapYearMode: 'algorithmic' 
                    }
                }
            });
    
            console.log("✅ Date Picker Initialized Successfully!");
        } else {
            console.error("❌ Persian Date Picker not loaded.");
        }
    });
    
    document.getElementById("year").textContent = new Date().getFullYear();
});

// Fetch and Display Vinyl Rolls
async function fetchVinylRolls(searchQuery = "") {
    try {
        let url = API_URL;
        if (searchQuery) {
            url += `?search=${encodeURIComponent(searchQuery)}`;
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch vinyl rolls.");

        const data = await response.json();
        let tableBody = document.getElementById("vinylTable");
        if (!tableBody) {
            console.error("❌ Error: Table body element not found.");
            return;
        }
        tableBody.innerHTML = "";
        

        if (data.length === 0) {
            // Show "Record Not Found!" message in a full-row colspan
            tableBody.innerHTML = `
                <tr>
                    <td colspan="8" class="no-record">⚠️ Record Not Found!</td>
                </tr>`;
            return;
        }

        data.forEach(roll => {
            let row = `<tr>
                <td>${roll.rollNumber}</td>
                <td>${roll.vinylName}</td>
                <td>${roll.type}</td>
                <td>${roll.color || 'N/A'}</td>
                <td>${roll.length}</td>
                <td>${roll.width}</td>
                <td>${new Date(roll.entryDate).toLocaleDateString()}</td>
                <td>
                    <div class="dropdown">
                        <button class="dropbtn" onclick="toggleDropdown(event, 'dropdown-${roll._id}')">⚙️ Actions</button>
                        <div class="dropdown-content" id="dropdown-${roll._id}">
                            <a href="#" onclick="openSellVinylModal('${roll._id}')">💰 Sell</a>
                            <a href="#" onclick="openDeleteModal('${roll._id}')">❌ Delete</a>
                            <a href="#" onclick="openEditVinylModal('${roll._id}')">✏️ Edit</a>
                        </div>
                    </div>
                </td>
            </tr>`;
            tableBody.innerHTML += row;
        });

    } catch (error) {
        console.error("Error fetching vinyl rolls:", error);
    }
}






// Function to trigger filtering
function filterVinyls() {
    const searchValue = document.getElementById("searchInput").value.trim();
    
    if (searchValue === "") {
        fetchVinylRolls(); // Reload all records if search is empty
        return;
    }

    fetchVinylRolls(searchValue);
}

// Function to toggle dropdown visibility
function toggleDropdown(event, id) {
    event.stopPropagation(); // Prevents clicks from closing immediately
    let dropdown = document.getElementById(id);
    
    // Close all other dropdowns before opening this one
    document.querySelectorAll('.dropdown-content').forEach(menu => {
        if (menu !== dropdown) menu.style.display = 'none';
    });

    // Toggle the dropdown visibility
    dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
}

// Close dropdown when clicking outside
document.addEventListener("click", function () {
    document.querySelectorAll('.dropdown-content').forEach(menu => {
        menu.style.display = 'none';
    });
});

// Prevent dropdown from closing when clicking inside
document.querySelectorAll('.dropdown-content').forEach(menu => {
    menu.addEventListener("click", function (event) {
        event.stopPropagation();
    });
});


// 🔍 Function to handle real-time search input changes
function handleSearchInput() {
    const query = document.getElementById("searchInput").value.trim();
    fetchVinylRolls(query); // ✅ Dynamically search and display results
}

// ✅ Attach search input event listener (real-time filtering)
document.getElementById("searchInput").addEventListener("input", handleSearchInput);

// ✅ Fetch records on page load (avoids duplicate onload calls)
document.addEventListener("DOMContentLoaded", () => {
    fetchVinylRolls();
});

// ✅ Listen for "Enter" key press in search input
document.getElementById("searchInput").addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        event.preventDefault(); // Prevent form submission
        handleSearchInput();
    }
});



// Open and Close Add Vinyl Modal
function openAddVinylModal() { document.getElementById("addVinylModal").style.display = "block"; }
function closeAddVinylModal() { document.getElementById("addVinylModal").style.display = "none"; }

// Add Vinyl Roll
async function addVinyl() {
    const entryDateInput = document.getElementById("vinylEntryDate").value;
    const entryDate = entryDateInput ? new Date(entryDateInput).toISOString() : new Date().toISOString();

    const newVinyl = {
        vinylName: document.getElementById("vinylName").value.trim(),
        type: document.getElementById("vinylType").value.trim(),
        color: document.getElementById("vinylColor").value.trim(),
        length: parseFloat(document.getElementById("vinylLength").value),
        width: parseFloat(document.getElementById("vinylWidth").value),
        entryDate: new Date(document.getElementById("vinylEntryDate").value).toISOString(),
        details: document.getElementById("vinylDetails").value.trim()
    };

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newVinyl)
        });

        if (!response.ok) throw new Error("Failed to add vinyl");

        fetchVinylRolls();
        socket.emit("newVinyl");
        closeAddVinylModal();
    } catch (error) {
        console.error("Error adding vinyl:", error);
        alert("Error: " + error.message);
    }
}

async function openEditVinylModal(vinylId) {
    try {
        // Fetch the existing record
        const response = await fetch(`${API_URL}/${vinylId}`);
        if (!response.ok) throw new Error("Failed to fetch vinyl details.");

        const vinyl = await response.json();
        editingVinylId = vinylId; // Store ID for updating

        // Populate modal fields
        document.getElementById("editVinylName").value = vinyl.vinylName;
        document.getElementById("editVinylType").value = vinyl.type;
        document.getElementById("editVinylColor").value = vinyl.color;
        document.getElementById("editVinylLength").value = vinyl.length;
        document.getElementById("editVinylWidth").value = vinyl.width;
        document.getElementById("editVinylEntryDate").value = new Date(vinyl.entryDate).toISOString().split("T")[0];

        // Show modal
        document.getElementById("editVinylModal").style.display = "block";

    } catch (error) {
        console.error("Error opening edit modal:", error);
        alert("Failed to fetch vinyl details.");
    }
}

// Close Edit Modal
function closeEditVinylModal() {
    document.getElementById("editVinylModal").style.display = "none";
}

async function updateVinyl() {
    if (!editingVinylId) {
        alert("No vinyl selected for updating.");
        return;
    }

    const updatedVinyl = {
        vinylName: document.getElementById("editVinylName").value.trim(),
        type: document.getElementById("editVinylType").value.trim(),
        color: document.getElementById("editVinylColor").value.trim(),
        length: parseFloat(document.getElementById("editVinylLength").value),
        width: parseFloat(document.getElementById("editVinylWidth").value),
        entryDate: document.getElementById("editVinylEntryDate").value
    };

    try {
        const response = await fetch(`${API_URL}/${editingVinylId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedVinyl)
        });

        if (!response.ok) throw new Error("Failed to update vinyl.");

        fetchVinylRolls(); // Refresh the records
        closeEditVinylModal(); // Close the modal
        socket.emit("updateVinyls"); // Notify frontend

    } catch (error) {
        console.error("Error updating vinyl:", error);
        alert("Error updating vinyl: " + error.message);
    }
}

function showNotification(message, isSuccess = true) {
    const notification = document.getElementById("notification");
    const messageText = document.getElementById("notification-message");

    // Update message and background color
    messageText.textContent = message;
    notification.style.backgroundColor = isSuccess ? "green" : "red";

    // Reset styles to make it visible
    notification.style.display = "block";
    notification.style.opacity = "1";
    notification.style.animation = "fadeIn 0.5s ease-in-out";

    // Hide after 3 seconds
    setTimeout(() => {
        notification.style.animation = "fadeOut 0.5s ease-in-out";
        setTimeout(() => {
            notification.style.display = "none";  // Hide after fade-out completes
            notification.style.opacity = "0";
        }, 500);
    }, 3000);
}


// Open and Close Delete Modal
function openDeleteModal(vinylId) { 
    deleteVinylId = vinylId;
    document.getElementById("deleteConfirmationModal").style.display = "block"; 
}
function closeDeleteModal() { document.getElementById("deleteConfirmationModal").style.display = "none"; }

// Confirm Delete Vinyl Roll
async function confirmDelete() {
    if (!deleteVinylId) return;

    try {
        const response = await fetch(`${API_URL}/${deleteVinylId}`, { method: "DELETE" });
        if (!response.ok) throw new Error("Failed to delete vinyl roll");
        showNotification("✅ Vinyl deleted successfully!", true);  // ✅ Show success notification

        fetchVinylRolls();
        socket.emit("newVinyl");
    } catch (error) {
        showNotification("❌ Failed to delete vinyl!", false);  // ✅ Show failure notification

        console.error("Error deleting vinyl:", error);
    }

    closeDeleteModal();
}

// Open and Close Sell Vinyl Modal
function openSellVinylModal(vinylId) {
    sellingVinylId = vinylId;
    document.getElementById("sellVinylModal").style.display = "block";
}
function closeSellVinylModal() { document.getElementById("sellVinylModal").style.display = "none"; }

// Sell Vinyl Roll (Fixed)
async function sellVinyl() {
    const customerName = document.getElementById("customerName").value.trim();
    const soldDate = document.getElementById("soldDate").value || new Date().toISOString();

    if (!sellingVinylId || !customerName) {
        alert("Please enter customer details.");
        return;
    }

    try {
        console.log("Selling Vinyl ID:", sellingVinylId);

        const response = await fetch(SELL_API_URL, {  // ✅ Now using the correct API URL
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ vinylId: sellingVinylId, customerName, soldDate })
        });

        const responseData = await response.json();
        console.log("📡 Server Response:", responseData);

        if (!response.ok) throw new Error(responseData.error || "Failed to mark vinyl as sold.");

        fetchVinylRolls();
        socket.emit("newVinyl");
        socket.emit("updateSoldRecords");
        closeSellVinylModal();
    } catch (error) {
        console.error("❌ Error selling vinyl:", error);
    }
}

// Fetch Sold Records
async function fetchSoldRecords() {
    try {
        const response = await fetch(SOLD_API_URL);

        console.log("📡 Raw Response:", response);

        const contentType = response.headers.get("content-type");
        if (!response.ok) {
            throw new Error(`Server Error: ${response.status} - ${response.statusText}`);
        }
        if (!contentType || !contentType.includes("application/json")) {
            throw new Error("Invalid response format (not JSON). Check API.");
        }

        const records = await response.json();
        console.log("✅ Sold Records:", records);
    } catch (error) {
        console.error("❌ Error fetching sold records:", error);
    }
}

// ✅ Listen for Real-Time Updates
socket.on("updateVinyls", fetchVinylRolls);
socket.on("updateSoldRecords", fetchSoldRecords);

// Attach event listeners
document.getElementById("confirmDeleteBtn").addEventListener("click", confirmDelete);

// ✅ Always Run `fetchVinylRolls()` on Page Load (Fix for missing records)
window.onload = () => {
    console.log("🚀 Page Loaded, Fetching Records...");
    fetchVinylRolls();
};
