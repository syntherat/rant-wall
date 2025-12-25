import { Router } from "express";
import bcrypt from "bcryptjs";
import passport from "passport";
import User from "../models/User.js";

const router = Router();

router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body || {};
    if (!username || !email || !password) return res.status(400).json({ error: "Missing fields" });
    if (password.length < 6) return res.status(400).json({ error: "Password too short" });

    const exists = await User.findOne({ email: email.toLowerCase().trim() });
    if (exists) return res.status(409).json({ error: "Email already in use" });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      ventEnergy: 20
    });

    // Auto-login after register
    req.login(user, (err) => {
      if (err) return res.status(500).json({ error: "Login failed" });
      res.json({ user: req.user });
    });
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

// Local login
router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ error: info?.message || "Invalid credentials" });

    req.login(user, (e) => {
      if (e) return next(e);
      return res.json({ user: req.user });
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

router.get("/session", (req, res) => {
  res.json({ user: req.user || null });
});

// Google OAuth start
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google OAuth callback
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: `${process.env.CLIENT_ORIGIN}/auth?err=google` }),
  (req, res) => {
    // success → go back to client
    res.redirect(`${process.env.CLIENT_ORIGIN}/`);
  }
);

export default router;
