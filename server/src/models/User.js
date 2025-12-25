import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, trim: true, minlength: 2, maxlength: 24 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },

    // Local auth
    passwordHash: { type: String, default: null },

    // Google auth
    googleId: { type: String, default: null },

    ventEnergy: { type: Number, default: 0 },
    cosmetic: {
      cardTheme: { type: String, default: "midnight" },
      badge: { type: String, default: "New Ranter" }
    }
  },
  { timestamps: true }
);

export default mongoose.model("User", UserSchema);
