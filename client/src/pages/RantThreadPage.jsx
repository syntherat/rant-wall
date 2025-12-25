// client/src/pages/RantThreadPage.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../lib/api";
import { useSession } from "../lib/session";
import RantCard from "../components/RantCard";
import ReplyNode from "../components/thread/ReplyNode";
import { motion } from "framer-motion";

function SkeletonLine({ w = "100%", h = "0.75rem" }) {
  return <div className="rounded bg-white/10" style={{ width: w, height: h }} />;
}

function ThreadCardSkeleton() {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-white/10" />
        <div className="space-y-2">
          <SkeletonLine w="140px" />
          <SkeletonLine w="90px" h="0.6rem" />
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <SkeletonLine />
        <SkeletonLine w="95%" />
        <SkeletonLine w="75%" />
      </div>

      <div className="mt-4 flex gap-3">
        <SkeletonLine w="70px" h="1.8rem" />
        <SkeletonLine w="70px" h="1.8rem" />
      </div>
    </div>
  );
}

function ReplyComposerSkeleton() {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-4 animate-pulse">
      <SkeletonLine w="80px" />
      <div className="mt-3 h-24 rounded-2xl bg-white/10" />
      <div className="mt-3 flex justify-end">
        <SkeletonLine w="64px" h="2rem" />
      </div>
    </div>
  );
}

function ReplySkeleton({ depth = 0 }) {
  return (
    <div
      className="rounded-2xl border border-white/10 bg-black/30 p-3 animate-pulse"
      style={{ marginLeft: depth * 24 }}
    >
      <div className="flex items-center gap-2">
        <div className="h-7 w-7 rounded-full bg-white/10" />
        <SkeletonLine w="100px" />
      </div>

      <div className="mt-2 space-y-2">
        <SkeletonLine />
        <SkeletonLine w="85%" />
      </div>
    </div>
  );
}

export default function RantThreadPage() {
  const { id } = useParams();
  const { user, refresh } = useSession();

  const [rant, setRant] = useState(null);
  const [reply, setReply] = useState("");
  const [authorMode, setAuthorMode] = useState("anonymous");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const res = await api.getRant(id);
      setRant(res.rant);
    } catch {
      setErr("Couldn’t load this rant.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  async function react(_, key) {
    const res = await api.reactRant(id, key);
    setRant(res.rant);
    await refresh();
  }

  async function sendReply() {
    if (!reply.trim()) return;
    const res = await api.replyRant(id, {
      text: reply,
      authorMode: user ? authorMode : "anonymous",
    });
    setRant(res.rant);
    setReply("");
    setAuthorMode("anonymous");
    await refresh();
  }

  async function replyToReply(parentReplyId, text, mode) {
    const res = await api.replyToReply(id, parentReplyId, { text, authorMode: mode });
    setRant(res.rant);
    await refresh();
  }

  const equipped = user?.equipped || {};
  const theme = equipped.rantTheme || "theme.midnight";
  const effect = equipped.rantEffect || "effect.none";
  const nameGlow = equipped.nameGlow || "glow.none";

  return (
    <div className="min-h-[calc(100vh-140px)] space-y-6">
      {loading && (
        <>
          <ThreadCardSkeleton />
          <ReplyComposerSkeleton />
          <div className="space-y-3">
            <ReplySkeleton />
            <ReplySkeleton />
            <ReplySkeleton depth={1} />
          </div>
        </>
      )}

      {!loading && err && (
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <div className="text-lg font-semibold">Something went wrong</div>
          <div className="mt-1 text-sm text-white/60">{err}</div>
          <button
            onClick={load}
            className="mt-4 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm hover:bg-white/[0.1]"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !err && rant && (
        <>
          <RantCard
            rant={rant}
            onReact={react}
            theme={theme}
            effect={effect}
            nameGlow={nameGlow}
            mode="thread"
          />

          <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-4 rw-card-shadow">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">Reply</div>

              <select
                value={authorMode}
                onChange={(e) => setAuthorMode(e.target.value)}
                disabled={!user}
                className="rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white/80 disabled:opacity-60"
              >
                <option value="anonymous">👤 Anonymous</option>
                <option value="public">🧍 Public</option>
              </select>
            </div>

            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value.slice(0, 500))}
              className="mt-3 h-24 w-full resize-none rounded-2xl border border-white/10 bg-black/40 p-3 text-sm text-white/90 placeholder:text-white/35 focus:border-white/20"
              placeholder="Write a reply…"
            />

            <div className="mt-3 flex justify-end">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={sendReply}
                className="rounded-2xl border border-white/10 bg-white px-4 py-2 text-sm font-semibold text-black"
              >
                Send
              </motion.button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-sm font-semibold">
              Replies <span className="text-white/50">({rant.replies?.length || 0})</span>
            </div>

            {rant.replies?.length ? (
              rant.replies.map((rp) => (
                <ReplyNode key={rp._id} node={rp} user={user} onReply={replyToReply} />
              ))
            ) : (
              <div className="rounded-3xl border border-white/10 bg-black/20 p-5 text-sm text-white/55">
                No replies yet. Be the first.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
