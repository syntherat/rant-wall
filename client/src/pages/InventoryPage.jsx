import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import { useSession } from "../lib/session";
import RantCard from "../components/RantCard";
import { Sparkles } from "lucide-react";
import { themeStyle, glowStyle, effectStyle } from "../lib/cosmetics";
import ModalPortal from "../components/ui/ModalPortal";
import { CheckCircle2 } from "lucide-react";

function slotForType(type) {
  if (type === "rantTheme") return "rantTheme";
  if (type === "profileTheme") return "profileTheme";
  if (type === "nameGlow") return "nameGlow";
  if (type === "rantEffect") return "rantEffect";
  return null;
}

function prettySlot(slot) {
  const map = {
    rantTheme: "Rant Theme",
    rantEffect: "Rant Effect",
    nameGlow: "Name Glow",
    profileTheme: "Profile Theme",
  };
  return map[slot] || slot;
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

function defaultForSlot(slot) {
  if (slot === "rantTheme") return "theme.midnight";
  if (slot === "profileTheme") return "profile.midnight";
  if (slot === "nameGlow") return "glow.none";
  if (slot === "rantEffect") return "effect.none";
  return null;
}

function CosmeticDemo({ it }) {
  if (it.type === "rantTheme") {
    const t = themeStyle(it.key);
    return (
      <div className={["relative overflow-hidden rounded-2xl border p-3", t.cardClass].join(" ")}>
        {t.topGlow && <div className="pointer-events-none absolute inset-0" style={{ background: t.topGlow }} />}
        {t.rim && (
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px]" style={{ background: t.rim }} />
        )}
        <div className="relative text-xs opacity-85">Theme Preview</div>
        <div className="relative mt-1 text-[11px] opacity-70">bg + border + vibe changed</div>
      </div>
    );
  }

  if (it.type === "nameGlow") {
    const g = glowStyle(it.key);
    return (
      <div className="rounded-2xl border border-white/10 bg-black/35 p-3">
        <div className="text-[11px] text-white/55">Name glow</div>
        <div className={["mt-1 text-sm font-semibold", g.className].join(" ")}>{it.name}</div>
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

  // profileTheme
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
      <div className="text-[11px] text-white/55">Profile theme</div>
      <div className="mt-1 text-xs text-white/70">{it.name || it.key}</div>
    </div>
  );
}

function OwnedItemCard({ it, equipped, onPreview, onEquip, onUnequip }) {
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
              {prettySlot(slotForType(it.type) || it.type)}
            </span>
          </div>
        </div>

        <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-emerald-500/10 px-2 py-1 text-[11px] text-emerald-200/80">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Owned
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={onPreview}
          className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
        >
          <Sparkles className="h-4 w-4 text-white/70" />
          Preview
        </button>

        {slot && (
          <>
            {!isEquipped ? (
              <button
                onClick={() => onEquip(slot, it.key)}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90 hover:bg-white/10"
              >
                Equip
              </button>
            ) : (
              <button
                onClick={() => onUnequip(slot)}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200/90"
              >
                Equipped • Unequip
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function InventoryPage() {
  const { user, loading: sessionLoading, refresh } = useSession();

  const [inv, setInv] = useState(null);
  const [store, setStore] = useState([]);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState(null);

  const equipped = inv?.equipped || {};

  const storeMap = useMemo(() => {
    const m = new Map();
    (store || []).forEach((it) => m.set(it.key, it));
    return m;
  }, [store]);

  // Join inventory keys with store metadata so UI shows proper names/descriptions
  const ownedItems = useMemo(() => {
    const keys = (inv?.inventory || []).map((x) => x.itemKey);
    return keys
      .map((k) => storeMap.get(k) || { key: k, name: k, desc: "", type: "unknown", rarity: "common", priceVE: 0 })
      .filter((x) => x && x.key);
  }, [inv, storeMap]);

  const grouped = useMemo(() => {
    const g = { rantTheme: [], nameGlow: [], rantEffect: [], profileTheme: [], unknown: [] };
    (ownedItems || []).forEach((it) => {
      if (g[it.type]) g[it.type].push(it);
      else g.unknown.push(it);
    });
    return g;
  }, [ownedItems]);

  const previewEquipped = useMemo(() => {
    if (!preview) return null;
    const slot = slotForType(preview.type);
    if (!slot) return null;
    return { ...equipped, [slot]: preview.key };
  }, [preview, equipped]);

  const previewRant = useMemo(() => {
    const username = user?.username || "Public User";
    return {
      _id: "preview2",
      createdAt: new Date().toISOString(),
      text: "Inventory preview.\nEquip applies everywhere.\nUnequip resets to default.",
      authorMode: "public",
      authorName: username,
      anonAlias: "Anon",
      reactions: { hug: 7, lol: 2, feel: 3, rage: 1 },
      replies: [{}, {}],
    };
  }, [user?.username]);

  function displayEquippedName(slot) {
    const key = equipped?.[slot] || defaultForSlot(slot);
    const it = storeMap.get(key);
    return it?.name || key; // never show raw keys if name exists
  }

  function equippedItemForSlot(slot) {
  const key = equipped?.[slot] || defaultForSlot(slot);

  // try to use store metadata (nice name/desc/rarity)
  const it = storeMap.get(key);

  // if not found, still return something CosmeticDemo understands
  return (
    it || {
      key,
      name: displayEquippedName(slot),
      desc: "",
      type: slot, // IMPORTANT: matches CosmeticDemo branches (rantTheme/nameGlow/rantEffect/profileTheme)
      rarity: "common",
      priceVE: 0,
    }
  );
}


  async function load() {
    setLoading(true);
    try {
      const [invRes, storeRes] = await Promise.all([api.inventory(), api.storeItems()]);
      setInv(invRes);
      setStore(storeRes.items || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!sessionLoading && user) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionLoading, user?.email]);

  async function equip(slot, key) {
    await api.equipItem(slot, key);
    await refresh();
    await load();
  }

  async function unequip(slot) {
    await api.equipItem(slot, null);
    await refresh();
    await load();
  }

  if (sessionLoading) return <div className="text-sm text-white/55">Loading…</div>;
  if (!user) return <div className="text-sm text-white/55">Login to view your inventory.</div>;

  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <div className="text-2xl font-bold">Inventory</div>
        <div className="mt-1 text-sm text-white/55">Your owned cosmetics + equipped loadout.</div>
      </div>

      {loading ? (
        <div className="text-sm text-white/55">Loading inventory…</div>
      ) : (
        <>
          {/* Equipped overview (no raw keys) */}
{/* Equipped overview (now with mini visual demos) */}
<div className="grid gap-3 md:grid-cols-2">
  {["rantTheme", "rantEffect", "nameGlow", "profileTheme"].map((slot) => {
    const it = equippedItemForSlot(slot);

    return (
      <div key={slot} className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-xs font-semibold tracking-wider text-white/60">
              {prettySlot(slot).toUpperCase()}
            </div>

            <div className="mt-2 text-sm text-white/80">
              Equipped:{" "}
              <span className="font-semibold text-white/90 break-words">
                {it?.name || displayEquippedName(slot)}
              </span>
            </div>
          </div>

          {/* Tiny demo (same component as store) */}
          <div className="w-[180px] shrink-0">
            <CosmeticDemo it={it} />
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={() => setPreview(it)} // let them preview directly from equipped section
            className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
          >
            Preview
          </button>

          <button
            onClick={() => unequip(slot)}
            className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
          >
            Unequip (reset)
          </button>
        </div>
      </div>
    );
  })}
</div>


          {/* Owned items: store-style cards + grouped like store */}
          <div className="space-y-10">
            {[
              ["rantTheme", "Themes", "Card background + border + vibe."],
              ["nameGlow", "Name Glows", "Public usernames only — make it pop."],
              ["rantEffect", "Effects", "Texture / motion overlays."],
              ["profileTheme", "Profile Themes", "Profile ambience (optional)."],
            ].map(([type, title, subtitle]) => {
              const arr = grouped[type] || [];
              if (!arr.length) return null;
              return (
                <section key={type} className="space-y-3">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <div className="text-lg font-semibold">{title}</div>
                      <div className="text-sm text-white/55">{subtitle}</div>
                    </div>
                    <div className="text-[12px] text-white/45">{arr.length} items</div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-3">
                    {arr.map((it) => (
                      <OwnedItemCard
                        key={it.key}
                        it={it}
                        equipped={equipped}
                        onPreview={() => setPreview(it)}
                        onEquip={equip}
                        onUnequip={unequip}
                      />
                    ))}
                  </div>
                </section>
              );
            })}

            {grouped.unknown?.length ? (
              <section className="space-y-3">
                <div className="text-lg font-semibold">Other</div>
                <div className="grid gap-3 md:grid-cols-3">
                  {grouped.unknown.map((it) => (
                    <OwnedItemCard
                      key={it.key}
                      it={it}
                      equipped={equipped}
                      onPreview={() => setPreview(it)}
                      onEquip={equip}
                      onUnequip={unequip}
                    />
                  ))}
                </div>
              </section>
            ) : null}

            {ownedItems.length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 text-sm text-white/55">
                No items owned yet. Buy from Store.
              </div>
            ) : null}
          </div>

          {/* Preview modal (portal centered) */}
          <ModalPortal open={!!preview} onClose={() => setPreview(null)}>
            <div className="space-y-4">
              <div className="text-lg font-semibold">Preview</div>

              <RantCard
                rant={previewRant}
                onReact={() => {}}
                theme={previewEquipped?.rantTheme || equipped.rantTheme || "theme.midnight"}
                effect={previewEquipped?.rantEffect || equipped.rantEffect || "effect.none"}
                nameGlow={previewEquipped?.nameGlow || equipped.nameGlow || "glow.none"}
                mode="thread"
              />

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setPreview(null)}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
                >
                  Close
                </button>

                {preview &&
                  (() => {
                    const slot = slotForType(preview.type);
                    if (!slot) return null;

                    const isEquipped = equipped?.[slot] === preview.key;
                    return !isEquipped ? (
                      <button
                        onClick={() => equip(slot, preview.key)}
                        className="rounded-2xl border border-white/10 bg-white px-4 py-2 text-sm font-semibold text-black"
                      >
                        Equip
                      </button>
                    ) : (
                      <button
                        onClick={() => unequip(slot)}
                        className="rounded-2xl border border-white/10 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-200/90"
                      >
                        Equipped • Unequip
                      </button>
                    );
                  })()}
              </div>
            </div>
          </ModalPortal>
        </>
      )}
    </div>
  );
}
