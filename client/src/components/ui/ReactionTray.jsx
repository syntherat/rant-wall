import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";
import { useEffect, useMemo, useState } from "react";

const EMOJIS = [
  { key: "hug", emoji: "🫂", label: "Care" },
  { key: "lol", emoji: "😂", label: "Haha" },
  { key: "feel", emoji: "🥲", label: "Sad" },
  { key: "rage", emoji: "😤", label: "Angry" },
];

export default function ReactionTray({
  open,
  anchorRect,
  onPick,
  onClose,
  onHoverChange,
  withBackdrop = false, // ✅ NEW
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const pos = useMemo(() => {
    if (!anchorRect) return null;

    const trayW = 52 * EMOJIS.length + 18;
    const x = anchorRect.left + anchorRect.width / 2 - trayW / 2;
    const y = anchorRect.top - 72;

    const left = Math.max(10, Math.min(x, window.innerWidth - trayW - 10));
    const top = Math.max(10, y);

    return { left, top, trayW };
  }, [anchorRect?.left, anchorRect?.top, anchorRect?.width, anchorRect?.height, open]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && anchorRect && pos && (
        <>
          {/* ✅ Backdrop ONLY when needed (click/long-press).
              If you show this on hover, it will cover the button and cause flashing. */}
          {withBackdrop && (
            <motion.div
              className="fixed inset-0 z-[9998]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onMouseDown={onClose}
              onTouchStart={onClose}
            />
          )}

          <motion.div
            className="fixed z-[9999]"
            style={{ left: pos.left, top: pos.top }}
            initial={{ opacity: 0, y: 10, scale: 0.92, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 8, scale: 0.95, filter: "blur(10px)" }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            onMouseEnter={() => onHoverChange?.(true)}
            onMouseLeave={() => onHoverChange?.(false)}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-1 rounded-full border border-white/12 bg-black/65 px-2 py-2 backdrop-blur-xl">
              {EMOJIS.map((r) => (
                <motion.button
                  key={r.key}
                  whileHover={{ y: -10, scale: 1.22 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 520, damping: 22 }}
                  className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[0.03] hover:bg-white/10"
                  title={r.label}
                  onClick={() => onPick(r)}
                >
                  <span className="text-[20px] leading-none">{r.emoji}</span>
                </motion.button>
              ))}
            </div>

            <div className="mx-auto mt-1 h-0 w-0 border-x-[8px] border-t-[10px] border-x-transparent border-t-black/65" />
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
