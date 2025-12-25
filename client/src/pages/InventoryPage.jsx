import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import { useSession } from "../lib/session";
import RantCard from "../components/RantCard";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

function slotForType(type) {
  if (type === "rantTheme") return "rantTheme";
  if (type === "profileTheme") return "profileTheme";
  if (type === "nameGlow") return "nameGlow";
  if (type === "rantEffect") return "rantEffect";
  return null;
}

function defaultForSlot(slot) {
  if (slot === "rantTheme") return "theme.midnight";
  if (slot === "profileTheme") return "profile.midnight";
  if (slot === "nameGlow") return "glow.none";
  if (slot === "rantEffect") return "effect.none";
  return null;
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

export default function InventoryPage() {
  const { user, loading: sessionLoading, refresh } = useSession();

  const [inv, setInv] = useState(null);
  const [store, setStore] = useState([]);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState(null);

  // ✅ derived values MUST be declared before any returns
  const equipped = inv?.equipped || {};
  const ownedKeys = useMemo(() => (inv?.inventory || []).map((x) => x.itemKey), [inv]);

  const storeMap = useMemo(() => {
    const m = new Map();
    (store || []).forEach((it) => m.set(it.key, it));
    return m;
  }, [store]);

  const previewEquipped = useMemo(() => {
    if (!preview) return null;
    const slot = slotForType(preview.type);
    if (!slot) return null;
    return { ...equipped, [slot]: preview.key };
  }, [preview, equipped]);

  const previewRant = useMemo(() => {
    // user might be null on first render, so keep it safe
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

  // ✅ NOW early returns are safe (all hooks already ran)
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
          {/* Equipped overview */}
          <div className="grid gap-3 md:grid-cols-2">
            {["rantTheme", "rantEffect", "nameGlow", "profileTheme"].map((slot) => (
              <div key={slot} className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
                <div className="text-xs font-semibold tracking-wider text-white/60">{slot.toUpperCase()}</div>
                <div className="mt-2 text-sm text-white/80">
                  Equipped:{" "}
                  <span className="font-semibold text-white/90">
                    {equipped?.[slot] || defaultForSlot(slot)}
                  </span>
                </div>
                <button
                  onClick={() => unequip(slot)}
                  className="mt-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
                >
                  Unequip (reset)
                </button>
              </div>
            ))}
          </div>

          {/* Owned items */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <div className="text-sm font-semibold">Owned items</div>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              {ownedKeys.length === 0 ? (
                <div className="text-sm text-white/55">No items owned yet. Buy from Store.</div>
              ) : (
                ownedKeys.map((key) => {
                  const it = storeMap.get(key) || { key, name: key, type: "unknown", priceVE: 0 };
                  const slot = slotForType(it.type);
                  const isEquipped = slot ? equipped?.[slot] === it.key : false;

                  return (
                    <div key={key} className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
                      <div className="text-sm font-semibold">{it.name || it.key}</div>
                      <div className="mt-1 text-xs text-white/55">{it.type}</div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          onClick={() => setPreview(it)}
                          className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
                        >
                          Preview
                        </button>

                        {slot && (
                          <button
                            onClick={() => equip(slot, it.key)}
                            className={[
                              "rounded-2xl border px-3 py-2 text-sm",
                              isEquipped
                                ? "border-white/10 bg-emerald-500/10 text-emerald-200/90"
                                : "border-white/10 bg-white/5 text-white/90 hover:bg-white/10",
                            ].join(" ")}
                          >
                            {isEquipped ? "Equipped" : "Equip"}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <Modal open={!!preview} onClose={() => setPreview(null)}>
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
                    return (
                      <button
                        onClick={() => equip(slot, preview.key)}
                        className="rounded-2xl border border-white/10 bg-white px-4 py-2 text-sm font-semibold text-black"
                      >
                        Equip
                      </button>
                    );
                  })()}
              </div>
            </div>
          </Modal>
        </>
      )}
    </div>
  );
}
