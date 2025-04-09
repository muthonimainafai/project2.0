document.getElementById("adminLoginForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch("http://localhost:5000/api/admin/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem("adminToken", data.token); // Store token
            window.location.href = "admin_dashboard.html"; // Redirect to dashboard
        } else {
            document.getElementById("errorMessage").textContent = data.message;
        }
    } catch (error) {
        console.error("Error:", error);
        document.getElementById("errorMessage").textContent = "Something went wrong.";
    }
});
// Clear form fields on page load (fixes autofill retention)
setTimeout(() => {
    document.getElementById("email").value = "";
    document.getElementById("password").value = "";
}, 500);
