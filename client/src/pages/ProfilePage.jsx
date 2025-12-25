import { useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSession } from "../lib/session";
import { Shield, Sparkles, ArrowLeft, Copy } from "lucide-react";

function SkeletonLine({ w = "w-full" }) {
  return <div className={`h-3 ${w} rounded-full bg-white/10 animate-pulse`} />;
}

function ProfileSkeleton() {
  return (
    <div className="mx-auto max-w-lg space-y-4">
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3 w-full">
            <div className="h-6 w-40 rounded-full bg-white/10 animate-pulse" />
            <SkeletonLine w="w-64" />
          </div>
          <div className="h-10 w-10 rounded-2xl bg-white/10 animate-pulse" />
        </div>

        <div className="mt-5 rounded-2xl border border-white/10 bg-black/35 px-4 py-4">
          <SkeletonLine w="w-24" />
          <div className="mt-2 h-8 w-28 rounded-full bg-white/10 animate-pulse" />
        </div>

        <div className="mt-5 grid gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <SkeletonLine w="w-28" />
            <div className="mt-3 space-y-2">
              <SkeletonLine w="w-48" />
              <SkeletonLine w="w-40" />
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <SkeletonLine w="w-32" />
            <div className="mt-3 space-y-2">
              <SkeletonLine w="w-56" />
              <SkeletonLine w="w-44" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const nav = useNavigate();
  const { user, loading } = useSession();

  useEffect(() => {
    if (!loading && !user) nav("/auth");
  }, [loading, user, nav]);

  // quick derived stuff (safe fallbacks)
  const theme = user?.cosmetic?.cardTheme || "midnight";
  const badge = user?.cosmetic?.badge || "none";
  const ve = typeof user?.ventEnergy === "number" ? user.ventEnergy : 0;

  // a cute “tier” label so VE feels meaningful
  const veTier = useMemo(() => {
    if (ve >= 2000) return "Storm Mode";
    if (ve >= 800) return "High Voltage";
    if (ve >= 250) return "Warming Up";
    return "Quiet Start";
  }, [ve]);

  async function copy(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {}
  }

  if (loading) return <ProfileSkeleton />;
  if (!user) return null;

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
        {/* header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xl font-bold">{user.username}</div>
            <div className="mt-1 text-sm text-white/60">{user.email}</div>

            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[11px] text-white/70">
                Theme: <span className="text-white/90">{theme}</span>
              </span>
              <span className="rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[11px] text-white/70">
                Badge: <span className="text-white/90">{badge}</span>
              </span>
            </div>
          </div>

          <button
            onClick={() => copy(user.email)}
            className="rounded-2xl border border-white/10 bg-white/5 p-2 hover:bg-white/10"
            title="Copy email"
          >
            <Copy className="h-4 w-4 text-white/70" />
          </button>
        </div>

        {/* VE card */}
        <div className="mt-5 rounded-2xl border border-white/10 bg-black/35 px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="text-xs text-white/55">Vent Energy</div>
            <div className="text-[11px] text-white/50">{veTier}</div>
          </div>
          <div className="mt-1 flex items-end justify-between">
            <div className="text-2xl font-extrabold">VE {ve}</div>

            {/* tiny bar */}
            <div className="h-2 w-40 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-white/40"
                style={{ width: `${Math.min(100, (ve / 2000) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* extra sections */}
        <div className="mt-5 grid gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-white/60">
              <Sparkles className="h-4 w-4 text-white/60" />
              CUSTOMIZATION
            </div>
            <div className="mt-2 text-sm text-white/60">
              Your profile is intentionally minimal. Cosmetics only affect how *you* experience the space.
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                to="/customize"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
              >
                <Sparkles className="h-4 w-4 text-white/70" />
                Customize
              </Link>

              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
              >
                <ArrowLeft className="h-4 w-4 text-white/70" />
                Back to feed
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-white/60">
              <Shield className="h-4 w-4 text-white/60" />
              PRIVACY
            </div>

            <ul className="mt-3 space-y-2 text-sm text-white/65">
              <li>• No public profiles / followers.</li>
              <li>• Default is anonymous-by-design.</li>
              <li>• “Vent Energy” is a private progression meter.</li>
              <li>• Keep it human. Keep it safe.</li>
            </ul>

            <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-3 text-[12px] text-white/55">
              Tip: If you’re aiming for maximum anonymity, avoid unique phrases and personally identifying details.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
