import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ReactionTray from "./ui/ReactionTray.jsx";
import EmojiBurst from "./ui/EmojiBurst.jsx";
import useLongPress from "./ui/useLongPress.js";
import { MessageCircle, ArrowUpRight } from "lucide-react";
import { themeStyle, glowStyle, effectStyle } from "../lib/cosmetics";

function initials(name = "Anon") {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() || "").join("");
}

export default function RantCard({
  rant,
  onReact,
  theme = "theme.midnight",
  effect = "effect.none",
  nameGlow = "glow.none",
}) {
  const nav = useNavigate();

  const counts = rant.reactions || {};
  const author = rant.authorMode === "public" ? rant.authorName : rant.anonAlias;

  // Cosmetics registry
  const t = themeStyle(theme);
  const g = glowStyle(nameGlow);
  const e = effectStyle(effect);

  // Glow only for public usernames
  const showGlow = rant.authorMode === "public" && nameGlow && nameGlow !== "glow.none";

  // IG reaction system
  const [trayOpen, setTrayOpen] = useState(false);
  const [hoverTray, setHoverTray] = useState(false);
  const [hoverBtn, setHoverBtn] = useState(false);
  const [anchorRect, setAnchorRect] = useState(null);
  const [openReason, setOpenReason] = useState("hover"); // "hover" | "press"

  const [burst, setBurst] = useState(null);
  const reactBtnRef = useRef(null);

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

  async function quickReact(e2) {
    e2?.stopPropagation();
    if (longPress.shouldCancelClick()) return;
    burstAtButton("🫂");
    await onReact?.(rant._id, "hug");
  }

  const goThread = () => nav(`/rant/${rant._id}`);

  return (
    <>
      {burst && <EmojiBurst emoji={burst.emoji} at={burst.at} onDone={() => setBurst(null)} />}

      <motion.div
        layout
        className="relative w-full"
        whileHover={{ y: -2 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <button
          type="button"
          onClick={goThread}
          className={[
            "group relative w-full overflow-hidden rounded-3xl border p-4 text-left transition",
            t.cardClass,
            e.overlayClass || "",
          ].join(" ")}
        >
          {/* theme glow / rim */}
          {(t.topGlow || t.rim) && (
            <div className="pointer-events-none absolute inset-0">
              {t.topGlow && (
                <div className="absolute inset-0 opacity-100" style={{ background: t.topGlow }} />
              )}
              {t.rim && (
                <div
                  className="absolute inset-x-0 top-0 h-[2px] opacity-90"
                  style={{ background: t.rim }}
                />
              )}
            </div>
          )}

          {/* small hover lift shine */}
          <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <div className="absolute -top-24 left-1/3 h-64 w-64 rounded-full bg-white/8 blur-[70px]" />
          </div>

          <div className="relative flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <div
                className={[
                  "grid h-9 w-9 shrink-0 place-items-center rounded-2xl border text-xs font-semibold",
                  theme.startsWith("theme.paper")
                    ? "border-black/15 bg-black/5 text-black/70"
                    : "border-white/10 bg-black/35 text-white/80",
                ].join(" ")}
              >
                {initials(author)}
              </div>

              <div className="min-w-0">
                <div className={theme.startsWith("theme.paper") ? "text-[15px] text-black/70 font-outfit" : "text-[15px] text-white/70 font-outfit"}>
                  <span
                    className={[
                      "font-semibold",
                      showGlow
                        ? g.className
                        : theme.startsWith("theme.paper")
                          ? "text-black/90"
                          : "text-white/90",
                    ].join(" ")}
                  >
                    {author}
                  </span>
                </div>

                <div className={theme.startsWith("theme.paper") ? "-mt-0.5 text-[11px] text-black/45" : "-mt-0.5 text-[11px] text-white/45"}>
                  {new Date(rant.createdAt).toLocaleString()}
                </div>
              </div>
            </div>

            {/* tiny icon chips */}
            <div className="flex items-center gap-2">
              <div
                className={[
                  "flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] tabular-nums",
                  theme.startsWith("theme.paper")
                    ? "border-black/15 bg-black/5 text-black/70"
                    : "border-white/10 bg-black/35 text-white/70",
                ].join(" ")}
              >
                <MessageCircle className="h-3.5 w-3.5" />
                <span>{rant.replies?.length || 0}</span>
              </div>

              <div
                className={[
                  "grid h-8 w-8 place-items-center rounded-full border",
                  theme.startsWith("theme.paper")
                    ? "border-black/15 bg-black/5 text-black/70"
                    : "border-white/10 bg-black/35 text-white/70",
                ].join(" ")}
              >
                <ArrowUpRight className="h-4 w-4" />
              </div>
            </div>
          </div>

        <div
          className={[
            "relative mt-3 whitespace-pre-wrap break-words [overflow-wrap:anywhere] text-sm leading-relaxed",
            theme.startsWith("theme.paper") ? "text-black/90" : "text-white/90",
          ].join(" ")}
        >
          {rant.text}
        </div>

          <div className="relative mt-4 flex items-center justify-between gap-3">
            <button
              ref={reactBtnRef}
              type="button"
              onClick={quickReact}
              onMouseEnter={(ev) => {
                ev.stopPropagation();
                setOpenReason("hover");
                setHoverBtn(true);

                if (closeT.current) clearTimeout(closeT.current);

                if (openT.current) clearTimeout(openT.current);
                openT.current = setTimeout(() => {
                  if (!trayOpen) openTray();
                }, 80);
              }}
              onMouseLeave={(ev) => {
                ev.stopPropagation();
                setHoverBtn(false);
                if (openT.current) clearTimeout(openT.current);
                openT.current = null;
              }}
              onPointerDown={(ev) => ev.stopPropagation()}
              onPointerUp={(ev) => ev.stopPropagation()}
              {...longPress}
              className={[
                "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs hover:opacity-95",
                theme.startsWith("theme.paper")
                  ? "border-black/15 bg-black/5 text-black/85 hover:bg-black/10"
                  : "border-white/10 bg-black/40 text-white/85 hover:bg-white/10",
              ].join(" ")}
            >
              <span className="text-base leading-none">🫂</span>
              <span className={theme.startsWith("theme.paper") ? "text-black/70" : "text-white/70"}>React</span>
              <span className={theme.startsWith("theme.paper") ? "ml-1 tabular-nums text-black/55" : "ml-1 tabular-nums text-white/55"}>
                {(counts.hug || 0) + (counts.lol || 0) + (counts.feel || 0) + (counts.rage || 0)}
              </span>
            </button>

            <div className={theme.startsWith("theme.paper") ? "text-[11px] text-black/55" : "text-[11px] text-white/55"}>
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
