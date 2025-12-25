import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useSession } from "../lib/session";
import { motion } from "framer-motion";

export default function AuthPage() {
  const nav = useNavigate();
  const { refresh } = useSession();

  const [tab, setTab] = useState("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  async function submit() {
    setErr("");
    try {
      if (tab === "login") await api.login({ email, password });
      else await api.register({ username, email, password });

      await refresh();
      nav("/");
    } catch (e) {
      setErr(e.message);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-6">
        <div className="pointer-events-none absolute -left-24 -top-20 h-64 w-64 rounded-full bg-cyan-400/10 blur-[70px]" />
        <div className="pointer-events-none absolute -right-28 top-24 h-64 w-64 rounded-full bg-fuchsia-500/10 blur-[70px]" />

        <div className="relative">
          <div className="text-xl font-bold">Sign in</div>
          <div className="mt-1 text-sm text-white/55">Local or Google OAuth — same vibe.</div>

          <a
            href={api.googleLoginUrl}
            className="mt-4 block rounded-2xl border border-white/10 bg-white px-4 py-2 text-center text-sm font-semibold text-black hover:opacity-90"
          >
            Continue with Google
          </a>

          <div className="my-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/10" />
            <div className="text-xs text-white/40">or</div>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setTab("login")}
              className={`rounded-2xl border border-white/10 px-3 py-2 text-sm ${
                tab === "login" ? "bg-white text-black" : "bg-white/5 hover:bg-white/10"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setTab("register")}
              className={`rounded-2xl border border-white/10 px-3 py-2 text-sm ${
                tab === "register" ? "bg-white text-black" : "bg-white/5 hover:bg-white/10"
              }`}
            >
              Register
            </button>
          </div>

          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.2 }}
          >
            {tab === "register" && (
              <input
                className="mt-4 w-full rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white/90 outline-none placeholder:text-white/35 focus:border-white/20"
                placeholder="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            )}

            <input
              className="mt-4 w-full rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white/90 outline-none placeholder:text-white/35 focus:border-white/20"
              placeholder="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              className="mt-3 w-full rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white/90 outline-none placeholder:text-white/35 focus:border-white/20"
              placeholder="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {err && <div className="mt-3 text-xs text-red-300">{err}</div>}

            <button
              onClick={submit}
              className="mt-4 w-full rounded-2xl border border-white/10 bg-white px-4 py-2 text-sm font-semibold text-black hover:opacity-90"
            >
              {tab === "login" ? "Login" : "Create account"}
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
