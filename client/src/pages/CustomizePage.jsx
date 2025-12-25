import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useSession } from "../lib/session";
import { motion } from "framer-motion";

const THEMES = [
  { id: "midnight", title: "Midnight", desc: "clean + neon calm", glow: "from-indigo-500/30 via-fuchsia-500/12 to-transparent" },
  { id: "ember", title: "Ember", desc: "hot thoughts, soft UI", glow: "from-rose-500/30 via-orange-400/12 to-transparent" },
  { id: "aurora", title: "Aurora", desc: "icy glow, dreamy", glow: "from-cyan-400/28 via-fuchsia-500/10 to-transparent" },
];

export default function CustomizePage() {
  const nav = useNavigate();
  const { user, loading, refresh } = useSession();

  useEffect(() => {
    if (!loading && !user) nav("/auth");
  }, [loading, user]);

  async function buyTheme(theme) {
    try {
      await api.buyCosmetic({ cardTheme: theme });
      await refresh();
    } catch (e) {
      alert(e.message);
    }
  }

  if (loading) return <div className="text-sm text-white/55">Loading…</div>;
  if (!user) return null;

  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <div className="text-2xl font-bold">Customize</div>
        <div className="mt-1 text-sm text-white/55">Spend VE to unlock vibes.</div>

        <div className="mt-4 rounded-2xl border border-white/10 bg-black/35 px-4 py-3">
          <div className="text-xs text-white/55">Your VE</div>
          <div className="text-2xl font-extrabold">VE {user.ventEnergy}</div>
          <div className="mt-1 text-xs text-white/45">Each theme costs 30 VE.</div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {THEMES.map((t) => (
          <motion.button
            key={t.id}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => buyTheme(t.id)}
            className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-4 text-left"
          >
            <div className={`pointer-events-none absolute -top-20 left-1/3 h-56 w-56 rounded-full blur-[70px] bg-gradient-to-br ${t.glow} opacity-0 group-hover:opacity-100 transition-opacity`} />
            <div className="relative">
              <div className="text-sm font-semibold">{t.title}</div>
              <div className="mt-1 text-xs text-white/55">{t.desc}</div>
              <div className="mt-3 inline-flex items-center rounded-full border border-white/10 bg-black/35 px-2.5 py-1 text-[11px] text-white/70">
                Cost: 30 VE
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
