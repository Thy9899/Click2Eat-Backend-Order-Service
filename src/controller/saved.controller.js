const Saved = require("../models/saved.model");
const cloudinary = require("../config/saved.config");

// Upload buffer to Cloudinary
const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: "saved_items" }, (error, result) => {
        if (error) reject(error);
        else resolve(result); // return full result including secure_url and public_id
      })
      .end(fileBuffer);
  });
};

// ───────────────────────────────
// GET ALL saved for one user
// ───────────────────────────────
const getAll = async (req, res) => {
  try {
    const customer_id = req.customer.customer_id;

    const list = await Saved.find({ customer_id }).sort({ _id: -1 });

    res.json({
      success: true,
      list: list.map((item) => ({
        ...item._doc,
        saved_id: item._id.toString(),
        image: item.image ?? null,
      })),
    });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ───────────────────────────────
// CREATE saved item
// ───────────────────────────────
const create = async (req, res) => {
  try {
    const customer_id = req.customer.customer_id;

    let imageUrl = null;
    let imagePublicId = null;

    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.buffer);
      imageUrl = uploadResult.secure_url;
      imagePublicId = uploadResult.public_id;
    }

    const savedItem = await Saved.create({
      customer_id,
      product_id: req.body.product_id || "",
      name: req.body.name,
      category: req.body.category,
      price: Number(req.body.price),
      image: imageUrl,
      image_public_id: imagePublicId,
    });

    // Return a clean response for frontend
    res.status(201).json({
      success: true,
      saved_id: savedItem._id.toString(),
      customer_id: savedItem.customer_id,
      product_id: savedItem.product_id,
      name: savedItem.name,
      category: savedItem.category,
      price: savedItem.price,
      image: savedItem.image ?? null,
    });
  } catch (err) {
    console.error("Error creating saved item:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ───────────────────────────────
// UPDATE saved item
// ───────────────────────────────
const update = async (req, res) => {
  try {
    const customer_id = req.customer.customer_id;
    const { id } = req.params;

    const updateData = {
      name: req.body.name,
      category: req.body.category,
      price: Number(req.body.price),
    };

    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.buffer);
      updateData.image = uploadResult.secure_url;
      updateData.image_public_id = uploadResult.public_id;
    }

    const updated = await Saved.findOneAndUpdate(
      { _id: id, customer_id },
      updateData,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Item not found or unauthorized" });
    }

    res.json({
      success: true,
      saved_id: updated._id.toString(),
      customer_id: updated.customer_id,
      product_id: updated.product_id,
      name: updated.name,
      category: updated.category,
      price: updated.price,
      image: updated.image ?? null,
    });
  } catch (err) {
    console.error("Error updating saved item:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ───────────────────────────────
// DELETE saved item
// ───────────────────────────────
const remove = async (req, res) => {
  try {
    const customer_id = req.customer.customer_id;
    const { id } = req.params;

    const deleted = await Saved.findOneAndDelete({ _id: id, customer_id });

    if (!deleted) {
      return res.status(404).json({ error: "Item not found or unauthorized" });
    }

    // Optional: Delete image from Cloudinary
    if (deleted.image_public_id) {
      cloudinary.uploader.destroy(deleted.image_public_id, (err, result) => {
        if (err) console.error("Cloudinary delete error:", err);
      });
    }

    res.json({ success: true, deletedId: id });
  } catch (err) {
    console.error("Error deleting saved item:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { getAll, create, update, remove };
