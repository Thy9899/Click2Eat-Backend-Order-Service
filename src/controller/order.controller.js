const Order = require("../models/order.model");
const OrderItems = require("../models/order_items.model");

// ─────────────── GET ALL ORDERS ───────────────
const GetAll = async (req, res) => {
  try {
    const customer_id = req.customer.customer_id;
    const orders = await Order.find({ customer_id }).sort({ _id: -1 });
    res.json({ success: true, orders });
  } catch (err) {
    console.error("GetAll Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ─────────────── GET ORDER BY ID ───────────────
const GetById = async (req, res) => {
  try {
    const { order_id } = req.params;
    const customer_id = req.customer.customer_id;
    const order = await Order.findOne({ _id: order_id, customer_id }).populate(
      "items"
    );
    if (!order)
      return res.status(404).json({ error: "Order not found for this user" });
    res.json({ success: true, order });
  } catch (err) {
    console.error("GetById Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ─────────────── CREATE ORDER ───────────────
const create = async (req, res) => {
  try {
    const customer_id = req.customer.customer_id;
    const { items, shipping_address, payment_method } = req.body;

    if (!items || items.length === 0)
      return res.status(400).json({ error: "Items are required" });

    if (!shipping_address)
      return res.status(400).json({ error: "Shipping address required" });

    if (!["delivery", "pickup"].includes(payment_method))
      return res.status(400).json({ error: "Invalid payment method" });

    // Calculate totals
    let total_price = 0;
    let unit_price = 0;
    let delivery = 2; // flat delivery fee
    items.forEach((item) => {
      total_price += item.unit_price * item.quantity + delivery;
      unit_price += item.unit_price;
    });

    // Create Order
    const order = await Order.create({
      customer_id,
      total_price,
      unit_price,
      delivery,
      shipping_address,
      payment_method,
      payment_status: "pending",
      payment_date: new Date(),
    });

    // Create Order Items
    const orderItemsBulk = items.map((item) => ({
      order_id: order._id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.unit_price * item.quantity,
    }));
    const createdItems = await OrderItems.insertMany(orderItemsBulk);

    // Save item IDs in order
    order.items = createdItems.map((i) => i._id);
    await order.save();

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order: {
        order_id: order._id,
        total_price,
        unit_price,
        shipping_address,
        payment_method,
        items: createdItems,
      },
    });
  } catch (err) {
    console.error("Create Order Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ─────────────── PAY ORDER ───────────────
const payOrder = async (req, res) => {
  try {
    const { order_id } = req.params;
    const customer_id = req.customer.customer_id;

    // ensure user owns the order
    const order = await Order.findOne({ _id: order_id, customer_id });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found for this user",
      });
    }

    if (order.payment_status === "paid") {
      return res.status(400).json({
        success: false,
        error: "Order already paid",
      });
    }

    order.payment_status = "paid";
    order.payment_date = new Date();
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

// ─────────────── GET LAST ORDER ───────────────
const getLastOrder = async (req, res) => {
  try {
    const customer_id = req.customer.customer_id;
    const order = await Order.find({ customer_id })
      .sort({ createdAt: -1 })
      .limit(1)
      .populate("items");

    if (!order || order.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "No orders found" });

    res.json({ success: true, order: order[0] });
  } catch (err) {
    console.error("GetLastOrder Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { GetAll, GetById, create, payOrder, getLastOrder };
