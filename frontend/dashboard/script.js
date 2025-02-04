document.getElementById("year").textContent = new Date().getFullYear();

// Attach event listeners to handle redirection when each link is clicked

document.getElementById('customar').addEventListener('click', function(event) {
    event.preventDefault();
    // Replace with your actual URL for Customar Records
    window.location.href = 'customar.html';
  });
  
  document.getElementById('vinyl').addEventListener('click', function(event) {
    event.preventDefault();
    // Replace with your actual URL for Vily Records
    window.location.href = '/index.html';
  });
  
  document.getElementById('sold').addEventListener('click', function(event) {
    event.preventDefault();
    // Replace with your actual URL for Sold Records
    window.location.href = '';
  });
  