require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const connectDB = require("./src/utils/db");
const orderRoutes = require("./src/routes/order.route");
const adminOrderRoutes = require("./src/routes/admin_order.route");

const app = express();

app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

// Connect DB
connectDB().catch((err) => {
  console.error("❌ Failed to connect to MongoDB:", err);
  process.exit(1);
});

// Static folder for images
app.use("/Images", express.static("public/Images"));

// Routes
app.use("/api/order/admin", adminOrderRoutes); // Admin first to avoid conflict
app.use("/api/order", orderRoutes); // Customer routes

const PORT = process.env.PORT || 5005;
app.listen(PORT, () => console.log(`✅ Order service running on port ${PORT}`));
