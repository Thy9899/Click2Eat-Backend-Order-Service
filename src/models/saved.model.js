const mongoose = require("mongoose");

const SavedSchema = new mongoose.Schema(
  {
    customer_id: {
      type: String,
      required: true,
    },
    product_id: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      maxlength: 100,
    },
    category: {
      type: String,
      required: true,
      maxlength: 100,
    },
    price: {
      type: Number,
      required: true,
    },
    image: {
      type: String,
      default: null,
    },
    image_public_id: {
      type: String,
      default: null,
    }, // Cloudinary deletion ID
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: false },
  }
);

module.exports = mongoose.model("Saved", SavedSchema);
