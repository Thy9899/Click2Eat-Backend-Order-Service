const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    customer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    items: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "OrderItems",
      },
    ],
    shipping_address: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      city: { type: String, required: true },
      location: { type: String }, // lat,lng
    },
    total_price: {
      type: Number,
      required: true,
    },
    unit_price: {
      type: Number,
      required: true,
    },
    delivery: {
      type: Number,
      default: 2,
    },
    payment_method: {
      type: String,
      enum: ["delivery", "pickup"],
      required: true,
    },
    payment_status: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },
    completed: {
      type: Boolean,
      default: false,
    },
    deliveryStartTime: Date,
    deliveryDuration: Number, // optional: can store duration in minutes
    pay_by: String,
    payment_date: Date,
    confirmed_by: String,
    cancelled_by: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);
