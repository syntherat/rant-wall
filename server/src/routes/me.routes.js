// server/routes/me.routes.js
import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import User from "../models/User.js";
import StoreItem from "../models/StoreItem.js";

const router = Router();

// Current user
router.get("/", requireAuth, (req, res) => res.json({ user: req.user }));

// Inventory + equipped snapshot
router.get("/inventory", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("ventEnergy inventory equipped username email googleId");
    if (!user) return res.status(404).json({ error: "Not found" });
    res.json({
      ventEnergy: user.ventEnergy,
      inventory: user.inventory || [],
      equipped: user.equipped || {},
    });
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});

// Buy an item
router.post("/buy", requireAuth, async (req, res) => {
  try {
    const { itemKey } = req.body || {};
    if (!itemKey) return res.status(400).json({ error: "itemKey required" });

    const item = await StoreItem.findOne({ key: itemKey, isActive: true });
    if (!item) return res.status(404).json({ error: "Item not found" });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: "Not found" });

    const already = (user.inventory || []).some((x) => x.itemKey === itemKey);
    if (already) return res.status(400).json({ error: "Already owned" });

    const price = Number(item.priceVE || 0);
    if ((user.ventEnergy || 0) < price) return res.status(400).json({ error: "Not enough VE" });

    user.ventEnergy -= price;
    user.inventory = user.inventory || [];
    user.inventory.unshift({ itemKey, ownedAt: new Date() });

    await user.save();

    res.json({
      user: await User.findById(user._id).select("username email ventEnergy inventory equipped googleId"),
    });
  } catch (err) {
    console.error("POST /me/buy error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Equip an owned item into a slot
router.post("/equip", requireAuth, async (req, res) => {
  try {
    const { slot, itemKey } = req.body || {};

    const allowedSlots = ["rantTheme", "profileTheme", "nameGlow", "rantEffect"];
    if (!allowedSlots.includes(slot)) return res.status(400).json({ error: "Invalid slot" });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: "Not found" });

    // If itemKey is null/empty => reset slot to default
    if (!itemKey) {
      user.equipped = user.equipped || {};
      user.equipped[slot] =
        slot === "rantTheme"
          ? "theme.midnight"
          : slot === "profileTheme"
          ? "profile.midnight"
          : slot === "nameGlow"
          ? "glow.none"
          : "effect.none";

      await user.save();
      return res.json({
        user: await User.findById(user._id).select("ventEnergy inventory equipped"),
      });
    }

    const owned = (user.inventory || []).some((x) => x.itemKey === itemKey);
    if (!owned) return res.status(400).json({ error: "Not owned" });

    const item = await StoreItem.findOne({ key: itemKey, isActive: true });
    if (!item) return res.status(404).json({ error: "Item not found" });

    const typeForSlot = {
      rantTheme: "rantTheme",
      profileTheme: "profileTheme",
      nameGlow: "nameGlow",
      rantEffect: "rantEffect",
    };
    if (item.type !== typeForSlot[slot]) {
      return res.status(400).json({ error: "Wrong item type for slot" });
    }

    user.equipped = user.equipped || {};
    user.equipped[slot] = itemKey;

    await user.save();

    res.json({
      user: await User.findById(user._id).select("ventEnergy inventory equipped"),
    });
  } catch (err) {
    console.error("POST /me/equip error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
