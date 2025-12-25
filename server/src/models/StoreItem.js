// models/StoreItem.js
import mongoose from "mongoose";

const StoreItemSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true, required: true }, // "theme.midnight", "glow.neon", etc.
    name: { type: String, required: true },
    desc: { type: String, default: "" },

    type: {
      type: String,
      enum: ["rantTheme", "profileTheme", "nameGlow", "rantEffect"],
      required: true,
    },

    priceVE: { type: Number, required: true },
    rarity: { type: String, enum: ["common", "rare", "epic", "legendary"], default: "common" },

    // payload used by frontend to render preview/effect
    data: { type: Object, default: {} },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("StoreItem", StoreItemSchema);
