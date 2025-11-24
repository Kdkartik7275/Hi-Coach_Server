const mongoose = require("mongoose");

const bookingSchema = mongoose.Schema(
    {
        slot: { type: String, required: true },

        date: { type: Date, required: true },

        studentId: { type: String, required: true },

        coachId: { type: String, required: true },

        programId: { type: mongoose.Schema.Types.ObjectId, ref: "TrainingProgram", required: true },

        paymentType: {
            type: String,
            enum: ["per_session", "full_advance"],
            required: true,
        },

        paymentStatus: {
            type: String,
            enum: ["pending", "paid", "refunded"],
            default: "pending",
        },

        amountPaid: {
            type: Number,
            default: 0,
        },

        status: {
            type: String,
            enum: ["upcoming", "ongoing", "completed", "cancelled"],
            default: "upcoming",
        },

        cancellationReason: { type: String },

        notes: { type: String },

    },
    { timestamps: true }
);

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
