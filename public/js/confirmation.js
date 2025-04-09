document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const bookingId = params.get("bookingId");

    const bookingDetailsContainer = document.getElementById("booking-details");
    const proceedPaymentBtn = document.getElementById("proceed-payment");

    // Constants for pricing
    const PRICE_PER_CHICK = 100; // 100 shillings per chick

    // Function to format currency
    function formatCurrency(amount) {
        return `KSh ${amount.toLocaleString()}`;
    }

    if (!bookingId) {
        bookingDetailsContainer.innerHTML = "<p>Invalid booking ID.</p>";
        return;
    }

    try {
        const response = await fetch(`http://localhost:5000/bookings/${bookingId}`);
        if (!response.ok) throw new Error("Failed to fetch booking details.");

        const booking = await response.json();

        // Calculate total price
        const totalAmount = booking.numberOfChicks * PRICE_PER_CHICK;

        // Display booking details with payment information
        bookingDetailsContainer.innerHTML = `
            <div class="booking-info">
                <h3>Booking Details</h3>
                <p><strong>Full Name:</strong> ${booking.fullName}</p>
                <p><strong>Email:</strong> ${booking.email}</p>
                <p><strong>Number of Chicks:</strong> ${booking.numberOfChicks}</p>
                <p><strong>Bird Type:</strong> ${booking.birdType}</p>
                <p><strong>Booking Date:</strong> ${new Date(booking.bookingDate).toDateString()}</p>
                <p><strong>Delivery Date:</strong> ${new Date(booking.deliveryDate).toDateString()}</p>
            </div>
            <div class="payment-info">
                <h3>Payment Details</h3>
                <p><strong>Price per Chick:</strong> ${formatCurrency(PRICE_PER_CHICK)}</p>
                <p><strong>Number of Chicks:</strong> ${booking.numberOfChicks}</p>
                <p class="total-amount"><strong>Total Amount:</strong> ${formatCurrency(totalAmount)}</p>
            </div>
        `;

        // Store booking details in localStorage for payment processing
        const bookingDetails = {
            bookingId: bookingId,
            fullName: booking.fullName,
            email: booking.email,
            numberOfChicks: booking.numberOfChicks,
            birdType: booking.birdType,
            bookingDate: booking.bookingDate,
            deliveryDate: booking.deliveryDate,
            totalAmount: totalAmount
        };

        localStorage.setItem("bookingDetails", JSON.stringify(bookingDetails));

        // Ensure the button exists before adding an event listener
        if (proceedPaymentBtn) {
            proceedPaymentBtn.addEventListener("click", () => {
                // Pass booking details as URL parameters
                const params = new URLSearchParams({
                    bookingId: bookingId,
                    numberOfChicks: booking.numberOfChicks,
                    amount: totalAmount
                });
                window.location.href = `payment.html?${params.toString()}`; // Redirect to payment page with parameters
            });
        }

    } catch (error) {
        bookingDetailsContainer.innerHTML = `<p>Error: ${error.message}</p>`;
    }
});
