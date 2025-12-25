import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import { useSession } from "../lib/session";
import { motion, AnimatePresence } from "framer-motion";
import RantCard from "../components/RantCard";
import { X, ShoppingBag, Sparkles, CheckCircle2 } from "lucide-react";
import { themeStyle, glowStyle, effectStyle } from "../lib/cosmetics";

function slotForType(type) {
  if (type === "rantTheme") return "rantTheme";
  if (type === "profileTheme") return "profileTheme";
  if (type === "nameGlow") return "nameGlow";
  if (type === "rantEffect") return "rantEffect";
  return null;
}

function rarityPill(rarity = "common") {
  const map = {
    common: "bg-white/5 text-white/70 border-white/10",
    rare: "bg-cyan-500/10 text-cyan-200/80 border-cyan-400/20",
    epic: "bg-fuchsia-500/10 text-fuchsia-200/80 border-fuchsia-400/20",
    legendary: "bg-amber-500/10 text-amber-200/80 border-amber-400/20",
  };
  return map[rarity] || map.common;
}

function Modal({ open, onClose, children }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={onClose}
          />
          <motion.div
            className="fixed left-1/2 top-1/2 z-[91] w-[min(960px,92vw)] -translate-x-1/2 -translate-y-1/2"
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
          >
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#07070b] p-5">
              <button
                onClick={onClose}
                className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10"
              >
                <X className="h-4 w-4 text-white/70" />
              </button>
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function StoreSection({ title, subtitle, items, renderItem }) {
  if (!items.length) return null;
  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-lg font-semibold">{title}</div>
          <div className="text-sm text-white/55">{subtitle}</div>
        </div>
        <div className="text-[12px] text-white/45">{items.length} items</div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">{items.map(renderItem)}</div>
    </section>
  );
}

function CosmeticDemo({ it }) {
  // Each store card shows what it sells.
  if (it.type === "rantTheme") {
    const t = themeStyle(it.key);
    return (
      <div className={["relative overflow-hidden rounded-2xl border p-3", t.cardClass].join(" ")}>
        {t.topGlow && (
          <div className="pointer-events-none absolute inset-0" style={{ background: t.topGlow }} />
        )}
        {t.rim && (
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px]" style={{ background: t.rim }} />
        )}
        <div className="relative text-xs opacity-85">Theme Preview</div>
        <div className="relative mt-1 text-[11px] opacity-70">
          bg + border + vibe changed
        </div>
      </div>
    );
  }

  if (it.type === "nameGlow") {
    const g = glowStyle(it.key);
    return (
      <div className="rounded-2xl border border-white/10 bg-black/35 p-3">
        <div className="text-[11px] text-white/55">Name glow</div>
        <div className={["mt-1 text-sm font-semibold", g.className].join(" ")}>
          {it.name}
        </div>
      </div>
    );
  }

  if (it.type === "rantEffect") {
    const e = effectStyle(it.key);
    return (
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/35 p-3">
        <div className="text-[11px] text-white/55">Effect surface</div>
        <div className="mt-2 h-10 rounded-xl border border-white/10 bg-white/5" />
        <div className={["pointer-events-none absolute inset-0", e.overlayClass || ""].join(" ")} />
      </div>
    );
  }

  // profileTheme: simple indicator (you can later style your profile background from cosmetics.js)
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
      <div className="text-[11px] text-white/55">Profile theme</div>
      <div className="mt-1 text-xs text-white/70">{it.key}</div>
    </div>
  );
}

function StoreItemCard({ it, owned, equipped, onPreview, onBuy, onEquip }) {
  const slot = slotForType(it.type);
  const isEquipped = slot ? equipped?.[slot] === it.key : false;

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 space-y-3">
      <CosmeticDemo it={it} />

      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">{it.name}</div>
          <div className="mt-1 text-xs text-white/55">{it.desc}</div>

          <div className="mt-3 flex flex-wrap gap-2">
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] ${rarityPill(
                it.rarity
              )}`}
            >
              {it.rarity || "common"}
            </span>

            <span className="inline-flex items-center rounded-full border border-white/10 bg-black/35 px-2.5 py-1 text-[11px] text-white/70">
              {it.type}
            </span>

            <span className="inline-flex items-center rounded-full border border-white/10 bg-black/35 px-2.5 py-1 text-[11px] text-white/70">
              Cost: {it.priceVE} VE
            </span>
          </div>
        </div>

        {owned && (
          <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-emerald-500/10 px-2 py-1 text-[11px] text-emerald-200/80">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Owned
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={onPreview}
          className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
        >
          <Sparkles className="h-4 w-4 text-white/70" />
          Preview
        </button>

        {!owned ? (
          <button
            onClick={onBuy}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white px-3 py-2 text-sm font-semibold text-black hover:opacity-95"
          >
            <ShoppingBag className="h-4 w-4" />
            Buy
          </button>
        ) : slot ? (
          <button
            onClick={() => onEquip(slot, it.key)}
            className={[
              "inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm",
              isEquipped
                ? "border-white/10 bg-emerald-500/10 text-emerald-200/90"
                : "border-white/10 bg-white/5 text-white/90 hover:bg-white/10",
            ].join(" ")}
          >
            {isEquipped ? "Equipped" : "Equip"}
          </button>
        ) : null}
      </div>
    </div>
  );
}

export default function StorePage() {
  const { user, loading: sessionLoading, refresh } = useSession();

  const [items, setItems] = useState([]);
  const [inv, setInv] = useState(null); // {inventory, equipped, ventEnergy}
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [preview, setPreview] = useState(null); // store item

  const ownedSet = useMemo(() => {
    const s = new Set();
    (inv?.inventory || []).forEach((x) => s.add(x.itemKey));
    return s;
  }, [inv]);

  const grouped = useMemo(() => {
    const g = { rantTheme: [], nameGlow: [], rantEffect: [], profileTheme: [] };
    (items || []).forEach((it) => {
      if (g[it.type]) g[it.type].push(it);
    });
    return g;
  }, [items]);

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const [storeRes, invRes] = await Promise.all([
        api.storeItems(),
        user ? api.inventory() : Promise.resolve({ inventory: [], equipped: {}, ventEnergy: 0 }),
      ]);
      setItems(storeRes.items || []);
      setInv(invRes);
    } catch (e) {
      setErr(e?.message || "Couldn’t load store.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!sessionLoading) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionLoading, user?.email]);

  async function buy(itemKey) {
    if (!user) return alert("Login to buy cosmetics.");
    try {
      await api.buyItem(itemKey);
      await refresh();
      await load();
    } catch (e) {
      alert(e.message);
    }
  }

  async function equip(slot, itemKey) {
    if (!user) return alert("Login to equip cosmetics.");
    try {
      await api.equipItem(slot, itemKey);
      await refresh();
      await load();
    } catch (e) {
      alert(e.message);
    }
  }

  const equipped = inv?.equipped || {};
  const ve = inv?.ventEnergy ?? user?.ventEnergy ?? 0;

  const previewEquipped = useMemo(() => {
    if (!preview) return null;
    const slot = slotForType(preview.type);
    if (!slot) return null;
    return { ...equipped, [slot]: preview.key };
  }, [preview, equipped]);

  const previewRant = useMemo(
    () => ({
      _id: "preview",
      createdAt: new Date().toISOString(),
      text:
        "Preview cosmetics.\nThemes should feel different.\nGlows + effects should be obvious.",
      authorMode: "public",
      authorName: user?.username || "Public User",
      anonAlias: "Anon",
      reactions: { hug: 12, lol: 4, feel: 2, rage: 1 },
      replies: [{}, {}, {}],
    }),
    [user?.username]
  );

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-2xl font-bold">Store</div>
            <div className="mt-1 text-sm text-white/55">
              Themes • Glows • Effects — visible, not subtle.
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-right">
            <div className="text-xs text-white/55">Your VE</div>
            <div className="text-2xl font-extrabold">VE {ve}</div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-sm text-white/55">Loading store…</div>
      ) : err ? (
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-sm text-white/60">
          {err}
          <button
            onClick={load}
            className="mt-3 block rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
          >
            Retry
          </button>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-sm text-white/60">
          <div className="text-lg font-semibold text-white/85">No items yet</div>
          <div className="mt-1 text-white/55">
            Your store is connected — it just has 0 items in the database.
          </div>
          <div className="mt-4 text-[12px] text-white/45">
            Seed items once: <span className="text-white/70">npm run seed:store</span>
          </div>
        </div>
      ) : (
        <div className="space-y-10">
          <StoreSection
            title="Themes"
            subtitle="Card background + border + vibe."
            items={grouped.rantTheme}
            renderItem={(it) => (
              <StoreItemCard
                key={it.key}
                it={it}
                owned={ownedSet.has(it.key)}
                equipped={equipped}
                onPreview={() => setPreview(it)}
                onBuy={() => buy(it.key)}
                onEquip={equip}
              />
            )}
          />

          <StoreSection
            title="Name Glows"
            subtitle="Public usernames only — make it pop."
            items={grouped.nameGlow}
            renderItem={(it) => (
              <StoreItemCard
                key={it.key}
                it={it}
                owned={ownedSet.has(it.key)}
                equipped={equipped}
                onPreview={() => setPreview(it)}
                onBuy={() => buy(it.key)}
                onEquip={equip}
              />
            )}
          />

          <StoreSection
            title="Effects"
            subtitle="Texture / motion overlays."
            items={grouped.rantEffect}
            renderItem={(it) => (
              <StoreItemCard
                key={it.key}
                it={it}
                owned={ownedSet.has(it.key)}
                equipped={equipped}
                onPreview={() => setPreview(it)}
                onBuy={() => buy(it.key)}
                onEquip={equip}
              />
            )}
          />

          <StoreSection
            title="Profile Themes"
            subtitle="Profile ambience (optional)."
            items={grouped.profileTheme}
            renderItem={(it) => (
              <StoreItemCard
                key={it.key}
                it={it}
                owned={ownedSet.has(it.key)}
                equipped={equipped}
                onPreview={() => setPreview(it)}
                onBuy={() => buy(it.key)}
                onEquip={equip}
              />
            )}
          />
        </div>
      )}

      <Modal open={!!preview} onClose={() => setPreview(null)}>
        <div className="space-y-4">
          <div className="text-lg font-semibold">Preview</div>
          <div className="text-sm text-white/55">
            Local preview. Buying saves it. Equipping applies everywhere.
          </div>

          <div className="pt-2">
            <RantCard
              rant={previewRant}
              onReact={() => {}}
              theme={previewEquipped?.rantTheme || equipped.rantTheme || "theme.midnight"}
              effect={previewEquipped?.rantEffect || equipped.rantEffect || "effect.none"}
              nameGlow={previewEquipped?.nameGlow || equipped.nameGlow || "glow.none"}
              mode="thread"
            />
          </div>

          <div className="flex flex-wrap justify-end gap-2">
            <button
              onClick={() => setPreview(null)}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
            >
              Close
            </button>

            {preview && (
              <>
                {!ownedSet.has(preview.key) ? (
                  <button
                    onClick={() => buy(preview.key)}
                    className="rounded-2xl border border-white/10 bg-white px-4 py-2 text-sm font-semibold text-black"
                  >
                    Buy for {preview.priceVE} VE
                  </button>
                ) : (
                  (() => {
                    const slot = slotForType(preview.type);
                    if (!slot) return null;
                    return (
                      <button
                        onClick={() => equip(slot, preview.key)}
                        className="rounded-2xl border border-white/10 bg-white px-4 py-2 text-sm font-semibold text-black"
                      >
                        Equip
                      </button>
                    );
                  })()
                )}
              </>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
