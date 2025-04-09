document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("signup-form");
    const heroSection = document.getElementById("hero");

   
    // Clear form fields on page load using timeout (fixes autofill issues)
    setTimeout(() => {
        document.getElementById("fullName").value = "";
        document.getElementById("email").value = "";
        document.getElementById("password").value = "";
        document.getElementById("address").value = "";
    }, 50);

    setTimeout(() => {
        document.getElementById("fullName").value = "";
        document.getElementById("email").value = "";
        document.getElementById("password").value = "";
        document.getElementById("address").value = "";
    }, 500);
    // clear input values when fields are focused
    document.querySelectorAll("input").forEach(input => {
        input.addEventListener("focus", () => {
            input.value = "";
        });
    });

    // List of background images
    const images = [
        '/images/bg3.jpg',
        '/images/bg13.jpg',
        '/images/bg10.jpg',
        '/images/bg11.jpg',
        '/images/bg12.jpg'
    ];

    let currentIndex = 0; // Start with the first image

    function changeBackground() {
        currentIndex = (currentIndex + 1) % images.length; // Loop back to the first image
        heroSection.style.backgroundImage = `url('${images[currentIndex]}')`;
    }

    // Change the background every 5 seconds (5000 milliseconds)
    setInterval(changeBackground, 5000);    

    // Handle form submission
    form.addEventListener("submit", async (event) => {
        event.preventDefault(); // Prevent page reload

        const fullName = document.getElementById("fullName").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();
        const address = document.getElementById("address").value.trim();

        // Validate if all fields are filled
        if (!fullName || !email || !password || !address) {
            alert("All fields are required.");
            return;
        }

        // Create the request payload correctly
        const requestData = { fullName, email, password, address };

        try {
            const response = await fetch("http://localhost:5000/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestData),
            });

            const data = await response.json();
            if (response.ok) {
                alert("Signup successful! Redirecting to login page.");

            // Clear form fields manually on page load
            form.reset();

                // Redirect to login page
                window.location.href = "index.html"; 
            } else {
                alert("Error: " + data.message);
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Something went wrong. Please try again.");
        }
    });
});
