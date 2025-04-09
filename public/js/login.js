document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("login-form");
    
      // Clear form fields on page load (fixes autofill retention)
      setTimeout(() => {
        document.getElementById("email").value = "";
        document.getElementById("password").value = "";
    }, 50);

    setTimeout(() => {
        document.getElementById("email").value = "";
        document.getElementById("password").value = "";
    }, 500);
    
      // Clear input values when fields are focused
      document.querySelectorAll("input").forEach(input => {
        input.addEventListener("focus", () => {
            input.value = "";
        });
    });

    form.addEventListener("submit", async (event) => {
        event.preventDefault(); // Prevent page reload

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();

        // Validate if all fields are filled
        if (!email || !password) {
            alert("Both email and password are required.");
            return;
        }

        // Create the request payload correctly
        const requestData = { email, password };

        try {
            const response = await fetch("http://localhost:5000/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestData),
            });

            const data = await response.json();
            if (response.ok) {
                alert("Login successful! Redirecting to booking.");

                // **Reset the form fields after successful login**
                form.reset();

                // Redirect to booking page
                window.location.href = "booking-page.html"; 
            } else {
                alert("Error: " + data.message);
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Something went wrong. Please try again.");
        }
    });
});
