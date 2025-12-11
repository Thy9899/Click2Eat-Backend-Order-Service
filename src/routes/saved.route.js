const express = require("express");
const multer = require("multer");
const savedController = require("../controller/saved.controller");
const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

// Use memory storage (no physical file created)
const upload = multer({ storage: multer.memoryStorage() });

// GET all
router.get("/saved", authenticateToken, savedController.getAll);

// CREATE
router.post(
  "/saved",
  authenticateToken,
  upload.single("image"),
  savedController.create
);

// UPDATE
router.put(
  "/saved/:id",
  authenticateToken,
  upload.single("image"),
  savedController.update
);

// DELETE
router.delete("/saved/:id", authenticateToken, savedController.remove);

module.exports = router;
