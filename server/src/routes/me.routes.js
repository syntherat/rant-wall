import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import User from "../models/User.js";

const router = Router();

router.get("/", requireAuth, (req, res) => res.json({ user: req.user }));

router.post("/cosmetic", requireAuth, async (req, res) => {
  const { cardTheme, badge } = req.body || {};
  const cost = 30;

  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ error: "Not found" });
  if (user.ventEnergy < cost) return res.status(400).json({ error: "Not enough VE" });

  if (cardTheme) user.cosmetic.cardTheme = cardTheme;
  if (badge) user.cosmetic.badge = badge;

  user.ventEnergy -= cost;
  await user.save();

  res.json({ user: await User.findById(user._id).select("username email ventEnergy cosmetic googleId") });
});

export default router;
