const mongoose = require("mongoose");
const Order = require("../models/order.model");

// GET all orders (admin)
const getAllOrders = async (req, res) => {
  try {
    if (!req.user?.is_admin)
      return res.status(403).json({ error: "Access denied" });

    const list = await Order.find().sort({ _id: -1 });
    res.json({ success: true, list });
  } catch (err) {
    console.error("getAllOrders Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET order by ID (admin)
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.user?.is_admin)
      return res.status(403).json({ error: "Access denied" });
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ error: "Invalid order ID" });

    const order = await Order.findById(id).populate("items");
    if (!order) return res.status(404).json({ error: "Order not found" });

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
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ error: "Invalid order ID" });

    const order = await Order.findByIdAndUpdate(
      id,
      {
        status: "confirmed",
        confirmed_by: req.user.username,
        deliveryStartTime: new Date(),
      },
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
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ error: "Invalid order ID" });

    const order = await Order.findByIdAndUpdate(
      id,
      { status: "cancelled", cancelled_by: req.user.username },
      { new: true }
    );

    if (!order) return res.status(404).json({ error: "Order not found" });

    res.json({ success: true, message: "Order cancelled", order });
  } catch (err) {
    console.error("cancelOrder Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// PAY order (admin)
const payOrder = async (req, res) => {
  try {
    const { order_id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(order_id))
      return res.status(400).json({ error: "Invalid order ID" });

    const order = await Order.findById(order_id);
    if (!order) return res.status(404).json({ error: "Order not found" });

    if (order.payment_status === "paid")
      return res.status(400).json({ error: "Order already paid" });

    order.payment_status = "paid";
    order.payment_date = new Date();
    order.pay_by = `admin:${req.user.username}`;
    await order.save();

    res.json({ success: true, message: "Payment successful", order });
  } catch (err) {
    console.error("payOrder Error:", err);
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
