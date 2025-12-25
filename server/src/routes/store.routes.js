// server/routes/store.routes.js
import { Router } from "express";
import StoreItem from "../models/StoreItem.js";

const router = Router();

// List active store items
router.get("/items", async (req, res) => {
  try {
    const items = await StoreItem.find({ isActive: true })
      .sort({ createdAt: 1 })
      .lean();

    res.json({ items });
  } catch (err) {
    console.error("GET /store/items error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
