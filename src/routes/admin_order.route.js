const express = require("express");
const adminOrderController = require("../controller/admin_order.controller");
const authenticateTokenAdmin = require("../middleware/authMiddlewareAdmin");
const router = express.Router();

router.get("/", authenticateTokenAdmin, adminOrderController.getAllOrders);
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

module.exports = router;
