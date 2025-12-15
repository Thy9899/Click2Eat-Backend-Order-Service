const express = require("express");
const adminOrderController = require("../controller/admin_order.controller");
const authenticateTokenAdmin = require("../middleware/authMiddlewareAdmin");
const router = express.Router();

router.get("/", authenticateTokenAdmin, adminOrderController.getAllOrders);
router.get("/:id", authenticateTokenAdmin, adminOrderController.getOrderById);
router.put(
  "/confirm/:id",
  authenticateTokenAdmin,
  adminOrderController.confirmOrder
);
router.put(
  "/cancel/:id",
  authenticateTokenAdmin,
  adminOrderController.cancelOrder
);
router.post(
  "/pay/:order_id",
  authenticateTokenAdmin,
  adminOrderController.payOrder
);

module.exports = router;
