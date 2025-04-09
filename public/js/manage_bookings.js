document.addEventListener("DOMContentLoaded", async function () {
    try {
        const response = await fetch("/api/bookings");
        const data = await response.json();

        // Update the summary section
        document.getElementById("totalBookings").textContent = data.totalBookings;
        document.getElementById("pendingOrders").textContent = data.pendingOrders;
        document.getElementById("completedOrders").textContent = data.completedOrders;
        document.getElementById("paymentStatus").textContent = data.pendingPayments > 0 ? "Pending" : "All Paid";

        // Populate the table
        const tableBody = document.getElementById("bookingTableBody");
        tableBody.innerHTML = ""; // Clear existing data

        data.bookings.forEach((booking) => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${booking._id}</td>
                <td>${booking.fullName}</td>
                <td>${booking.email}</td>
                <td>${booking.numberOfChicks}</td>
                <td>${booking.birdType}</td>
                <td>${new Date(booking.bookingDate).toLocaleDateString()}</td>
                <td>${new Date(booking.deliveryDate).toLocaleDateString()}</td>
                <td>${booking.status}</td>
                <td>${booking.paymentStatus}</td>
                <td>
                    <button class="complete-btn" data-id="${booking._id}">Complete</button>
                    <button class="delete-btn" data-id="${booking._id}">Delete</button>
                </td>
            `;

            tableBody.appendChild(row);
        });

        // Add event listeners to buttons
        document.querySelectorAll(".complete-btn").forEach((btn) => {
            btn.addEventListener("click", async function () {
                const bookingId = this.getAttribute("data-id");
                await updateBookingStatus(bookingId, "completed");
            });
        });

        document.querySelectorAll(".delete-btn").forEach((btn) => {
            btn.addEventListener("click", async function () {
                const bookingId = this.getAttribute("data-id");
                await deleteBooking(bookingId);
            });
        });

    } catch (error) {
        console.error("Error fetching booking data:", error);
    }
});

// Function to update booking status
async function updateBookingStatus(bookingId, status) {
    try {
        await fetch(`/api/bookings/${bookingId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
        });
        alert("Booking updated successfully!");
        location.reload();
    } catch (error) {
        console.error("Error updating booking:", error);
    }
}

// Function to delete a booking
async function deleteBooking(bookingId) {
    if (confirm("Are you sure you want to delete this booking?")) {
        try {
            await fetch(`/api/bookings/${bookingId}`, {
                method: "DELETE",
            });
            alert("Booking deleted successfully!");
            location.reload();
        } catch (error) {
            console.error("Error deleting booking:", error);
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

function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.text("Bookings Report", 20, 10);

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

    doc.save("Bookings_Report.pdf");
}
