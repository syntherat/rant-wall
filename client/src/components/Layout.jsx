import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { SessionProvider, useSession } from "../lib/session.jsx";
import { api } from "../lib/api";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { useLayoutEffect, useRef } from "react";
import AnimatedBackdrop from "./ui/AnimatedBackdrop.jsx";
import { page } from "./ui/Motion.jsx";
import {
  Sparkles,
  LogOut,
  Wand2,
  UserRound,
  Heart,
  ShoppingBag
} from "lucide-react";

function Shell() {
  const nav = useNavigate();
  const loc = useLocation();
  const { user, refresh } = useSession();

  const sheenRef = useRef(null);

  useLayoutEffect(() => {
    // tiny “sheen” animation on the header badge
    if (!sheenRef.current) return;
    const ctx = gsap.context(() => {
      gsap.to(sheenRef.current, {
        x: 180,
        duration: 1.6,
        ease: "power2.inOut",
        repeat: -1,
        yoyo: true,
      });
    });
    return () => ctx.revert();
  }, []);

  async function logout() {
    await api.logout();
    await refresh();
    nav("/");
  }

  return (
    <div className="relative min-h-screen text-white">
      <AnimatedBackdrop />

      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/35 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link to="/" className="group flex items-center gap-3">
            <div className="relative flex items-center">
              <img
                src="/logo.png"
                alt="Out Loud, but quiet"
                className="
      h-10 w-auto
      object-contain
      opacity-90
      transition
      duration-300
      group-hover:opacity-100
      group-hover:scale-[1.03]
      drop-shadow-[0_0_12px_rgba(168,85,247,0.25)]
    "
              />

              {/* optional soft sheen sweep */}
              <div
                ref={sheenRef}
                className="
      pointer-events-none
      absolute -left-20 top-0
      h-full w-20
      rotate-12
      bg-white/20
      blur-xl
      opacity-40
    "
              />
            </div>

            <div>
              <div className="text-sm font-semibold tracking-wide">
                Out Loud <span className="text-white/35">•</span>{" "}
                <span className="text-white/70">but quiet</span>
              </div>
              <div className="-mt-0.5 text-[11px] text-white/50">
                rant • react • release
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Link
                  to="/me"
                  className="group flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
                >
                  <UserRound className="h-4 w-4 text-white/65 group-hover:text-white/85" />
                  <span className="font-medium">{user.username}</span>
                  <span className="ml-1 rounded-full border border-white/10 bg-black/40 px-2 py-0.5 text-[11px] text-white/70">
                    VE {user.ventEnergy}
                  </span>
                </Link>

<Link
  to="/store"
  className="group flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
>
  <ShoppingBag className="h-4 w-4 text-white/65 group-hover:text-white/85" />
  Store
</Link>


                <button
                  onClick={logout}
                  className="group flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
                >
                  <LogOut className="h-4 w-4 text-white/65 group-hover:text-white/85" />
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-7xl px-4 py-7">
        <AnimatePresence mode="wait">
          <motion.div
            key={loc.pathname}
            variants={page}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="relative border-t border-white/10 bg-black/25">
        {/* ambient glow */}
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(900px 260px at 20% 0%, rgba(168,85,247,0.18), transparent 60%), radial-gradient(900px 260px at 80% 0%, rgba(34,211,238,0.14), transparent 60%)",
          }}
        />

        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-[1.3fr_1fr_1fr]">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <img
              src="/logo.png"
              alt="Out Loud, but quiet"
              className="h-25 w-auto object-contain opacity-90 drop-shadow-[0_0_22px_rgba(168,85,247,0.25)]"
            />

            <div className="text-sm font-semibold tracking-wide">
              Out Loud <span className="text-white/35">•</span>{" "}
              <span className="text-white/70">but quiet</span>
            </div>

            <div className="max-w-sm text-xs leading-relaxed text-white/55">
              A quiet space to release thoughts without identity, judgement, or
              permanence. Say what you need. Leave lighter.
            </div>
          </div>

          {/* Principles */}
          <div className="flex flex-col gap-3">
            <div className="text-xs font-semibold tracking-wider text-white/60">
              PRINCIPLES
            </div>

            <ul className="space-y-2 text-sm text-white/70">
              <li>• No real names</li>
              <li>• No public profiles</li>
              <li>• No tracking for attention</li>
              <li>• Reactions over replies</li>
              <li>• Quiet by design</li>
            </ul>
          </div>

          {/* Status */}
          <div className="flex flex-col gap-3">
            <div className="text-xs font-semibold tracking-wider text-white/60">
              SYSTEM
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between">
                <div className="text-xs text-white/55">Status</div>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/25" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-white/55" />
                  </span>
                  <span className="text-xs text-white/70">Quietly running</span>
                </div>
              </div>

              <div className="mt-2 text-[11px] text-white/45">
                Sessions are anonymous by default. Content may fade over time.
              </div>
            </div>
          </div>
        </div>

        {/* bottom bar */}
        <div className="relative border-t border-white/10">
          <div className="mx-auto max-w-7xl px-4 py-4 text-[11px] text-white/45 flex flex-col gap-1 md:flex-row md:justify-between">
            <div>© {new Date().getFullYear()} Out Loud, but quiet</div>
            <div className="text-white/35">
              No attribution. No authorship. Just space.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function Layout() {
  return (
    <SessionProvider>
      <Shell />
    </SessionProvider>
  );
}
