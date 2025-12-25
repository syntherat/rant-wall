import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import { useSession } from "../lib/session";
import RantComposer from "../components/RantComposer";
import RantCard from "../components/RantCard";

function SkeletonCard({ h = 220 }) {
  return (
    <div
      className="mb-4 break-inside-avoid rounded-2xl border border-white/10 bg-white/[0.04] p-4"
      style={{ height: h }}
    >
      <div className="h-full animate-pulse space-y-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-white/10" />
          <div className="space-y-2">
            <div className="h-3 w-28 rounded bg-white/10" />
            <div className="h-3 w-20 rounded bg-white/10" />
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <div className="h-3 w-[92%] rounded bg-white/10" />
          <div className="h-3 w-[88%] rounded bg-white/10" />
          <div className="h-3 w-[70%] rounded bg-white/10" />
        </div>

        <div className="mt-auto flex items-center justify-between pt-3">
          <div className="h-8 w-32 rounded-full bg-white/10" />
          <div className="h-8 w-20 rounded-full bg-white/10" />
        </div>
      </div>
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-6">
      <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-rose-500/10 blur-[70px]" />
      <div className="pointer-events-none absolute -right-20 -bottom-16 h-56 w-56 rounded-full bg-orange-500/10 blur-[70px]" />

      <div className="relative">
        <div className="text-lg font-semibold tracking-tight">Couldn’t load rants</div>
        <div className="mt-1 text-sm text-white/60">
          {message || "The server didn’t respond. Try again in a moment."}
        </div>

        <button
          onClick={onRetry}
          className="mt-4 inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-medium text-white/90 hover:bg-white/[0.09] active:scale-[0.98]"
        >
          Retry
        </button>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center">
      <div className="pointer-events-none absolute -left-20 -top-20 h-56 w-56 rounded-full bg-indigo-500/10 blur-[70px]" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-56 w-56 rounded-full bg-fuchsia-500/10 blur-[70px]" />

      <div className="relative mx-auto max-w-md">
        <div className="text-xl font-semibold tracking-tight">It’s quiet here… for now.</div>
        <div className="mt-2 text-sm text-white/60">Be the first to drop a rant on the wall.</div>
      </div>
    </div>
  );
}

export default function FeedPage() {
  const { user, refresh } = useSession();
  const [rants, setRants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // viewer equipped (fallback only)
  const equipped = user?.equipped || {};
  const viewerTheme = equipped.rantTheme || "theme.midnight";
  const viewerEffect = equipped.rantEffect || "effect.none";
  const viewerGlow = equipped.nameGlow || "glow.none";

  const skeletonHeights = useMemo(() => [210, 260, 180, 320, 240, 200, 280, 190, 310], []);

  async function load() {
    setErr("");
    setLoading(true);
    try {
      const res = await api.listRants();
      setRants(res.rants || []);
    } catch (e) {
      setErr(e?.message || "Failed to fetch rants.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onCreated(rant) {
    setRants((p) => [rant, ...p]);
    await refresh(); // updates VE in navbar
  }

  async function react(id, key) {
    try {
      const res = await api.reactRant(id, key);
      setRants((p) => p.map((r) => (r._id === id ? res.rant : r)));
      await refresh(); // updates VE if server rewarded
    } catch (e) {
      alert(e.message);
    }
  }

  return (
    <div className="min-h-[calc(100vh-140px)] flex flex-col">
      <div className="space-y-6">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-5">
          <div className="pointer-events-none absolute -left-20 -top-20 h-56 w-56 rounded-full bg-indigo-500/10 blur-[70px]" />
          <div className="pointer-events-none absolute -right-24 bottom-0 h-56 w-56 rounded-full bg-fuchsia-500/10 blur-[70px]" />

          <div className="relative">
            <div className="text-2xl font-bold tracking-tight">The Wall</div>
            <div className="mt-1 text-sm text-white/55">Rant. React. Release.</div>
          </div>
        </div>

        <RantComposer onCreated={onCreated} />
      </div>

      <div className="flex-1 pt-6 pb-20">
        {loading ? (
          <div className="rw-masonry columns-1 sm:columns-2 lg:columns-3">
            {skeletonHeights.map((h, i) => (
              <SkeletonCard key={i} h={h} />
            ))}
          </div>
        ) : err ? (
          <ErrorState message={err} onRetry={load} />
        ) : rants.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="rw-masonry columns-1 sm:columns-2 lg:columns-3">
            {rants.map((r) => (
              <RantCard
                key={r._id}
                rant={r}
                onReact={react}
                // ✅ AUTHOR cosmetics (with viewer fallback, then defaults)
                theme={r?.cosmetics?.theme || viewerTheme}
                effect={r?.cosmetics?.effect || viewerEffect}
                nameGlow={r?.cosmetics?.glow || viewerGlow}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
