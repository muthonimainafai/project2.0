document.addEventListener("DOMContentLoaded", async function () {
    const urlParams = new URLSearchParams(window.location.search);
    const bookingId = urlParams.get("bookingId");
    const numberOfChicks = urlParams.get("numberOfChicks") || 0;
    const deliveryDetailsDiv = document.getElementById("deliveryDetails");
    const suggestionsDiv = document.getElementById("suggestions");
    const locationSearch = document.getElementById("location-search");
    const confirmButton = document.getElementById("confirm-btn");
    const responseMessage = document.getElementById("response-message");

    // Constants for pricing
    const PRICE_PER_CHICK = 100; // 100 shillings per chick

    let bookingAddress = "";
    let availableLocations = [];

    // Predefined list of towns in the coastal region of Kenya
    const coastalTowns = [
        "Mombasa", "Diani", "Ukunda", "Kilifi", "Malindi", "Watamu", "Lamu",
        "Garsen", "Voi", "Taveta", "Wundanyi", "Mtwapa", "Bamburi", "Changamwe",
        "Likoni", "Mpeketoni", "Kwale", "Msambweni", "Mariakani"
    ];

    if (bookingId) {
        try {
            const response = await fetch(`http://localhost:5000/bookings/${bookingId}`);
            const bookingData = await response.json();

            if (response.ok) {
                bookingAddress = bookingData.address;
                availableLocations = bookingData.availableLocations || coastalTowns; // Use predefined towns if no locations in DB

                let locationOptions = `<p><strong>Available Locations:</strong></p><ul>`;
                availableLocations.forEach(location => {
                    locationOptions += `<li class="location-option" onclick="selectLocation('${location}')">${location}</li>`;
                });
                locationOptions += `</ul>`;

                // Display the details
                deliveryDetailsDiv.innerHTML = `
                    <p><strong>Delivery Address:</strong> ${bookingAddress}</p>
                    <p><strong>Delivery Date:</strong> ${bookingData.deliveryDate}</p>
                    ${locationOptions}
                `;
            } else {
                alert("Booking not found.");
            }
        } catch (error) {
            console.error("Error fetching booking:", error);
        }
    } else {
        alert("Booking ID is missing.");
    }

    // Function to filter and display suggestions
    function showSuggestions(query) {
        suggestionsDiv.innerHTML = "";
        if (!query) {
            suggestionsDiv.style.display = "none";
            return;
        }

        const filteredLocations = coastalTowns.filter(town => 
            town.toLowerCase().includes(query.toLowerCase())
        );

        if (filteredLocations.length > 0) {
            filteredLocations.forEach(location => {
                const div = document.createElement("div");
                div.classList.add("suggestion-item");
                div.textContent = location;
                div.onclick = () => selectLocation(location);
                suggestionsDiv.appendChild(div);
            });
            suggestionsDiv.style.display = "block";
        } else {
            suggestionsDiv.style.display = "none";
        }
    }

    // Event listeners for the search input
    locationSearch.addEventListener("input", (e) => {
        showSuggestions(e.target.value);
    });

    locationSearch.addEventListener("focus", () => {
        showSuggestions(locationSearch.value);
    });

    // Close suggestions when clicking outside
    document.addEventListener("click", (e) => {
        if (!locationSearch.contains(e.target) && !suggestionsDiv.contains(e.target)) {
            suggestionsDiv.style.display = "none";
        }
    });

    // Keyboard navigation
    locationSearch.addEventListener("keydown", (e) => {
        const suggestions = suggestionsDiv.getElementsByClassName("suggestion-item");
        let currentIndex = -1;

        for (let i = 0; i < suggestions.length; i++) {
            if (suggestions[i].classList.contains("active")) {
                currentIndex = i;
                break;
            }
        }

        if (e.key === "ArrowDown") {
            e.preventDefault();
            if (currentIndex < suggestions.length - 1) {
                if (currentIndex >= 0) {
                    suggestions[currentIndex].classList.remove("active");
                }
                suggestions[currentIndex + 1].classList.add("active");
            }
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            if (currentIndex > 0) {
                suggestions[currentIndex].classList.remove("active");
                suggestions[currentIndex - 1].classList.add("active");
            }
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (currentIndex >= 0) {
                selectLocation(suggestions[currentIndex].textContent);
            }
        }
    });

    // Function to select a location
    function selectLocation(location) {
        locationSearch.value = location;
        suggestionsDiv.style.display = "none";
        locationSearch.focus();
    }

    // Function to calculate total price
    function calculateTotalPrice(numChicks) {
        return numChicks * PRICE_PER_CHICK;
    }

    // Function to format currency
    function formatCurrency(amount) {
        return `KSh ${amount.toLocaleString()}`;
    }

    // Function to confirm selected location
    function confirmLocation() {
        console.log("Confirm button clicked"); // Debug log
        const selectedLocation = locationSearch.value.trim();
        
        console.log("Selected location:", selectedLocation); // Debug log

        if (!selectedLocation) {
            alert("Please select or enter a delivery location.");
            return;
        }

        // Check if the selected location is valid
        const isValidLocation = selectedLocation === bookingAddress || 
                              coastalTowns.includes(selectedLocation);
        
        console.log("Is valid location:", isValidLocation); // Debug log

        if (isValidLocation) {
            // Get the delivery date
            const deliveryDate = urlParams.get("deliveryDate") || 
                               new Date(Date.now() + 86400000).toLocaleDateString();
            
            console.log("Delivery date:", deliveryDate); // Debug log
            
            // Create the confirmation message with animation
            responseMessage.innerHTML = `
                <div class="confirmation-icon">✅</div>
                <div class="confirmation-text">
                    <strong>Booking Confirmed!</strong><br>
                    Your delivery location has been set to: <strong>${selectedLocation}</strong>
                </div>
                <div class="delivery-time">
                    Delivery will be made on ${deliveryDate} at 8:00 AM
                </div>
            `;
            
            // Add the success class to trigger the animation
            responseMessage.classList.add("success");
            
            // Scroll the message into view
            responseMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            
            console.log("Confirmation message displayed"); // Debug log
        } else {
            alert("❌ Error: Selected location is not valid for this booking. Please choose a valid location.");
        }
    }

    // Ensure confirm button works
    if (confirmButton) {
        confirmButton.addEventListener("click", confirmLocation);
        console.log("Confirm button event listener added"); // Debug log
    } else {
        console.log("Confirm button not found"); // Debug log
    }
});
