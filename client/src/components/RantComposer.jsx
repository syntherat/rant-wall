import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { api } from "../lib/api";
import { useSession } from "../lib/session";

export default function RantComposer({ onCreated }) {
  const { user } = useSession();
  const [text, setText] = useState("");
  const [authorMode, setAuthorMode] = useState("anonymous");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const max = 1200;
  const pct = useMemo(() => Math.min(100, Math.round((text.length / max) * 100)), [text.length]);

  async function submit() {
    setErr("");
    if (text.trim().length < 10) return setErr("Write at least 10 characters.");
    setLoading(true);
    try {
      const res = await api.createRant({
        text,
        authorMode: user ? authorMode : "anonymous",
      });
      setText("");
      setAuthorMode("anonymous");
      onCreated?.(res.rant);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-4">
      <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-fuchsia-500/10 blur-[60px]" />
      <div className="pointer-events-none absolute -left-20 bottom-0 h-56 w-56 rounded-full bg-cyan-400/10 blur-[60px]" />

      <div className="relative flex items-center justify-between">
        <div className="text-sm font-semibold">Drop it here.</div>

        <div className="flex items-center gap-2 text-xs text-white/55">
          <div className="h-2 w-28 overflow-hidden rounded-full border border-white/10 bg-black/30">
            <div
              className="h-full"
              style={{
                width: `${pct}%`,
                background:
                  "linear-gradient(90deg, rgba(168,85,247,0.9), rgba(34,211,238,0.9))",
              }}
            />
          </div>
          <div className="tabular-nums">{text.length}/{max}</div>
        </div>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value.slice(0, max))}
        placeholder="Say it. No judgment. Just release."
        className="mt-3 h-28 w-full resize-none rounded-2xl border border-white/10 bg-black/40 p-3 text-sm text-white/90 outline-none placeholder:text-white/35 focus:border-white/20"
      />

      <div className="relative mt-3 flex items-center justify-between gap-3">
        <select
          value={authorMode}
          onChange={(e) => setAuthorMode(e.target.value)}
          disabled={!user}
          className="rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white/80 outline-none disabled:opacity-60"
        >
          <option value="anonymous">👤 anonymous</option>
          <option value="public">🧍 public</option>
        </select>

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={submit}
          disabled={loading}
          className="relative overflow-hidden rounded-2xl border border-white/10 bg-white px-4 py-2 text-sm font-semibold text-black hover:opacity-90 disabled:opacity-60"
        >
          <span className="relative z-10">{loading ? "Posting..." : "Post"}</span>
          <span
            className="absolute inset-0 opacity-70"
            style={{
              background:
                "radial-gradient(circle at 30% 30%, rgba(168,85,247,0.35), transparent 60%), radial-gradient(circle at 70% 70%, rgba(34,211,238,0.25), transparent 60%)",
            }}
          />
        </motion.button>
      </div>

      {err && <div className="mt-2 text-xs text-red-300">{err}</div>}
    </div>
  );
}
