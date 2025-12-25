// models/User.js (update)
import mongoose from "mongoose";

const OwnedItemSchema = new mongoose.Schema(
  {
    itemKey: { type: String, required: true },
    ownedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, trim: true, minlength: 2, maxlength: 24 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, default: null },
    googleId: { type: String, default: null },

    ventEnergy: { type: Number, default: 0 },

    inventory: { type: [OwnedItemSchema], default: [] },

    equipped: {
      rantTheme: { type: String, default: "theme.midnight" },
      profileTheme: { type: String, default: "profile.midnight" },
      nameGlow: { type: String, default: "glow.none" },
      rantEffect: { type: String, default: "effect.none" },
    },

    // optional: to enforce daily VE cap
    veDaily: {
      dateKey: { type: String, default: "" }, // "YYYY-MM-DD"
      earnedToday: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", UserSchema);
