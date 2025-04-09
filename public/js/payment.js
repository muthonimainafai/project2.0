document.addEventListener("DOMContentLoaded", async function () {
    const urlParams = new URLSearchParams(window.location.search);
    const bookingId = urlParams.get("bookingId");
    const payButton = document.getElementById("payButton");
    const paymentMessage = document.getElementById("paymentMessage");
    const bookingDetailsDiv = document.getElementById("bookingDetails");

    // Constants for pricing
    const PRICE_PER_CHICK = 100; // 100 shillings per chick

    // Function to format currency
    function formatCurrency(amount) {
        return `KSh ${amount.toLocaleString()}`;
    }

    // Try to get booking details from localStorage first
    let bookingData = JSON.parse(localStorage.getItem("bookingDetails"));

    // If no data in localStorage but we have bookingId, fetch from server
    if (!bookingData && bookingId) {
        try {
            const response = await fetch(`http://localhost:5000/bookings/${bookingId}`);
            if (!response.ok) throw new Error("Failed to fetch booking details");
            
            const booking = await response.json();
            const totalAmount = booking.numberOfChicks * PRICE_PER_CHICK;
            
            bookingData = {
                bookingId: bookingId,
                fullName: booking.fullName,
                email: booking.email,
                numberOfChicks: booking.numberOfChicks,
                birdType: booking.birdType,
                bookingDate: booking.bookingDate,
                deliveryDate: booking.deliveryDate,
                totalAmount: totalAmount
            };

            // Store in localStorage for future use
            localStorage.setItem("bookingDetails", JSON.stringify(bookingData));
        } catch (error) {
            console.error("Error fetching booking details:", error);
            bookingDetailsDiv.innerHTML = `<p style="color: red;">Error loading booking details. Please try again.</p>`;
            return;
        }
    }

    if (bookingData) {
        // Calculate total amount
        const totalAmount = bookingData.totalAmount || (bookingData.numberOfChicks * PRICE_PER_CHICK);

        bookingDetailsDiv.innerHTML = `
            <div class="booking-summary">
                <p><strong>Name:</strong> ${bookingData.fullName}</p>
                <p><strong>Email:</strong> ${bookingData.email}</p>
                <p><strong>Number of Chicks:</strong> ${bookingData.numberOfChicks}</p>
                <p><strong>Bird Type:</strong> ${bookingData.birdType}</p>
                <div class="price-details">
                    <p><strong>Price per Chick:</strong> ${formatCurrency(PRICE_PER_CHICK)}</p>
                    <p class="total-amount"><strong>Total Amount:</strong> ${formatCurrency(totalAmount)}</p>
                </div>
            </div>
        `;

        // Update pay button text to include amount
        payButton.textContent = `Pay ${formatCurrency(totalAmount)}`;
    } else {
        bookingDetailsDiv.innerHTML = `<p style="color: red;">No booking details found. Please start a new booking.</p>`;
        payButton.disabled = true;
    }

    payButton.addEventListener("click", async function () {
        const phoneNumber = document.getElementById("phoneNumber").value.trim();
        
        if (!phoneNumber.match(/^07\d{8}$/)) {
            alert("Please enter a valid phone number starting with 07 and 10 digits long.");
            return;
        }

        const originalButtonText = payButton.textContent;
        payButton.textContent = "Processing...";
        payButton.disabled = true;

        setTimeout(async function () {
            try {
                const response = await fetch("http://localhost:5000/api/payments/simulate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        bookingId: bookingData.bookingId, 
                        phoneNumber,
                        amount: bookingData.totalAmount
                    })
                });

                const result = await response.json();
                
                if (response.ok) {
                    payButton.textContent = "Paid ✓";
                    payButton.style.backgroundColor = "#28a745"; // Green color for success
                    paymentMessage.textContent = "Payment Successful! Redirecting to delivery page...";
                    paymentMessage.style.color = "green";

                    // Update payment status in the database
                    await fetch(`http://localhost:5000/bookings/${bookingData.bookingId}/update-payment`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ paymentStatus: "Paid" })
                    });

                    localStorage.removeItem("bookingDetails");
                    
                    // Redirect to the delivery page after successful payment
                    setTimeout(function () {
                        window.location.href = `/delivery.html?bookingId=${bookingData.bookingId}`;
                    }, 2000); // Redirect after 2 seconds
                } else {
                    paymentMessage.textContent = result.message;
                    paymentMessage.style.color = "red";
                    payButton.textContent = originalButtonText;
                    payButton.disabled = false;
                }
            } catch (error) {
                console.error("Payment error:", error);
                paymentMessage.textContent = "Payment failed. Please try again.";
                paymentMessage.style.color = "red";
                payButton.textContent = originalButtonText;
                payButton.disabled = false;
            }
        }, 3000); // Simulate 3-second delay
    });
}); 
