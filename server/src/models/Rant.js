import mongoose from "mongoose";

const { Schema } = mongoose;

/**
 * Reply schema (supports nested replies recursively)
 */
const ReplySchema = new Schema(
  {
    text: { type: String, required: true, minlength: 1, maxlength: 500 },

    authorMode: { type: String, enum: ["public", "anonymous"], default: "anonymous" },

    // If public and logged in
    authorUserId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    authorName: { type: String, default: null },

    // If anonymous
    anonAlias: { type: String, default: null },

    // Nested replies
    replies: { type: [/* filled below */], default: [] },

    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

// ✅ recursion hookup
ReplySchema.add({ replies: { type: [ReplySchema], default: [] } });

const RantSchema = new Schema(
  {
    text: { type: String, required: true, minlength: 10, maxlength: 1200 },
    mood: { type: String, default: "neutral" },
    tags: [{ type: String }],

    authorMode: { type: String, enum: ["public", "anonymous"], default: "anonymous" },

    // public author
    authorUserId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    authorName: { type: String, default: null },

    // anonymous author
    anonAlias: { type: String, default: null },

    // reactions count map (your current frontend expects object-like counts)
    reactions: { type: Map, of: Number, default: {} },

    // threaded replies
    replies: { type: [ReplySchema], default: [] },

    score24h: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Rant", RantSchema);
