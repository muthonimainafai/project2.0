const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const nodemailer = require('nodemailer');


dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public")); // Serve frontend files from the "public" folder

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/chick_booker", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));

// Define User Schema
const userSchema = new mongoose.Schema({
    fullName: String,
    email: { type: String, unique: true, required: true },
    password: String,
    address: String
});
const User = mongoose.model("User", userSchema);

// Define Booking Schema
const bookingSchema = new mongoose.Schema({
    fullName: String,
    email: { type: String, required: true },
    numberOfChicks: Number,
    birdType: String,
    bookingDate: Date,
    deliveryDate: Date,
    status: { type: String, enum: ["pending", "completed"], default: "pending" },
    paymentStatus: { type: String, enum: ["pending", "paid", "failed"], default: "pending" }
});
const Booking = mongoose.model("Booking", bookingSchema);

//booking route
app.post("/bookings", async (req, res) => {
    try {
        const { fullName, email, numberOfChicks, birdType, bookingDate, deliveryDate } = req.body;

        console.log("Booking request received:", req.body); // Debugging

        if (!email) {
            return res.status(400).json({ message: "Email is required for booking." });
        }

        // Ensure email is checked in lowercase (avoiding case-sensitive mismatches)
        const user = await User.findOne({ email: email.toLowerCase().trim() });

        console.log("User lookup result:", user); // Debugging

        if (!user) {
            return res.status(400).json({ message: "You must be registered to make a booking. Please sign up first." });
        }

        // Save booking details
        const newBooking = new Booking({
            fullName,
            email: email.toLowerCase().trim(), // Store email in lowercase to prevent duplicates
            numberOfChicks,
            birdType,
            bookingDate,
            deliveryDate
        });

        await newBooking.save();
        console.log("📤 Sending response:", {
            bookingId: newBooking._id,
            bookingDetails: newBooking
        });
        res.json({ 
            message: "Booking confirmed!", 
            bookingId: newBooking._id,
            bookingDetails: newBooking 
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error saving booking. Try again!" });
    }
});

// Fetch All Bookings (API Route for manage_bookings.js)
app.get("/api/bookings", async (req, res) => {
    try {
        const bookings = await Booking.find(); // Fetch all bookings

        const totalBookings = bookings.length;
        const pendingOrders = bookings.filter(b => b.status === "pending").length;
        const completedOrders = bookings.filter(b => b.status === "completed").length;
        const pendingPayments = bookings.filter(b => b.paymentStatus === "pending").length;

        res.json({
            totalBookings,
            pendingOrders,
            completedOrders,
            pendingPayments,
            bookings
        });
    } catch (error) {
        console.error("Error fetching bookings:", error);
        res.status(500).json({ message: "Error fetching bookings." });
    }
});

// Signup Route
app.post("/signup", async (req, res) => {
    try {
        console.log("Received signup request:", req.body); // Debugging

        const { fullName, email, password, address } = req.body;
        if (!fullName || !email || !password || !address) {
            return res.status(400).json({ message: "All fields are required." });
        }

        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already registered. Please login." });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new User({ fullName, email, password: hashedPassword, address });
        await newUser.save();

        res.json({ message: "Signup successful! You can now log in." });
    } catch (err) {
        console.error("Signup error:", err); // Debugging
        res.status(500).json({ message: "Error signing up. Try again!" });
    }
});

// Login Route
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if the user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found. Please sign up first." });
        }

        // Compare the provided password with the stored hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials. Please try again." });
        }

        res.json({ message: "Login successful!", user: { fullName: user.fullName, email: user.email } });
    } catch (err) {
        res.status(500).json({ message: "Error logging in. Try again!" });
    }
});

// Get Booking Details
app.get("/bookings/:id", async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ message: "Booking not found!" });
        }
        res.json(booking);
    } catch (err) {
        res.status(500).json({ message: "Error retrieving booking details." });
    }
});

// Update Booking Status
app.put("/bookings/:id", async (req, res) => {
    try {
        const { status } = req.body;
        await Booking.findByIdAndUpdate(req.params.id, { status });
        res.json({ message: "Booking status updated successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error updating booking status" });
    }
});

//delete booking
app.delete("/bookings/:id", async (req, res) => {
    try {
        await Booking.findByIdAndDelete(req.params.id);
        res.json({ message: "Booking deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting booking" });
    }
});


//admin_dasboard route
app.get("/admin_dashboard", async (req, res) => {
    try {
        const totalBookings = await Booking.countDocuments();
        const pendingOrders = await Booking.countDocuments({ status: "pending" });
        const completedOrders = await Booking.countDocuments({ status: "completed" });
        const pendingPayments = await Booking.countDocuments({ paymentStatus: "pending" });
        const paidOrders = await Booking.countDocuments({ paymentStatus: "paid" });
        const failedPayments = await Booking.countDocuments({ paymentStatus: "failed" });

        res.json({
            total_bookings: totalBookings,
            pending_orders: pendingOrders,
            completed_orders: completedOrders,
            pending_payments: pendingPayments,
            paid_orders: paidOrders,
            failed_payments: failedPayments
        });
    } catch (err) {
        console.error("Error fetching admin dashboard data:", err);
        res.status(500).json({ message: "Error fetching data" });
    }
});

//edit user
app.put("/api/users/:id", async (req, res) => {
    try {
        const { fullName, email, address } = req.body;
        await User.findByIdAndUpdate(req.params.id, { fullName, email, address });
        res.json({ message: "User updated successfully" });
    } catch (err) {
        console.error("Error updating user:", err);
        res.status(500).json({ message: "Error updating user" });
    }
});

//delete user
app.delete("/api/users/:id", async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: "User deleted successfully" });
    } catch (err) {
        console.error("Error deleting user:", err);
        res.status(500).json({ message: "Error deleting user" });
    }
});

// fetch manage_users data
app.get("/api/users", async (req, res) => {
    try {
        const users = await User.find({}, "fullName email address");
        res.json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Error fetching users." });
    }
});

// Fetch summary data for Manage_Users page

app.get("/api/users/summary", async (req, res) => {
    try {
        const totalBookings = await Booking.countDocuments();
        const pendingOrders = await Booking.countDocuments({ status: "pending" });
        const completedOrders = await Booking.countDocuments({ status: "completed" });
        const pendingPayments = await Booking.countDocuments({ paymentStatus: "pending" });
        const paidOrders = await Booking.countDocuments({ paymentStatus: "paid" });
        const failedPayments = await Booking.countDocuments({ paymentStatus: "failed" });

        res.json({
            totalBookings,
            pendingOrders,
            completedOrders,
            pending: pendingPayments,
            paid: paidOrders,
            failed: failedPayments
        });
    } catch (error) {
        console.error("Error fetching user summary data:", error);
        res.status(500).json({ message: "Error fetching summary data." });
    }
});


// Delete a user by ID
app.delete("/api/users/:id", async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: "User deleted successfully." });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ message: "Error deleting user." });
    }
});


// Define Admin Schema
const adminSchema = new mongoose.Schema({
    email: { type: String, unique: true, required: true },
    password: String
});
const Admin = mongoose.model("Admin", adminSchema);

// Ensure Admin Exists in the Database
async function createAdmin() {
    const existingAdmin = await Admin.findOne({ email: "faithmaina393@gmail.com" });
    if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash("3575", 10);
        const newAdmin = new Admin({ email: "faithmaina393@gmail.com", password: hashedPassword });
        await newAdmin.save();
        console.log("Admin user created!");
    }
}
createAdmin();

// Admin Login Route
app.post("/api/admin/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const admin = await Admin.findOne({ email });
        if (!admin) return res.status(401).json({ message: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

        const token = jwt.sign({ id: admin._id, email: admin.email }, "secretKey", { expiresIn: "1h" });
        res.json({ message: "Login successful", token });
    } catch (error) {
        console.error("Admin login error:", error);
        res.status(500).json({ message: "Error logging in" });
    }
});

// Middleware to Verify Admin Token
const verifyAdminToken = (req, res, next) => {
    const token = req.headers["authorization"];
    if (!token) return res.status(403).json({ message: "No token provided" });

    jwt.verify(token, "secretKey", (err, decoded) => {
        if (err) return res.status(401).json({ message: "Unauthorized" });
        req.adminId = decoded.id;
        next();
    });
};

// Protect Admin Dashboard Route
app.get("/api/admin/dashboard", verifyAdminToken, async (req, res) => {
    try {
        const totalBookings = await Booking.countDocuments();
        const pendingOrders = await Booking.countDocuments({ status: "pending" });
        const completedOrders = await Booking.countDocuments({ status: "completed" });
        const pendingPayments = await Booking.countDocuments({ paymentStatus: "pending" });
        const paidOrders = await Booking.countDocuments({ paymentStatus: "paid" });
        const failedPayments = await Booking.countDocuments({ paymentStatus: "failed" });

        res.json({
            totalBookings,
            pendingOrders,
            completedOrders,
            pendingPayments,
            paidOrders,
            failedPayments
        });
    } catch (error) {
        console.error("Error fetching admin dashboard data:", error);
        res.status(500).json({ message: "Error fetching data" });
    }
});

// Simulate Payment Route
app.post("/api/payments/simulate", async (req, res) => {
    try {
        const { bookingId, phoneNumber } = req.body;

        // Check if booking exists
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ message: "Booking not found!" });
        }

        // Simulate successful payment
        booking.paymentStatus = "paid";
        await booking.save();

        res.json({ message: "Payment successful!", phoneNumber });
    } catch (error) {
        console.error("Payment simulation error:", error);
        res.status(500).json({ message: "Error processing payment." });
    }
});

// define inventory schema
const inventorySchema = new mongoose.Schema({
    availableStock: { type: Number, required: true, default: 0 }
});
const Inventory = mongoose.model("Inventory", inventorySchema);

// Initialize inventory if not present
async function initializeInventory() {
    const existingInventory = await Inventory.findOne();
    if (!existingInventory) {
        await new Inventory({ availableStock: 5000 }).save();
        console.log("🔹 Inventory initialized with 5000 stock.");
    }
}
initializeInventory();

// API Routes

// Fetch current stock
app.get("/api/inventory", async (req, res) => {
    try {
        const inventory = await Inventory.findOne();
        res.json({ availableStock: inventory ? inventory.availableStock : 0 });
    } catch (error) {
        res.status(500).json({ message: "❌ Error fetching inventory" });
    }
});

// Update stock
app.put("/api/inventory/update", async (req, res) => {
    try {
        const { change } = req.body;
        if (typeof change !== "number") {
            return res.status(400).json({ message: "❌ Invalid change value" });
        }

        let inventory = await Inventory.findOne();
        if (!inventory) {
            inventory = new Inventory({ availableStock: change });
        } else {
            inventory.availableStock += change;
        }

        await inventory.save();
        res.json({ message: "✅ Stock updated successfully!", availableStock: inventory.availableStock });
    } catch (error) {
        res.status(500).json({ message: "❌ Error updating stock" });
    }
});

// Serve Static Files (For frontend)
app.use(express.static(__dirname + "/public")); // Ensure frontend is in 'public' folder

// Email transporter configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
    const { name, email, message } = req.body;

    try {
        // Email options
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER, // Send to yourself
            subject: `New Contact Form Message from ${name}`,
            text: `
                Name: ${name}
                Email: ${email}
                Message: ${message}
            `,
            replyTo: email
        };

        // Send email
        await transporter.sendMail(mailOptions);

        res.json({ success: true, message: 'Message sent successfully!' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ success: false, message: 'Failed to send message. Please try again.' });
    }
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
 