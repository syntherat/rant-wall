import { motion, useReducedMotion } from "framer-motion";

export default function AnimatedBackdrop() {
  const reduce = useReducedMotion();

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* aurora glow */}
      <div className="absolute inset-0">
        <motion.div
          aria-hidden
          className="absolute -left-24 -top-24 h-[420px] w-[420px] rounded-full blur-[70px]"
          style={{
            background:
              "radial-gradient(circle at 30% 30%, rgba(168,85,247,0.35), transparent 60%), radial-gradient(circle at 70% 70%, rgba(34,211,238,0.28), transparent 60%)",
          }}
          animate={reduce ? {} : { x: [0, 18, 0], y: [0, -16, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden
          className="absolute -right-28 top-28 h-[440px] w-[440px] rounded-full blur-[80px]"
          style={{
            background:
              "radial-gradient(circle at 35% 45%, rgba(244,63,94,0.22), transparent 55%), radial-gradient(circle at 60% 65%, rgba(99,102,241,0.22), transparent 60%)",
          }}
          animate={reduce ? {} : { x: [0, -22, 0], y: [0, 14, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden
          className="absolute left-1/2 top-[58%] h-[520px] w-[520px] -translate-x-1/2 rounded-full blur-[90px]"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, rgba(34,211,238,0.16), transparent 62%), radial-gradient(circle at 50% 30%, rgba(168,85,247,0.14), transparent 65%)",
          }}
          animate={reduce ? {} : { y: [0, 18, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* noise + vignette */}
      <div className="rw-noise" />
      <div className="rw-vignette" />
    </div>
  );
}
