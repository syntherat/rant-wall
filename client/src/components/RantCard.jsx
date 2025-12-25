import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ReactionTray from "./ui/ReactionTray.jsx";
import EmojiBurst from "./ui/EmojiBurst.jsx";
import useLongPress from "./ui/useLongPress.js";
import { MessageCircle, ArrowUpRight } from "lucide-react";

function hashStr(s = "") {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function pick(arr, n) {
  return arr[n % arr.length];
}

function messyFor(id) {
  const h = hashStr(id);

  const rot = ((h % 1100) / 1100) * 10 - 5; // -5..+5
  const ox = (((h >>> 8) % 2000) / 2000) * 18 - 9;
  const oy = (((h >>> 16) % 2000) / 2000) * 18 - 9;

  const widths = ["w-[96%]", "w-[92%]", "w-[88%]", "w-[84%]"];
  const align = (h >>> 20) % 2 === 0 ? "" : "ml-auto";

  return { rot, ox, oy, widthClass: pick(widths, h), alignClass: align };
}

function initials(name = "Anon") {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() || "").join("");
}

export default function RantCard({
  rant,
  onReact,
  theme = "midnight",
  mode = "wall", // ✅ "wall" (messy) | "thread" (straight)
}) {
  const nav = useNavigate();

  const counts = rant.reactions || {};
  const author = rant.authorMode === "public" ? rant.authorName : rant.anonAlias;

  // Messy only in wall mode
  const messy = useMemo(() => messyFor(rant._id), [rant._id]);

  const rot = mode === "thread" ? 0 : messy.rot;
  const ox = mode === "thread" ? 0 : messy.ox;
  const oy = mode === "thread" ? 0 : messy.oy;
  const widthClass = mode === "thread" ? "w-full" : messy.widthClass;
  const alignClass = mode === "thread" ? "" : messy.alignClass;

  const themeGlow =
    theme === "ember"
      ? "from-rose-500/25 via-orange-400/10 to-transparent"
      : theme === "aurora"
      ? "from-cyan-400/20 via-fuchsia-500/12 to-transparent"
      : "from-indigo-500/18 via-fuchsia-500/10 to-transparent";

  // IG reaction system
  const [trayOpen, setTrayOpen] = useState(false);
  const [hoverTray, setHoverTray] = useState(false);
  const [hoverBtn, setHoverBtn] = useState(false);
  const [anchorRect, setAnchorRect] = useState(null);
  const [openReason, setOpenReason] = useState("hover"); // "hover" | "press"

  const [burst, setBurst] = useState(null);
  const reactBtnRef = useRef(null);

  // hover-intent timers (prevents flicker)
  const openT = useRef(null);
  const closeT = useRef(null);

  function computeAnchor() {
    const el = reactBtnRef.current;
    if (!el) return null;
    return el.getBoundingClientRect();
  }

  function openTray() {
    const rect = computeAnchor();
    if (!rect) return;
    setAnchorRect(rect);
    setTrayOpen(true);
  }

  function closeTray() {
    setTrayOpen(false);
  }

  const longPress = useLongPress(
    () => {
      setOpenReason("press");
      openTray();
    },
    { delay: 260 }
  );

  useEffect(() => {
    if (!trayOpen) return;

    const update = () => {
      const r = computeAnchor();
      if (r) setAnchorRect(r);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [trayOpen]);

  useEffect(() => {
    if (!trayOpen) return;

    if (hoverBtn || hoverTray) {
      if (closeT.current) clearTimeout(closeT.current);
      closeT.current = null;
      return;
    }

    if (closeT.current) clearTimeout(closeT.current);
    closeT.current = setTimeout(() => setTrayOpen(false), 160);

    return () => {
      if (closeT.current) clearTimeout(closeT.current);
    };
  }, [hoverBtn, hoverTray, trayOpen]);

  function burstAtButton(emoji) {
    const el = reactBtnRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setBurst({ emoji, at: { x: r.left + r.width / 2, y: r.top + r.height / 2 } });
  }

  async function pickReaction(r) {
    closeTray();
    burstAtButton(r.emoji);
    await onReact?.(rant._id, r.key);
  }

  async function quickReact(e) {
    e?.stopPropagation();
    if (longPress.shouldCancelClick()) return;
    burstAtButton("🫂");
    await onReact?.(rant._id, "hug");
  }

  const hoverRot = rot + (rot > 0 ? 0.6 : -0.6);
  const goThread = () => nav(`/rant/${rant._id}`);

  return (
    <>
      {burst && (
        <EmojiBurst emoji={burst.emoji} at={burst.at} onDone={() => setBurst(null)} />
      )}

      <motion.div
        layout
        className={`relative inline-block ${widthClass} ${alignClass}`}
        style={{
          transform: `translate(${ox}px, ${oy}px) rotate(${rot}deg)`,
          transformOrigin: "40% 30%",
        }}
        whileHover={
          mode === "thread"
            ? undefined
            : { transform: `translate(${ox}px, ${oy - 2}px) rotate(${hoverRot}deg)` }
        }
        transition={{ type: "spring", stiffness: 240, damping: 18 }}
      >
        <button
          type="button"
          onClick={goThread}
          className="group relative w-full overflow-visible rounded-3xl border border-white/10 bg-white/[0.045] rw-card-shadow p-4 text-left"
        >
          {/* glow wash */}
          <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <div
              className={`absolute -top-24 left-1/3 h-64 w-64 rounded-full blur-[70px] bg-gradient-to-br ${themeGlow}`}
            />
          </div>

          <div className="relative flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl border border-white/10 bg-black/35 text-xs font-semibold text-white/80">
                {initials(author)}
              </div>

              <div className="min-w-0">
                <div className="text-[12px] text-white/70">
                  <span className="font-semibold text-white/90">{author}</span>
                </div>
                <div className="-mt-0.5 text-[11px] text-white/45">
                  {new Date(rant.createdAt).toLocaleString()}
                </div>
              </div>
            </div>

            {/* tiny icon chips */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 rounded-full border border-white/10 bg-black/35 px-2 py-1 text-[11px] text-white/70">
                <MessageCircle className="h-3.5 w-3.5" />
                <span className="tabular-nums">{rant.replies?.length || 0}</span>
              </div>

              <div className="grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-black/35 text-white/70">
                <ArrowUpRight className="h-4 w-4" />
              </div>
            </div>
          </div>

          <div className="relative mt-3 whitespace-pre-wrap text-sm leading-relaxed text-white/90">
            {rant.text}
          </div>

          <div className="relative mt-4 flex items-center justify-between gap-3">
            <button
              ref={reactBtnRef}
              type="button"
              onClick={quickReact}
              onMouseEnter={(e) => {
                e.stopPropagation();
                setOpenReason("hover");
                setHoverBtn(true);

                if (closeT.current) clearTimeout(closeT.current);

                if (openT.current) clearTimeout(openT.current);
                openT.current = setTimeout(() => {
                  if (!trayOpen) openTray();
                }, 80);
              }}
              onMouseLeave={(e) => {
                e.stopPropagation();
                setHoverBtn(false);
                if (openT.current) clearTimeout(openT.current);
                openT.current = null;
              }}
              onPointerDown={(e) => e.stopPropagation()}
              onPointerUp={(e) => e.stopPropagation()}
              {...longPress}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-1.5 text-xs text-white/85 hover:bg-white/10"
            >
              <span className="text-base leading-none">🫂</span>
              <span className="text-white/70">React</span>
              <span className="ml-1 tabular-nums text-white/55">
                {(counts.hug || 0) + (counts.lol || 0) + (counts.feel || 0) + (counts.rage || 0)}
              </span>
            </button>

            <div className="text-[11px] text-white/55">
              🫂 {counts.hug || 0} &nbsp; 😂 {counts.lol || 0} &nbsp; 🥲 {counts.feel || 0} &nbsp; 😤{" "}
              {counts.rage || 0}
            </div>
          </div>
        </button>
      </motion.div>

      <ReactionTray
        open={trayOpen}
        anchorRect={anchorRect}
        onPick={pickReaction}
        onClose={closeTray}
        onHoverChange={setHoverTray}
        withBackdrop={openReason === "press"}
      />
    </>
  );
}
