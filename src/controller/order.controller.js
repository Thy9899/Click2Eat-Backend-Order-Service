const Order = require("../models/order.model");
const OrderItems = require("../models/order_items.model");

/**
 * Get all orders of the logged-in customer
 * @route GET /api/orders
 * @access Customer
 */
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
/* Explanation:
 • Retrieves all orders belonging to the logged-in customer
 • Orders are sorted by newest first
 • Returns order list or server error */

/**
 * Get order by ID
 * @route GET /api/orders/:order_id
 * @access Customer
 */
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
/* Explanation:
 • Retrieves a single order by its ID
 • Ensures the order belongs to the logged-in customer
 • Includes order items using populate
 • Returns order details or error */

/**
 * Create a new order
 * @route POST /api/orders
 * @access Customer
 */
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

    let total_price = 0;
    let unit_price = 0;
    let delivery = 2;

    items.forEach((item) => {
      total_price += item.unit_price * item.quantity + delivery;
      unit_price += item.unit_price;
    });

    const order = await Order.create({
      customer_id,
      items: [],
      total_price,
      unit_price,
      delivery,
      shipping_address,
      payment_method,
      payment_status: "pending",
      payment_date: new Date(),
    });

    const orderItemsBulk = items.map((item) => ({
      order_id: order._id,
      product_id: item.product_id,
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.unit_price * item.quantity,
    }));

    const createdItems = await OrderItems.insertMany(orderItemsBulk);

    order.items = createdItems.map((i) => i._id);
    await order.save();

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order,
    });
  } catch (err) {
    console.error("Create Order Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
/* Explanation:
 • Validates order input data
 • Calculates total price and delivery fee
 • Creates order and related order items
 • Returns created order or error */

/**
 * Pay an order
 * @route PUT /api/orders/pay/:order_id
 * @access Customer
 */
const payOrder = async (req, res) => {
  try {
    const { order_id } = req.params;
    const customer_id = req.customer.customer_id;

    const order = await Order.findOne({ _id: order_id, customer_id });
    if (!order)
      return res.status(404).json({ error: "Order not found for this user" });

    if (order.payment_status === "paid")
      return res.status(400).json({ error: "Order already paid" });

    order.payment_status = "paid";
    order.payment_date = new Date();
    order.pay_by = `customer:${req.customer.username}`;
    await order.save();

    res.json({ success: true, message: "Payment successful", order });
  } catch (err) {
    console.error("Pay Order Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
/* Explanation:
 • Allows customer to pay for their order
 • Prevents double payment
 • Records payment date and customer info
 • Returns updated order */

/**
 * Get last order
 * @route GET /api/orders/last
 * @access Customer
 */
const getLastOrder = async (req, res) => {
  try {
    const customer_id = req.customer.customer_id;

    const order = await Order.find({ customer_id })
      .sort({ createdAt: -1 })
      .limit(1)
      .populate("items");

    if (!order || order.length === 0)
      return res.status(404).json({ message: "No orders found" });

    res.json({ success: true, order: order[0] });
  } catch (err) {
    console.error("GetLastOrder Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
/* Explanation:
 • Retrieves the most recent order of the customer
 • Uses sorting and limit to get last order
 • Returns order or error */

/**
 * Mark order as completed
 * @route PUT /api/orders/complete/:order_id
 * @access Customer
 */
const completeOrder = async (req, res) => {
  try {
    const { order_id } = req.params;
    const customer_id = req.customer.customer_id;

    const order = await Order.findOne({ _id: order_id, customer_id });
    if (!order) return res.status(404).json({ error: "Order not found" });

    if (order.completed === true)
      return res.status(400).json({ error: "Order already completed" });

    order.completed = true;
    order.status = "completed";
    await order.save();

    res.json({ success: true, message: "Order marked as completed", order });
  } catch (err) {
    console.error("CompleteOrder Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
/* Explanation:
 • Allows customer to mark order as completed
 • Prevents duplicate completion
 • Updates order status and completion flag */

module.exports = {
  GetAll,
  GetById,
  create,
  payOrder,
  getLastOrder,
  completeOrder,
};
