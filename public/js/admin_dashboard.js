// Function to fetch and update admin dashboard stats
function fetchDashboardData() {
    fetch('/admin_dashboard')
    .then(response => response.json())
    .then(data => {
        // Update the HTML with fetched data
        document.getElementById("totalBookings").textContent = data.total_bookings;
        document.getElementById("pendingOrders").textContent = data.pending_orders;
        document.getElementById("completedOrders").textContent = data.completed_orders;
        document.getElementById("pendingPayments").textContent = data.pending_payments;
        document.getElementById("paidOrders").textContent = data.paid_orders;
        document.getElementById("failedPayments").textContent = data.failed_payments;
    })
    .catch(error => console.error("Error fetching admin dashboard data:", error));
}

// Run when the page loads
document.addEventListener("DOMContentLoaded", fetchDashboardData);
