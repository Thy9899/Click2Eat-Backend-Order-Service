const mongoose = require("mongoose");

const OrderItemsSchema = new mongoose.Schema(
  {
    order_id: {
      type: String,
      required: true,
    },
    product_id: {
      type: String,

      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    unit_price: {
      type: Number,
      required: true,
    },
    total_price: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);
module.exports = mongoose.model("OrderItems", OrderItemsSchema);
