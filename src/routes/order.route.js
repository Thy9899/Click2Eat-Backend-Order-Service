const express = require("express");
const multer = require("multer");
const orderController = require("../controller/order.controller");
const authenticateToken = require("../middleware/authMiddleware");
const path = require("path");
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "./public/Images"),
  filename: (req, file, cb) =>
    cb(
      null,
      Date.now() + "-" + file.fieldname + path.extname(file.originalname)
    ),
});
const upload = multer({ storage });

router.get("/", authenticateToken, orderController.GetAll);
router.get("/last", authenticateToken, orderController.getLastOrder);
router.get("/:order_id", authenticateToken, orderController.GetById);

router.post(
  "/",
  authenticateToken,
  upload.single("image"),
  orderController.create
);
router.post("/pay/:order_id", authenticateToken, orderController.payOrder);
router.put(
  "/complete/:order_id",
  authenticateToken,
  orderController.completeOrder
);

module.exports = router;
