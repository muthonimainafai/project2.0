document.addEventListener("DOMContentLoaded", () => {
    fetchStock();
});

async function fetchStock() {
    try {
        const response = await fetch("/api/inventory");
        const data = await response.json();
        document.getElementById("stock-count").textContent = data.availableStock;
    } catch (error) {
        console.error("❌ Error fetching stock:", error);
        document.getElementById("stock-count").textContent = "Error loading stock";
    }
}

async function updateStock(multiplier) {
    const changeValue = parseInt(document.getElementById("stock-change").value, 10) * multiplier;
    if (isNaN(changeValue)) {
        document.getElementById("response-message").textContent = "❌ Please enter a valid number";
        return;
    }

    try {
        const response = await fetch("/api/inventory/update", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ change: changeValue })
        });

        const data = await response.json();
        document.getElementById("response-message").textContent = data.message;
        document.getElementById("stock-count").textContent = data.availableStock;
    } catch (error) {
        console.error("❌ Error updating stock:", error);
        document.getElementById("response-message").textContent = "Error updating stock";
    }
}
