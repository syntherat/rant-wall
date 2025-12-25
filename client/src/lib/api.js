const API = import.meta.env.VITE_API_BASE || "http://localhost:8080";

async function req(path, { method = "GET", body, headers } = {}) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(headers || {}),
    },
    credentials: "include", // IMPORTANT: send session cookie
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

  reactRant: (id, key) =>
    req(`/api/rants/${id}/react`, { method: "POST", body: { key } }),

  // top-level reply to rant
  replyRant: (id, p) =>
    req(`/api/rants/${id}/reply`, { method: "POST", body: p }),

  // ✅ reply to a reply (nested)
  replyToReply: (rantId, replyId, p) =>
    req(`/api/rants/${rantId}/reply/${replyId}`, { method: "POST", body: p }),

  // me / cosmetics
  me: () => req("/api/me"),
  buyCosmetic: (p) => req("/api/me/cosmetic", { method: "POST", body: p }),
};
