// client/src/lib/api.js
const API = import.meta.env.VITE_API_BASE || "http://localhost:8080";

function getGuestId() {
  const GUEST_KEY = "rw_guest_id";
  let id = localStorage.getItem(GUEST_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(GUEST_KEY, id);
  }
  return id;
}

async function req(path, { method = "GET", body, headers } = {}) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "x-guest-id": getGuestId(),
      ...(headers || {}),
    },
    credentials: "include",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || data?.message || "Request failed");
  return data;
}

export const api = {
  // auth
  session: () => req("/api/auth/session"),
  register: (p) => req("/api/auth/register", { method: "POST", body: p }),
  login: (p) => req("/api/auth/login", { method: "POST", body: p }),
  logout: () => req("/api/auth/logout", { method: "POST" }),
  googleLoginUrl: `${API}/api/auth/google`,

  // rants
  listRants: () => req("/api/rants"),
  getRant: (id) => req(`/api/rants/${id}`),
  createRant: (p) => req("/api/rants", { method: "POST", body: p }),
  reactRant: (id, key) => req(`/api/rants/${id}/react`, { method: "POST", body: { key } }),
  replyRant: (id, p) => req(`/api/rants/${id}/reply`, { method: "POST", body: p }),
  replyToReply: (rantId, replyId, p) =>
    req(`/api/rants/${rantId}/reply/${replyId}`, { method: "POST", body: p }),

  // me
  me: () => req("/api/me"),
  inventory: () => req("/api/me/inventory"),
  buyItem: (itemKey) => req("/api/me/buy", { method: "POST", body: { itemKey } }),
  equipItem: (slot, itemKey) => req("/api/me/equip", { method: "POST", body: { slot, itemKey } }),

  // store
  storeItems: () => req("/api/store/items"),
};
