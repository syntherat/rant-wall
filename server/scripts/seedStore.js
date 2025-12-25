import "dotenv/config";
import mongoose from "mongoose";
import StoreItem from "../src/models/StoreItem.js";

const MONGO = process.env.MONGO_URI || process.env.MONGODB_URI;

const seedItems = [
  // RANT THEMES
  {
    key: "theme.midnight",
    name: "Midnight (Default)",
    desc: "Deep black glass. Clean & quiet.",
    type: "rantTheme",
    priceVE: 0,
    rarity: "common",
    isActive: true,
    data: { preset: "midnight" },
  },
  {
    key: "theme.noir",
    name: "Noir Slate",
    desc: "Colder blacks + sharper contrast.",
    type: "rantTheme",
    priceVE: 120,
    rarity: "common",
    isActive: true,
    data: { preset: "noir" },
  },
  {
    key: "theme.nebula",
    name: "Nebula Bloom",
    desc: "Purple/cyan glow edge like distant fog.",
    type: "rantTheme",
    priceVE: 280,
    rarity: "rare",
    isActive: true,
    data: { preset: "nebula" },
  },
  {
    key: "theme.ember",
    name: "Ember Veins",
    desc: "Warm ember tint with subtle grain.",
    type: "rantTheme",
    priceVE: 420,
    rarity: "rare",
    isActive: true,
    data: { preset: "ember" },
  },
  {
    key: "theme.aurora",
    name: "Aurora Drift",
    desc: "Soft aurora sheen across the card.",
    type: "rantTheme",
    priceVE: 900,
    rarity: "epic",
    isActive: true,
    data: { preset: "aurora" },
  },

  // NAME GLOWS
  {
    key: "glow.none",
    name: "No Glow (Default)",
    desc: "Plain username, maximum quiet.",
    type: "nameGlow",
    priceVE: 0,
    rarity: "common",
    isActive: true,
    data: { preset: "none" },
  },
  {
    key: "glow.soft",
    name: "Soft Halo",
    desc: "A gentle glow for public usernames.",
    type: "nameGlow",
    priceVE: 160,
    rarity: "common",
    isActive: true,
    data: { preset: "soft" },
  },
  {
    key: "glow.neon",
    name: "Neon Pulse",
    desc: "Stronger neon glow with breathing pulse.",
    type: "nameGlow",
    priceVE: 520,
    rarity: "rare",
    isActive: true,
    data: { preset: "neon" },
  },
  {
    key: "glow.prism",
    name: "Prism Shift",
    desc: "Hue-shifting glow (subtle, not cringe).",
    type: "nameGlow",
    priceVE: 1200,
    rarity: "epic",
    isActive: true,
    data: { preset: "prism" },
  },

  // RANT EFFECTS
  {
    key: "effect.none",
    name: "No Effect (Default)",
    desc: "No motion, no distraction.",
    type: "rantEffect",
    priceVE: 0,
    rarity: "common",
    isActive: true,
    data: { preset: "none" },
  },
  {
    key: "effect.grain",
    name: "Film Grain",
    desc: "Analog texture over the card.",
    type: "rantEffect",
    priceVE: 220,
    rarity: "common",
    isActive: true,
    data: { preset: "grain" },
  },
  {
    key: "effect.sheen",
    name: "Glass Sheen",
    desc: "A slow sheen sweep (like your header).",
    type: "rantEffect",
    priceVE: 600,
    rarity: "rare",
    isActive: true,
    data: { preset: "sheen" },
  },
  {
    key: "effect.glitch",
    name: "Micro Glitch",
    desc: "Tiny glitch flicker on hover only.",
    type: "rantEffect",
    priceVE: 1500,
    rarity: "legendary",
    isActive: true,
    data: { preset: "glitch" },
  },

  // PROFILE THEMES
  {
    key: "profile.midnight",
    name: "Profile: Midnight (Default)",
    desc: "Matches your baseline UI.",
    type: "profileTheme",
    priceVE: 0,
    rarity: "common",
    isActive: true,
    data: { preset: "midnight" },
  },
  {
    key: "profile.nebula",
    name: "Profile: Nebula",
    desc: "Purple/cyan ambient glow in Profile.",
    type: "profileTheme",
    priceVE: 350,
    rarity: "rare",
    isActive: true,
    data: { preset: "nebula" },
  },
  {
    key: "profile.aurora",
    name: "Profile: Aurora",
    desc: "A soft aurora wash behind panels.",
    type: "profileTheme",
    priceVE: 950,
    rarity: "epic",
    isActive: true,
    data: { preset: "aurora" },
  },
];

async function main() {
  if (!MONGO) {
    console.error("Missing MONGO_URI / MONGODB_URI in env");
    process.exit(1);
  }

  await mongoose.connect(MONGO);
  console.log("✅ Connected");

  // Upsert by key (safe to re-run)
  const ops = seedItems.map((it) => ({
    updateOne: {
      filter: { key: it.key },
      update: { $set: it },
      upsert: true,
    },
  }));

  const res = await StoreItem.bulkWrite(ops);
  console.log("✅ Seeded store items", {
    upserted: res.upsertedCount,
    modified: res.modifiedCount,
    matched: res.matchedCount,
  });

  await mongoose.disconnect();
  console.log("✅ Done");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
