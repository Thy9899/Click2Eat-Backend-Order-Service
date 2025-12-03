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

// 👉 NEW: GET order by ID (admin only)
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.user?.is_admin) {
      return res.status(403).json({ error: "Access denied" });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid order ID" });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json({ success: true, order });
  } catch (err) {
    console.error("getOrderById Error:", err);
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

// ─────────────── PAY ORDER ───────────────
const payOrder = async (req, res) => {
  try {
    const { order_id } = req.params;

    // Check if the ID is valid
    if (!mongoose.Types.ObjectId.isValid(order_id)) {
      return res.status(400).json({ error: "Invalid order ID" });
    }

    let query = { _id: order_id };

    // If customer making request → limit to their own order
    if (req.customer) {
      query.customer_id = req.customer.customer_id;
    }

    // Admin can pay ANY order → no customer filter
    // (Admin info is req.user based on your code)

    const order = await Order.findOne(query);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found or not allowed to access",
      });
    }

    if (order.payment_status === "paid") {
      return res.status(400).json({
        success: false,
        error: "Order already paid",
      });
    }

    // Update payment
    order.payment_status = "paid";
    order.payment_date = new Date();

    // Record who paid
    // if (req.user?.is_admin) {
    //   order.paid_by_admin = req.user.username;
    // } else {
    //   order.paid_by_customer = req.customer.customer_id;
    // }
    if (req.user?.is_admin) {
      order.pay_by = `admin:${req.user.username}`;
    } else {
      order.pay_by = `customer:${req.customer.customer_id}`;
    }

    await order.save();

    res.json({
      success: true,
      message: "Payment successful",
      order,
    });
  } catch (err) {
    console.error("Pay Order Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getAllOrders,
  getOrderById,
  confirmOrder,
  cancelOrder,
  payOrder,
};
