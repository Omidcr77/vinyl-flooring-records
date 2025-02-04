// Determine the correct path to `sidebar.html` based on the current location
let sidebarPath = window.location.pathname.includes("customerPage") ? "../sidebar.html" : "sidebar.html";

fetch(sidebarPath)
    .then(response => response.text())
    .then(data => {
        document.getElementById("sidebar-container").innerHTML = data;

        // Highlight the active page
        let links = document.querySelectorAll(".sidebar nav a");
        links.forEach(link => {
            if (window.location.href.includes(link.getAttribute("href"))) {
                link.classList.add("active");
            }
        });
    })
    .catch(error => console.error("Sidebar failed to load:", error));
