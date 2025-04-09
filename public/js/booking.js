document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("booking-form");
    const bookingDate = document.getElementById("bookingDate");
    const deliveryDate = document.getElementById("deliveryDate");
    const dateError = document.getElementById("dateError");

    // Set the min date to today for the booking date
    const today = new Date().toISOString().split("T")[0];
    bookingDate.setAttribute("min", today);
    deliveryDate.setAttribute("min", today);

    // Ensure delivery date is after booking date
    bookingDate.addEventListener("change", () => {
        deliveryDate.value = ""; // Reset delivery date when booking date changes
        deliveryDate.setAttribute("min", bookingDate.value);
    });

    form.addEventListener("submit", async (event) => {
        event.preventDefault(); // Prevent default submission

        const fullName = document.getElementById("fullName").value;
        const email = document.getElementById("email").value;
        const numberOfChicks = document.getElementById("numberOfChicks").value;
        const birdType = document.getElementById("birdType").value;
        const bookingDateValue = bookingDate.value;
        const deliveryDateValue = deliveryDate.value;

        // Date Validation
        if (bookingDateValue < today) {
            dateError.textContent = "Booking date cannot be in the past.";
            dateError.style.display = "block";
            return; // Stop submission
        } else if (deliveryDateValue <= bookingDateValue) {
            dateError.textContent = "Delivery date must be after the booking date.";
            dateError.style.display = "block";
            return; // Stop submission
        } else {
            dateError.style.display = "none"; // Hide error if valid
        }

        const requestData = { 
            fullName, 
            email, 
            numberOfChicks, 
            birdType, 
            bookingDate: bookingDateValue, 
            deliveryDate: deliveryDateValue 
        };

        try {
            const response = await fetch("http://localhost:5000/bookings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestData),
            });

            const data = await response.json();
            if (response.ok) {
                console.log("✅ Response OK. Data returned:", data); // Debug here
                alert("Booking successful! Redirecting to confirmation page.");
                
                // Check if we have the required data
                if (!data.bookingId) {
                    console.error("⚠️ bookingId is missing from response:", data);
                    alert("Booking created but booking ID is missing from server response.");
                    return;
                }

                // Redirect to confirmation page with booking ID
                window.location.href = `confirmation-page.html?bookingId=${data.bookingId}`;
            } else {
                alert("Error: " + (data.message || "Unknown error occurred"));
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Something went wrong. Please try again.");
        }
    });
});
