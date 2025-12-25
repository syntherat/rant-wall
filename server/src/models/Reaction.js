// models/Reaction.js
import mongoose from "mongoose";
const { Schema } = mongoose;

const ReactionSchema = new Schema(
  {
    rantId: { type: Schema.Types.ObjectId, ref: "Rant", required: true },

    // one of these identifies the reactor
    userId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    guestId: { type: String, default: null },

    key: { type: String, enum: ["feel", "rage", "hug", "lol"], required: true },

    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// ensure only one reaction per actor per rant (you can allow “change reaction”)
ReactionSchema.index(
  { rantId: 1, userId: 1, guestId: 1 },
  { unique: true, partialFilterExpression: { $or: [{ userId: { $type: "objectId" } }, { guestId: { $type: "string" } }] } }
);

export default mongoose.model("Reaction", ReactionSchema);
