// One place to define how cosmetics LOOK.
// StoreItem.key must match these keys for full fidelity.

export const RANT_THEMES = {
  "theme.midnight": {
    label: "Midnight",
    cardClass:
      "bg-gradient-to-b from-[#06060a] to-[#0a0b12] border-white/10 text-white",
    topGlow:
      "radial-gradient(700px 220px at 20% 0%, rgba(168,85,247,0.20), transparent 60%)",
  },

  "theme.paper": {
    label: "Paper",
    // not glass. more “note card”
    cardClass:
      "bg-[#f6f3ea] border-black/15 text-black shadow-[0_10px_30px_rgba(0,0,0,0.18)]",
    topGlow:
      "radial-gradient(900px 260px at 40% 0%, rgba(255,224,140,0.45), transparent 65%)",
  },

  "theme.terminal": {
    label: "Terminal",
    cardClass:
      "bg-[#03120b] border-emerald-400/30 text-emerald-100 shadow-[0_0_0_1px_rgba(52,211,153,0.18),0_20px_40px_rgba(0,0,0,0.35)]",
    topGlow:
      "radial-gradient(700px 220px at 20% 0%, rgba(52,211,153,0.18), transparent 60%)",
  },

  "theme.ember": {
    label: "Ember",
    cardClass:
      "bg-gradient-to-b from-[#160708] to-[#0b0607] border-rose-300/25 text-white shadow-[0_20px_60px_rgba(255,80,80,0.10)]",
    topGlow:
      "radial-gradient(700px 240px at 30% 0%, rgba(251,113,133,0.22), transparent 60%)",
  },

  "theme.neonpunk": {
    label: "Neonpunk",
    cardClass:
      "bg-[#05040a] border-fuchsia-400/25 text-white shadow-[0_0_0_1px_rgba(217,70,239,0.15),0_0_60px_rgba(34,211,238,0.10)]",
    topGlow:
      "radial-gradient(520px 220px at 18% 0%, rgba(217,70,239,0.25), transparent 60%), radial-gradient(520px 220px at 82% 0%, rgba(34,211,238,0.18), transparent 60%)",
    rim:
      "linear-gradient(90deg, rgba(217,70,239,0.45), rgba(34,211,238,0.35), rgba(255,255,255,0.08))",
  },

  "theme.royal": {
    label: "Royal Ink",
    cardClass:
      "bg-gradient-to-b from-[#0b0a20] to-[#050510] border-indigo-300/20 text-white shadow-[0_25px_60px_rgba(99,102,241,0.12)]",
    topGlow:
      "radial-gradient(820px 260px at 25% 0%, rgba(99,102,241,0.28), transparent 60%)",
  },
};

export const NAME_GLOWS = {
  "glow.none": { label: "None", className: "" },

  "glow.cyan": {
    label: "Cyan Beam",
    className:
      "text-cyan-100 drop-shadow-[0_0_10px_rgba(34,211,238,0.65)] drop-shadow-[0_0_28px_rgba(34,211,238,0.28)]",
  },

  "glow.fuchsia": {
    label: "Fuchsia Pop",
    className:
      "text-fuchsia-100 drop-shadow-[0_0_10px_rgba(217,70,239,0.75)] drop-shadow-[0_0_34px_rgba(217,70,239,0.30)]",
  },

  "glow.ember": {
    label: "Ember Halo",
    className:
      "text-rose-100 drop-shadow-[0_0_10px_rgba(251,113,133,0.75)] drop-shadow-[0_0_34px_rgba(251,113,133,0.26)]",
  },

  "glow.lime": {
    label: "Lime Laser",
    className:
      "text-lime-100 drop-shadow-[0_0_10px_rgba(163,230,53,0.70)] drop-shadow-[0_0_34px_rgba(163,230,53,0.25)]",
  },

  // “legendary”-ish: animated shimmer
  "glow.prism": {
    label: "Prism Shift",
    className: "olbq-prism-name",
  },
};

export const RANT_EFFECTS = {
  "effect.none": { label: "None" },

  "effect.grain": {
    label: "Film Grain",
    overlayClass: "olbq-grain",
  },

  "effect.scanlines": {
    label: "Scanlines",
    overlayClass: "olbq-scanlines",
  },

  "effect.sheen": {
    label: "Glass Sheen",
    overlayClass: "olbq-sheen",
  },

  "effect.glitch": {
    label: "Micro Glitch",
    overlayClass: "olbq-glitch",
  },
};

// Helpers
export function themeStyle(key) {
  return RANT_THEMES[key] || RANT_THEMES["theme.midnight"];
}
export function glowStyle(key) {
  return NAME_GLOWS[key] || NAME_GLOWS["glow.none"];
}
export function effectStyle(key) {
  return RANT_EFFECTS[key] || RANT_EFFECTS["effect.none"];
}
