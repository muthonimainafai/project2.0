document.addEventListener("DOMContentLoaded", function () {
    fetchUsers(); // Fetch users
    fetchSummaryData(); // Fetch summary statistics
});

let allUsers = []; // Array to store all users

// Function to fetch user data
async function fetchUsers() {
    try {
        const response = await fetch("http://localhost:5000/api/users");
        allUsers = await response.json(); // Store users globally

        displayUsers(allUsers); // Display all users initially
    } catch (error) {
        console.error("Error fetching users:", error);
    }
}

// Fetch summary data (total bookings, orders, payments)
async function fetchSummaryData() {
    try {
        const response = await fetch("http://localhost:5000/api/users/summary");
        const data = await response.json();

        document.getElementById("totalBookings").textContent = data.totalBookings;
        document.getElementById("pendingOrders").textContent = data.pendingOrders;
        document.getElementById("completedOrders").textContent = data.completedOrders;
        
        // Fix: Accessing paymentStatus object correctly
        document.getElementById("paymentStatus").textContent = 
            `${data.paymentStatus.paid} Paid, ${data.paymentStatus.pending} Pending, ${data.paymentStatus.failed} Failed`;
    } catch (error) {
        console.error("Error fetching summary data:", error);
    }
}

// Function to display users (filtered or full list)
function displayUsers(users) {
    const tableBody = document.getElementById("usersTable");
    tableBody.innerHTML = ""; // Clear previous data

    if (users.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="4">No users found.</td></tr>`;
        return;
    }

    users.forEach(user => {
        const row = `<tr>
            <td>${user.fullName}</td>
            <td>${user.email}</td>
            <td>${user.address}</td>
            <td>
                <button onclick="editUser('${user._id}')">Edit</button>
                <button onclick="deleteUser('${user._id}')">Delete</button>
            </td>
        </tr>`;
        tableBody.innerHTML += row;
    });
}

// Function to search users by email when the Search button is clicked
function searchUsers() {
    const query = document.getElementById("searchInput").value.toLowerCase().trim();
    
    if (query === "") {
        alert("Please enter an email to search.");
        return;
    }

    const filteredUsers = allUsers.filter(user => user.email.toLowerCase().includes(query));
    
    if (filteredUsers.length > 0) {
        displayUsers(filteredUsers);
    } else {
        alert("No users found with the provided email.");
        displayUsers([]); // Show no users found message
    }
}

// Function to reset only the search input and restore all users
function resetSearch() {
    document.getElementById("searchInput").value = ""; // Clear search field
    displayUsers(allUsers); // Restore full user list
}

// Attach event listeners for buttons
document.getElementById("searchBtn").addEventListener("click", searchUsers);
document.getElementById("resetBtn").addEventListener("click", resetSearch);

// Delete User
async function deleteUser(userId) {
    if (confirm("Are you sure you want to delete this user?")) {
        try {
            await fetch(`http://localhost:5000/api/users/${userId}`, { method: "DELETE" });
            alert("User deleted successfully!");
            fetchUsers(); // Refresh the table
        } catch (error) {
            console.error("Error deleting user:", error);
        }
    }
}

// PDF Download Functionality
document.addEventListener("DOMContentLoaded", () => {
    const downloadBtn = document.getElementById("downloadPdfBtn");

    if (downloadBtn) {
        downloadBtn.addEventListener("click", generatePDF);
    }
});

// Generate PDF Report
function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.text("Customers Report", 20, 10);

    let table = document.querySelector("table");
    let rows = table.querySelectorAll("tr");
    let data = [];

    rows.forEach((row) => {
        let rowData = [];
        row.querySelectorAll("th, td").forEach((cell) => {
            rowData.push(cell.innerText);
        });
        data.push(rowData);
    });

    doc.autoTable({
        head: [data[0]], 
        body: data.slice(1),
        startY: 20
    });

    doc.save("Customers_Report.pdf");
}  
