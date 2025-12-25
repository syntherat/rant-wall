import { Router } from "express";
import Rant from "../models/Rant.js";
import User from "../models/User.js";
import Reaction from "../models/Reaction.js";
import { addVE } from "../lib/ve.js";

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

// Helper: build actor query for Reaction (user or guest)
function actorQuery(userId, guestId) {
  if (userId) return { userId };
  return { guestId };
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

    // ✅ snapshot cosmetics AT POST TIME
    const equipped = isAuthed ? (req.user?.equipped || {}) : {};
    const cosmetics = {
      theme: equipped.rantTheme || "theme.midnight",
      glow: equipped.nameGlow || "glow.none",
      effect: equipped.rantEffect || "effect.none",
    };

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

      cosmetics, // ✅ NEW
    });

    // ✅ VE reward for posting (logged in only)
    if (isAuthed) {
      const u = await User.findById(req.user._id);
      if (u) {
        await addVE(u, 10, "rant_created"); // +10 VE
        await u.save();
      }
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

    const guestId = String(req.headers["x-guest-id"] || "").trim() || null;
    const isAuthed = req.isAuthenticated?.() && req.user;
    const userId = isAuthed ? req.user._id : null;

    // must have some identity
    if (!userId && !guestId) return res.status(400).json({ error: "Missing identity" });

    // prevent self-farm if logged in and public rant
    const isSelf = userId && rant.authorUserId && String(rant.authorUserId) === String(userId);

    // record unique reactor per rant
    let created = false;
    let prev = null;

    const actor = actorQuery(userId, guestId);

    // find existing reaction for this actor (if any)
    prev = await Reaction.findOne({ rantId: rant._id, ...actor });

    if (!prev) {
      // create new (unique reactor)
      await Reaction.create({ rantId: rant._id, userId, guestId, key });
      created = true;
    } else {
      // allow changing reaction type
      if (prev.key !== key) {
        const oldKey = prev.key;
        prev.key = key;
        await prev.save();

        // decrement old + increment new
        rant.reactions.set(oldKey, Math.max(0, (rant.reactions.get(oldKey) || 0) - 1));
        rant.reactions.set(key, (rant.reactions.get(key) || 0) + 1);
        await rant.save();
        // NOTE: changing reaction does NOT give extra VE
        return res.json({ rant });
      }
      // same reaction, do nothing
      return res.json({ rant });
    }

    // update counts for fresh reaction
    rant.reactions.set(key, (rant.reactions.get(key) || 0) + 1);
    await rant.save();

    // VE rewards
    // 1) author reward for unique reactors only, not self
    if (created && rant.authorUserId && !isSelf) {
      const author = await User.findById(rant.authorUserId);
      if (author) {
        await addVE(author, 2, "reaction_received"); // +2 per unique reactor
        await author.save();
      }
    }

    // 2) reactor reward for engaging (only if logged in), small cap
    if (created && userId && !isSelf) {
      const reactor = await User.findById(userId);
      if (reactor) {
        await addVE(reactor, 1, "reaction_given", 40); // smaller cap for giving reactions
        await reactor.save();
      }
    }

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

    // ✅ VE for replying (logged in only)
    if (isAuthed) {
      const u = await User.findById(req.user._id);
      if (u) {
        await addVE(u, 3, "reply_created"); // +3 VE
        await u.save();
      }
    }

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

    // ✅ VE for replying (logged in only)
    if (isAuthed) {
      const u = await User.findById(req.user._id);
      if (u) {
        await addVE(u, 3, "reply_created"); // +3 VE
        await u.save();
      }
    }

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
