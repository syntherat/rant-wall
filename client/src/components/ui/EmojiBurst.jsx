import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

function rand(min, max) {
  return min + Math.random() * (max - min);
}

export default function EmojiBurst({ emoji = "❤️", at, onDone }) {
  const [show, setShow] = useState(true);

  const particles = useMemo(() => {
    const n = 9;
    return Array.from({ length: n }).map((_, i) => {
      const angle = rand(-Math.PI * 0.9, -Math.PI * 0.1);
      const dist = rand(22, 60);
      const dx = Math.cos(angle) * dist + rand(-6, 6);
      const dy = Math.sin(angle) * dist + rand(-6, 6);
      const rot = rand(-28, 28);
      const scale = rand(0.9, 1.25);
      const dur = rand(0.45, 0.7);
      return { i, dx, dy, rot, scale, dur };
    });
  }, [emoji, at?.x, at?.y]);

  useEffect(() => {
    const t = setTimeout(() => setShow(false), 720);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!show) {
      const t = setTimeout(() => onDone?.(), 220);
      return () => clearTimeout(t);
    }
  }, [show]);

  if (!at) return null;

  return (
    <AnimatePresence>
      {show && (
        <div
          className="pointer-events-none fixed z-[9999]"
          style={{ left: at.x, top: at.y, transform: "translate(-50%, -50%)" }}
        >
          {particles.map((p) => (
            <motion.div
              key={p.i}
              initial={{ opacity: 0, y: 8, scale: 0.7 }}
              animate={{
                opacity: [0, 1, 0],
                x: [0, p.dx],
                y: [0, p.dy],
                rotate: [0, p.rot],
                scale: [0.7, p.scale, 0.85],
                filter: ["blur(0px)", "blur(0px)", "blur(1px)"],
              }}
              transition={{ duration: p.dur, ease: "easeOut" }}
              className="absolute select-none text-[18px] drop-shadow"
            >
              {emoji}
            </motion.div>
          ))}
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: [0, 1, 0], scale: [0.7, 1.1, 0.9] }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="absolute select-none text-[22px] drop-shadow"
          >
            {emoji}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
