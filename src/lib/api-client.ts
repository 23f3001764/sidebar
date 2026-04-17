/**
 * api-client.ts — central typed fetch wrapper for all STEAMI backend endpoints.
 *
 * Known endpoints inferred from:
 *  - SteamiNav: PATCH /api/auth/subscribe/toggle
 *  - Admin dashboard: GET/POST/PATCH /api/admin/users, POST /api/dashboard/event
 *  - Auth: POST /api/auth/login, /api/auth/register, /api/auth/logout, GET /api/auth/me
 */

const BASE =
  (typeof import.meta !== "undefined"
    ? (import.meta as any).env?.VITE_FLASK_API_URL
    : undefined) ?? "http://127.0.0.1:5000";

// ── Auth token helper ─────────────────────────────────────────────────────────
function getToken(): string {
  return localStorage.getItem("steami_token") ?? "";
}

export function setToken(token: string) {
  localStorage.setItem("steami_token", token);
}

export function clearToken() {
  localStorage.removeItem("steami_token");
}

// ── Core fetch wrapper ────────────────────────────────────────────────────────
async function call<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers ?? {}),
    },
    ...init,
  });
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try { msg = (await res.json()).detail ?? (await res.json()).error ?? msg; } catch { /* ignore */ }
    throw new Error(msg);
  }
  // 204 No Content
  if (res.status === 204) return {} as T;
  return res.json() as Promise<T>;
}

// ── Types ─────────────────────────────────────────────────────────────────────

export type UserRole = "user" | "admin" | "moderator";

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  subscribed: boolean;
  onboarded: boolean;
  createdAt: string;
  lastActive?: string;
  avatarUrl?: string;
}

export interface DashboardEvent {
  event_type: string;    // e.g. "popup_open", "insight_view", "share"
  entity_type?: string;  // "explainer" | "research" | "feed" | "insight"
  entity_id?: string;
  metadata?: Record<string, any>;
}

// ── Auth endpoints ─────────────────────────────────────────────────────────────

export const authApi = {
  login: (email: string, password: string) =>
    call<{ token: string; user: AuthUser }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  register: (fullName: string, email: string, password: string) =>
    call<{ token: string; user: AuthUser }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ fullName, email, password }),
    }),

  logout: () =>
    call<void>("/api/auth/logout", { method: "POST" }),

  me: () =>
    call<AuthUser>("/api/auth/me"),

  /** PATCH /api/auth/subscribe/toggle — used by Subscribe button in SteamiNav */
  toggleSubscribe: () =>
    call<{ subscribed: boolean }>("/api/auth/subscribe/toggle", { method: "PATCH" }),

  onboard: (fields: string[]) =>
    call<AuthUser>("/api/auth/onboard", {
      method: "PATCH",
      body: JSON.stringify({ fields }),
    }),
};

// ── Admin endpoints ───────────────────────────────────────────────────────────

export const adminApi = {
  /** GET /api/admin/users — list all users */
  listUsers: (params?: { page?: number; limit?: number; role?: string; q?: string }) => {
    const qs = new URLSearchParams();
    if (params?.page)  qs.set("page",  String(params.page));
    if (params?.limit) qs.set("limit", String(params.limit));
    if (params?.role)  qs.set("role",  params.role);
    if (params?.q)     qs.set("q",     params.q);
    return call<{ users: AuthUser[]; total: number; page: number; pages: number }>(
      `/api/admin/users?${qs}`
    );
  },

  /** GET /api/admin/users/:id */
  getUser: (id: string) =>
    call<AuthUser>(`/api/admin/users/${id}`),

  /** PATCH /api/admin/users/:id/role */
  updateRole: (id: string, role: UserRole) =>
    call<AuthUser>(`/api/admin/users/${id}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    }),

  /** DELETE /api/admin/users/:id */
  deleteUser: (id: string) =>
    call<{ deleted: boolean }>(`/api/admin/users/${id}`, { method: "DELETE" }),

  /** GET /api/admin/stats */
  getStats: () =>
    call<{
      total_users: number;
      subscribed_users: number;
      admin_users: number;
      events_today: number;
      events_total: number;
    }>("/api/admin/stats"),

  /** GET /api/admin/events — recent activity */
  getEvents: (limit = 50) =>
    call<{ events: Array<{
      id: string; event_type: string; entity_type?: string; entity_id?: string;
      user_id?: string; metadata?: any; created_at: string;
    }> }>(`/api/admin/events?limit=${limit}`),
};

// ── Dashboard event tracking ──────────────────────────────────────────────────

/** POST /api/dashboard/event — fire-and-forget event tracker */
export function trackEvent(event: DashboardEvent): void {
  call("/api/dashboard/event", {
    method: "POST",
    body: JSON.stringify(event),
  }).catch(() => { /* never throw — tracking is best-effort */ });
}