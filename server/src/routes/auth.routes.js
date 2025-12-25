// server/routes/auth.routes.js
import { Router } from "express";
import bcrypt from "bcryptjs";
import passport from "passport";
import User from "../models/User.js";

const router = Router();

/**
 * Always return a fresh user from DB (so equipped/inventory are present),
 * and keep the response shape consistent across login/register/session.
 */
async function buildSessionUser(userId) {
  if (!userId) return null;

  // IMPORTANT: include equipped + inventory
  const u = await User.findById(userId).select(
    "username email ventEnergy equipped inventory cosmetic googleId"
  );

  if (!u) return null;

  // Backfill defaults if older users don't have equipped populated yet
  if (!u.equipped) u.equipped = {};
  if (!u.equipped.rantTheme) u.equipped.rantTheme = "theme.midnight";
  if (!u.equipped.profileTheme) u.equipped.profileTheme = "profile.midnight";
  if (!u.equipped.nameGlow) u.equipped.nameGlow = "glow.none";
  if (!u.equipped.rantEffect) u.equipped.rantEffect = "effect.none";

  // Save only if we actually changed something
  // (Mongoose doc comparison isn't perfect; this is fine for your use)
  await u.save();

  return u;
}

router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body || {};
    if (!username || !email || !password)
      return res.status(400).json({ error: "Missing fields" });
    if (password.length < 6)
      return res.status(400).json({ error: "Password too short" });

    const exists = await User.findOne({ email: email.toLowerCase().trim() });
    if (exists) return res.status(409).json({ error: "Email already in use" });

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      ventEnergy: 20,
      // ensure brand new users always have equipped defaults
      equipped: {
        rantTheme: "theme.midnight",
        profileTheme: "profile.midnight",
        nameGlow: "glow.none",
        rantEffect: "effect.none",
      },
    });

    // Auto-login after register
    req.login(user, async (err) => {
      if (err) return res.status(500).json({ error: "Login failed" });

      const fresh = await buildSessionUser(req.user?._id);
      return res.json({ user: fresh });
    });
  } catch (e) {
    console.error("POST /auth/register error:", e);
    res.status(500).json({ error: "Server error" });
  }
});

// Local login
router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user)
      return res
        .status(401)
        .json({ error: info?.message || "Invalid credentials" });

    req.login(user, async (e) => {
      if (e) return next(e);

      const fresh = await buildSessionUser(req.user?._id);
      return res.json({ user: fresh });
    });
  })(req, res, next);
});

router.post("/logout", (req, res) => {
  req.logout(() => {
    req.session?.destroy(() => {
      res.clearCookie("rw.sid");
      res.json({ ok: true });
    });
  });
});

router.get("/session", async (req, res) => {
  if (!req.user) return res.json({ user: null });

  const fresh = await buildSessionUser(req.user?._id);
  return res.json({ user: fresh });
});

// Google OAuth start
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Google OAuth callback
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.CLIENT_ORIGIN}/auth?err=google`,
  }),
  (req, res) => {
    // success → go back to client
    res.redirect(`${process.env.CLIENT_ORIGIN}/`);
  }
);

export default router;
