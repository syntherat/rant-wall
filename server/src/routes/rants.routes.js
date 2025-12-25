import { Router } from "express";
import Rant from "../models/Rant.js";
import User from "../models/User.js"; // ✅ FIX: import directly (no req.app.get("mongoose"))

const router = Router();

function makeAlias() {
  const a = ["Tired Panda", "Salty Fox", "Quiet Crow", "BurntOut Koala", "Chaotic Cat"];
  return a[Math.floor(Math.random() * a.length)];
}

// Recursively find a reply subdocument by id
function findReplyById(replies, replyId) {
  for (const r of replies) {
    if (String(r._id) === String(replyId)) return r;
    const found = findReplyById(r.replies || [], replyId);
    if (found) return found;
  }
  return null;
}

router.get("/", async (req, res) => {
  try {
    const rants = await Rant.find().sort({ createdAt: -1 }).limit(50);
    res.json({ rants });
  } catch (err) {
    console.error("GET /rants error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { text, mood = "neutral", tags = [], authorMode = "anonymous" } = req.body || {};
    if (!text || text.trim().length < 10) {
      return res.status(400).json({ error: "Rant too short" });
    }

    const isAuthed = req.isAuthenticated?.() && req.user;
    const finalMode = isAuthed && authorMode === "public" ? "public" : "anonymous";

    const rant = await Rant.create({
      text: text.trim(),
      mood,
      tags: tags
        .slice(0, 5)
        .map((t) => String(t).toLowerCase().trim())
        .filter(Boolean),
      authorMode: finalMode,
      authorUserId: finalMode === "public" ? req.user._id : null,
      authorName: finalMode === "public" ? req.user.username : null,
      anonAlias: finalMode === "anonymous" ? makeAlias() : null,
    });

    // ✅ Optional: update user stats if logged in (won't crash even if fields don't exist)
    if (isAuthed) {
      // If your User schema has rantsCount, this will increment it.
      // If it doesn't, Mongo will create it on first update unless schema is strict w/ no extra fields.
      await User.updateOne({ _id: req.user._id }, { $inc: { rantsCount: 1 } }).catch(() => {});
    }

    res.status(201).json({ rant });
  } catch (err) {
    console.error("POST /rants error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/:id/react", async (req, res) => {
  try {
    const { key } = req.body || {};
    const allowed = ["feel", "rage", "hug", "lol"];
    if (!allowed.includes(key)) return res.status(400).json({ error: "Invalid reaction" });

    const rant = await Rant.findById(req.params.id);
    if (!rant) return res.status(404).json({ error: "Not found" });

    rant.reactions.set(key, (rant.reactions.get(key) || 0) + 1);
    await rant.save();

    res.json({ rant });
  } catch (err) {
    console.error("POST /rants/:id/react error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Reply to the MAIN rant (top-level reply)
router.post("/:id/reply", async (req, res) => {
  try {
    const { text, authorMode = "anonymous" } = req.body || {};
    if (!text || !text.trim()) return res.status(400).json({ error: "Reply required" });

    const rant = await Rant.findById(req.params.id);
    if (!rant) return res.status(404).json({ error: "Not found" });

    const isAuthed = req.isAuthenticated?.() && req.user;
    const finalMode = isAuthed && authorMode === "public" ? "public" : "anonymous";

    rant.replies.unshift({
      text: text.trim(),
      authorMode: finalMode,
      authorUserId: finalMode === "public" ? req.user._id : null,
      authorName: finalMode === "public" ? req.user.username : null,
      anonAlias: finalMode === "anonymous" ? makeAlias() : null,
      replies: [],
    });

    rant.replies = rant.replies.slice(0, 200); // cap top-level
    await rant.save();

    res.json({ rant });
  } catch (err) {
    console.error("POST /rants/:id/reply error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Reply to a REPLY (nested reply)
router.post("/:id/reply/:replyId", async (req, res) => {
  try {
    const { text, authorMode = "anonymous" } = req.body || {};
    if (!text || !text.trim()) return res.status(400).json({ error: "Reply required" });

    const rant = await Rant.findById(req.params.id);
    if (!rant) return res.status(404).json({ error: "Not found" });

    const parent = findReplyById(rant.replies || [], req.params.replyId);
    if (!parent) return res.status(404).json({ error: "Parent reply not found" });

    const isAuthed = req.isAuthenticated?.() && req.user;
    const finalMode = isAuthed && authorMode === "public" ? "public" : "anonymous";

    parent.replies.unshift({
      text: text.trim(),
      authorMode: finalMode,
      authorUserId: finalMode === "public" ? req.user._id : null,
      authorName: finalMode === "public" ? req.user.username : null,
      anonAlias: finalMode === "anonymous" ? makeAlias() : null,
      replies: [],
    });

    // optional: cap nested replies per node
    parent.replies = (parent.replies || []).slice(0, 50);

    await rant.save();
    res.json({ rant });
  } catch (err) {
    console.error("POST /rants/:id/reply/:replyId error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const rant = await Rant.findById(req.params.id);
    if (!rant) return res.status(404).json({ error: "Not found" });
    res.json({ rant });
  } catch (err) {
    console.error("GET /rants/:id error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
