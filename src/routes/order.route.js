const express = require("express");
const multer = require("multer");
const orderController = require("../controller/order.controller");
const authenticateToken = require("../middleware/authMiddleware");
const path = require("path");

const router = express.Router();

/// ===============================================
// MULTER CONFIGURATION (ORDER PAYMENT IMAGE)
// ===============================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "./public/Images"),
  filename: (req, file, cb) =>
    cb(
      null,
      Date.now() + "-" + file.fieldname + path.extname(file.originalname)
    ),
});
const upload = multer({ storage });

/// ===============================================
// CUSTOMER ORDER ROUTES
// ===============================================

/**
 * Get All Orders of Logged-in Customer
 * @route GET /api/orders
 * @access Customer
 */
router.get("/", authenticateToken, orderController.GetAll);

/**
 * Explanation (Frontend):
 * Used on Customer Order History Page
 * Frontend sends:
 * - No body (GET request)
 * Must include:
 * - Customer JWT token
 * Response:
 * - List of customer orders
 * - Order status
 * - Total amount
 * - Created date
 */

/**
 * Get Last Order of Logged-in Customer
 * @route GET /api/orders/last
 * @access Customer
 */
router.get("/last", authenticateToken, orderController.getLastOrder);

/**
 * Explanation (Frontend):
 * Used after Checkout Success Page
 * Frontend sends:
 * - No body (GET request)
 * Must include:
 * - Customer JWT token
 * Response:
 * - Most recent order details
 */

/**
 * Get Order By ID
 * @route GET /api/orders/:order_id
 * @access Customer
 */
router.get("/:order_id", authenticateToken, orderController.GetById);

/**
 * Explanation (Frontend):
 * Used on Order Detail Page
 * Frontend sends:
 * - Order ID as URL param
 * Must include:
 * - Customer JWT token
 * Response:
 * - Order details
 * - Order items
 * - Shipping address
 * - Payment method
 * - Order status
 */

/**
 * Create New Order
 * @route POST /api/orders
 * @access Customer
 */
router.post(
  "/",
  authenticateToken,
  upload.single("image"),
  orderController.create
);

/**
 * Explanation (Frontend):
 * Used on Checkout Page
 * Frontend sends:
 * FormData:
 * - items (array)
 * - shipping_address
 * - payment_method
 * - image (optional – payment slip / proof)
 * Must include:
 * - Customer JWT token
 * Image:
 * - Uploaded to server (/public/Images)
 * Response:
 * - Created order information
 * - Order ID
 * - Initial order status (pending)
 */

/**
 * Pay Order
 * @route POST /api/orders/pay/:order_id
 * @access Customer
 */
router.post("/pay/:order_id", authenticateToken, orderController.payOrder);

/**
 * Explanation (Frontend):
 * Used on Order Payment Page
 * Frontend sends:
 * - Order ID as URL param
 * - Payment data (if required)
 * Must include:
 * - Customer JWT token
 * Response:
 * - Payment confirmation
 * - Updated payment status
 */

/**
 * Complete Order
 * @route PUT /api/orders/complete/:order_id
 * @access Customer
 */
router.put(
  "/complete/:order_id",
  authenticateToken,
  orderController.completeOrder
);

/**
 * Explanation (Frontend):
 * Used on Order Received / Completed Button
 * Frontend sends:
 * - Order ID as URL param
 * Must include:
 * - Customer JWT token
 * Response:
 * - Updated order status (completed)
 * - Completion timestamp
 */

module.exports = router;
