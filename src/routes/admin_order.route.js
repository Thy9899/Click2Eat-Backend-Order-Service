const express = require("express");
const adminOrderController = require("../controller/admin_order.controller");
const authenticateTokenAdmin = require("../middleware/authMiddlewareAdmin");

const router = express.Router();

/// ===============================================
// ADMIN ORDER MANAGEMENT
// All routes require admin authentication
// ===============================================

/**
 * Get All Orders
 * @route GET /api/admin/orders
 * @access Admin
 */
router.get("/", authenticateTokenAdmin, adminOrderController.getAllOrders);

/**
 * Explanation (Frontend):
 * Used on Admin Order Management Page
 * Frontend sends:
 * - No body (GET request)
 * Must include:
 * - Admin JWT token
 * Response:
 * - List of all orders
 * - Customer info
 * - Order status
 * - Total amount
 */

/**
 * Get Order By ID
 * @route GET /api/admin/orders/:id
 * @access Admin
 */
router.get("/:id", authenticateTokenAdmin, adminOrderController.getOrderById);

/**
 * Explanation (Frontend):
 * Used on Admin Order Detail Page
 * Frontend sends:
 * - Order ID as URL param
 * Must include:
 * - Admin JWT token
 * Response:
 * - Order details
 * - Ordered items
 * - Shipping address
 * - Payment method
 * - Current order status
 */

/**
 * Confirm Order
 * @route PUT /api/admin/orders/confirm/:id
 * @access Admin
 */
router.put(
  "/confirm/:id",
  authenticateTokenAdmin,
  adminOrderController.confirmOrder
);

/**
 * Explanation (Frontend):
 * Used on Admin Order Detail Page (Confirm button)
 * Frontend sends:
 * - Order ID as URL param
 * Must include:
 * - Admin JWT token
 * Response:
 * - Updated order status (confirmed)
 * - Confirmation message
 */

/**
 * Cancel Order
 * @route PUT /api/admin/orders/cancel/:id
 * @access Admin
 */
router.put(
  "/cancel/:id",
  authenticateTokenAdmin,
  adminOrderController.cancelOrder
);

/**
 * Explanation (Frontend):
 * Used on Admin Order Detail Page (Cancel button)
 * Frontend sends:
 * - Order ID as URL param
 * Must include:
 * - Admin JWT token
 * Response:
 * - Updated order status (cancelled)
 * - Cancellation reason (if implemented)
 */

/**
 * Pay Order (Admin)
 * @route POST /api/admin/orders/pay/:order_id
 * @access Admin
 */
router.post(
  "/pay/:order_id",
  authenticateTokenAdmin,
  adminOrderController.payOrder
);

/**
 * Explanation (Frontend):
 * Used on Admin Order Detail Page (Manual Payment)
 * Frontend sends:
 * - Order ID as URL param
 * - Optional payment info (if implemented)
 * Must include:
 * - Admin JWT token
 * Response:
 * - Payment confirmation
 * - Updated order payment status
 */

module.exports = router;
