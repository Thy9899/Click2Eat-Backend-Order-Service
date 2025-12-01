const mongoose = require("mongoose");
const Order = require("../models/order.model");

// GET all orders (admin only)
const getAllOrders = async (req, res) => {
  try {
    if (!req.user?.is_admin) {
      return res.status(403).json({ error: "Access denied" });
    }

    const list = await Order.find().sort({ _id: -1 });
    res.json({ success: true, list });
  } catch (err) {
    console.error("getAllOrders Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// CONFIRM order
const confirmOrder = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid order ID" });
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { status: "confirmed", by_admin: req.user.username },
      { new: true }
    );

    if (!order) return res.status(404).json({ error: "Order not found" });

    res.json({ success: true, message: "Order confirmed", order });
  } catch (err) {
    console.error("confirmOrder Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// CANCEL order
const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid order ID" });
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { status: "cancelled", by_admin: req.user.username },
      { new: true }
    );

    if (!order) return res.status(404).json({ error: "Order not found" });

    res.json({ success: true, message: "Order cancelled", order });
  } catch (err) {
    console.error("cancelOrder Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { getAllOrders, confirmOrder, cancelOrder };
