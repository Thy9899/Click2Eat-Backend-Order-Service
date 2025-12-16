const mongoose = require("mongoose");
const Order = require("../models/order.model");
const Customer = require("../models/customer.model");

/* ============================================================
   GET ALL ORDERS (Admin Only)
   ------------------------------------------------------------
   Purpose: Retrieve a list of all orders in the system.
   Access: Admin only (checked via req.user.is_admin)
   Response: JSON with success status and list of orders
============================================================ */
const getAllOrders = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user?.is_admin)
      return res.status(403).json({ error: "Access denied" });

    // Fetch all orders sorted by newest first
    const list = await Order.find().sort({ _id: -1 });
    res.json({ success: true, list });
  } catch (err) {
    console.error("getAllOrders Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

/* ============================================================
   GET ORDER BY ID (Admin Only)
   ------------------------------------------------------------
   Purpose: Retrieve details of a single order by its ID
   Access: Admin only
   Input: Order ID in request parameters
   Response: JSON with success status and order object
============================================================ */
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    // Check admin access
    if (!req.user?.is_admin)
      return res.status(403).json({ error: "Access denied" });

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ error: "Invalid order ID" });

    // Fetch order, populate items AND customer_id
    const order = await Order.findById(id)
      .populate("items")
      .populate("customer_id"); // <--- correct field name

    if (!order) return res.status(404).json({ error: "Order not found" });

    // Access customer email
    const customerEmail = order.customer_id?.email || null;

    res.json({ success: true, order, customerEmail });
  } catch (err) {
    console.error("getOrderById Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

/* ============================================================
   CONFIRM ORDER
   ------------------------------------------------------------
   Purpose: Change order status to "confirmed" and record
            which admin confirmed it
   Input: Order ID in request parameters
   Response: JSON with success message and updated order
============================================================ */
const confirmOrder = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ error: "Invalid order ID" });

    // Update order status to "confirmed" and record admin
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

/* ============================================================
   CANCEL ORDER
   ------------------------------------------------------------
   Purpose: Change order status to "cancelled" and record
            which admin cancelled it
   Input: Order ID in request parameters
   Response: JSON with success message and updated order
============================================================ */
const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ error: "Invalid order ID" });

    // Update order status to "cancelled" and record admin
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

/* ============================================================
   PAY ORDER (Admin Only)
   ------------------------------------------------------------
   Purpose: Mark an order as paid, record payment date and
            admin who processed payment
   Input: Order ID in request parameters
   Response: JSON with success message and updated order
============================================================ */
const payOrder = async (req, res) => {
  try {
    const { order_id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(order_id))
      return res.status(400).json({ error: "Invalid order ID" });

    const order = await Order.findById(order_id);
    if (!order) return res.status(404).json({ error: "Order not found" });

    // Prevent double payment
    if (order.payment_status === "paid")
      return res.status(400).json({ error: "Order already paid" });

    // Update payment info
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
