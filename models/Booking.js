const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  quantity: { type: Number, required: true },
  birdType: { type: String, required: true },
  bookingDate: { type: Date, default: Date.now },
  deliveryDate: { type: Date, required: true }
});

const Booking = mongoose.model("Booking", bookingSchema);
module.exports = Booking;
