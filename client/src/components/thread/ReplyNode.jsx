import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

function initials(name = "Anon") {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() || "").join("");
}

export default function ReplyNode({
  node,
  depth = 0,
  user,
  onReply, // (parentReplyId, text, authorMode) => Promise
  maxDepth = 6,
}) {
  const name = node.authorMode === "public" ? node.authorName : node.anonAlias;

  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [authorMode, setAuthorMode] = useState("anonymous");
  const [loading, setLoading] = useState(false);

  const pad = useMemo(() => Math.min(depth * 18, 72), [depth]);

  async function submit() {
    if (!text.trim()) return;
    setLoading(true);
    try {
      await onReply(node._id, text, user ? authorMode : "anonymous");
      setText("");
      setAuthorMode("anonymous");
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative" style={{ paddingLeft: pad }}>
      {/* thread connector */}
      {depth > 0 && (
        <div className="pointer-events-none absolute left-[22px] top-0 h-full w-px bg-white/10" />
      )}

      <div className="flex gap-3 bg-black/30 p-4">
        {/* avatar */}
        <div className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-black/45 text-xs font-semibold text-white/80">
          {initials(name)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-white/90">{name}</span>
            <span className="text-xs text-white/45">
              {new Date(node.createdAt).toLocaleString()}
            </span>

            {/* reply icon button */}
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="ml-auto inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/35 px-2.5 py-1 text-[11px] text-white/70 hover:bg-white/10"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              <span>Reply</span>
            </button>
          </div>

          <div className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-white/90">
            {node.text}
          </div>

          {open && (
            <div className="mt-3 rounded-2xl border border-white/10 bg-black/35 p-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold text-white/80">Replying</div>

                <select
                  value={authorMode}
                  onChange={(e) => setAuthorMode(e.target.value)}
                  disabled={!user}
                  className="rounded-xl border border-white/10 bg-black/40 px-2 py-1 text-[11px] text-white/80 outline-none disabled:opacity-60"
                >
                  <option value="anonymous">👤 anonymous</option>
                  <option value="public">🧍 public</option>
                </select>
              </div>

              <textarea
                value={text}
                onChange={(e) => setText(e.target.value.slice(0, 500))}
                placeholder="Write a reply…"
                className="mt-2 h-20 w-full resize-none rounded-xl border border-white/10 bg-black/40 p-2 text-sm text-white/90 outline-none placeholder:text-white/35 focus:border-white/20"
              />

              <div className="mt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-xl border border-white/10 bg-black/40 px-3 py-1.5 text-xs text-white/80 hover:bg-white/10"
                >
                  Cancel
                </button>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={submit}
                  disabled={loading}
                  className="rounded-xl border border-white/10 bg-white px-3 py-1.5 text-xs font-semibold text-black hover:opacity-90 disabled:opacity-60"
                >
                  {loading ? "Sending…" : "Send"}
                </motion.button>
              </div>
            </div>
          )}

          {/* children */}
          {depth < maxDepth && node.replies?.length > 0 && (
            <div className="mt-3 space-y-2">
              {node.replies.map((child) => (
                <ReplyNode
                  key={child._id}
                  node={child}
                  depth={depth + 1}
                  user={user}
                  onReply={onReply}
                  maxDepth={maxDepth}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
