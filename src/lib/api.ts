/**
 * lib/api.ts
 * Complete typed API client generated from openapi.json v8.0.0
 *
 * Endpoints:
 *  Auth    — signup, login, me, interests, subscribe, profile, users (admin)
 *  Chat    — users, messages, conversations, unread
 *  Feed    — from-selection, items, insight
 *  Content — explainers, research articles, fields, images
 *  Diary   — CRUD diary entries
 *  Dashboard — popup events, user stats, admin stats
 *  Articles  — list, get, fetch (mod+), refresh (mod+), insights
 */

const BASE =
  (typeof import.meta !== "undefined"
    ? (import.meta as any).env?.VITE_FLASK_API_URL
    : undefined) ?? "http://127.0.0.1:5000";

// ── Token management ──────────────────────────────────────────────────────────
export function getToken(): string { return localStorage.getItem("steami_token") ?? ""; }
export function setToken(t: string) { localStorage.setItem("steami_token", t); }
export function clearToken() { localStorage.removeItem("steami_token"); }

// ── Core fetch ────────────────────────────────────────────────────────────────
async function req<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const isFormData = init.body instanceof FormData;
  const headers: Record<string, string> = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(init.headers as Record<string, string> ?? {}),
  };
  const res = await fetch(`${BASE}${path}`, { ...init, headers });
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const j = await res.json();
      msg = j.detail ?? j.error ?? j.message ?? msg;
      if (Array.isArray(msg)) msg = msg.map((e: any) => e.msg).join(", ");
    } catch { /* ignore */ }
    throw new Error(String(msg));
  }
  if (res.status === 204) return {} as T;
  return res.json();
}

// ── Types (from OpenAPI schemas) ──────────────────────────────────────────────

export type Profession =
  | "student" | "working_professional" | "professor" | "other";

export type UserRole = "user" | "mod" | "admin";

export interface User {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  profession: Profession;
  interests: string[];
  subscribe_email: boolean;
  is_active: boolean;
  created_at?: string;
  last_seen?: string;
  onboarded?: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
  role: UserRole;
}

export interface DiaryEntry {
  id: string;
  uid: string;
  popup_type: "research_article" | "ai_insight" | "explainer" | "simulation";
  popup_id: string;
  title: string;
  selected_text: string;
  note: string;
  created_at: string;
  updated_at: string;
}

export interface PopupEvent {
  id: string;
  uid: string;
  popup_type: string;
  popup_id: string;
  popup_title: string;
  opened_at: string;
  date: string;
  hour: number;
}

export interface AiInsight {
  summary: string;
  svg: string;
  key_points: string[];
  sentiment: "positive" | "negative" | "neutral";
  confidence: number;
  tags: string[];
  domain: string;
  reading_time_min: number;
  article_url?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────────────────────────────────────

export const auth = {
  /** POST /api/auth/seed — seed test accounts */
  seed: () => req<{ seeded: number }>("/api/auth/seed", { method: "POST" }),

  /** POST /api/auth/signup */
  signup: (body: { full_name: string; email: string; password: string; profession?: Profession }): Promise<AuthResponse> =>
    req("/api/auth/signup", { method: "POST", body: JSON.stringify(body) }),

  /** POST /api/auth/login */
  login: (email: string, password: string): Promise<AuthResponse> =>
    req("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),

  /** GET /api/auth/me */
  me: (): Promise<User> => req("/api/auth/me"),

  /** GET /api/auth/interests */
  getInterests: (): Promise<{ interests: string[]; valid_topics: string[] }> =>
    req("/api/auth/interests"),

  /** POST /api/auth/interests */
  saveInterests: (topics: string[]): Promise<{ updated: boolean; interests: string[]; valid_topics: string[] }> =>
    req("/api/auth/interests", { method: "POST", body: JSON.stringify({ topics }) }),

  /** PUT /api/auth/profile — edit own profile */
  updateProfile: (body: {
    full_name?: string; profession?: Profession; interests?: string[];
    subscribe_email?: boolean; current_password?: string; new_password?: string;
  }): Promise<{ updated: boolean; updated_fields: string[]; user: User }> =>
    req("/api/auth/profile", { method: "PUT", body: JSON.stringify(body) }),

  /** Backwards-compatible name used by older components. */
  editProfile: (body: {
    full_name?: string; profession?: Profession; interests?: string[];
    subscribe_email?: boolean; current_password?: string; new_password?: string;
  }): Promise<{ updated: boolean; updated_fields: string[]; user: User }> =>
    req("/api/auth/profile", { method: "PUT", body: JSON.stringify(body) }),

  /** POST /api/auth/subscribe — set subscription explicitly */
  setSubscribe: (subscribe: boolean): Promise<{ updated: boolean; subscribe_email: boolean }> =>
    req("/api/auth/subscribe", { method: "POST", body: JSON.stringify({ subscribe }) }),

  /** PATCH /api/auth/subscribe/toggle */
  toggleSubscribe: (): Promise<{ updated: boolean; subscribe_email: boolean; message: string }> =>
    req("/api/auth/subscribe/toggle", { method: "PATCH" }),

  // ── Admin-only ──────────────────────────────────────────────────────────────

  /** GET /api/auth/users — admin only */
  listUsers: (): Promise<{ users: User[] }> => req("/api/auth/users"),

  /** GET /api/auth/users/:uid */
  getUser: (uid: string): Promise<User> => req(`/api/auth/users/${uid}`),

  /** PUT /api/auth/users/:uid */
  updateUser: (uid: string, body: {
    full_name?: string; email?: string; profession?: string;
    interests?: string[]; is_active?: boolean; role?: UserRole;
  }): Promise<{ updated: boolean; uid: string }> =>
    req(`/api/auth/users/${uid}`, { method: "PUT", body: JSON.stringify(body) }),

  /** PUT /api/auth/users/:uid/role */
  setUserRole: (uid: string, role: UserRole): Promise<{ updated: boolean }> =>
    req(`/api/auth/users/${uid}/role`, { method: "PUT", body: JSON.stringify({ role }) }),

  /** DELETE /api/auth/users/:uid */
  deleteUser: (uid: string): Promise<{ deleted: boolean }> =>
    req(`/api/auth/users/${uid}`, { method: "DELETE" }),

  /** PATCH /api/auth/users/:uid/subscribe/toggle — admin */
  adminToggleSubscribe: (uid: string): Promise<{ updated: boolean; uid: string; subscribe_email: boolean; message: string }> =>
    req(`/api/auth/users/${uid}/subscribe/toggle`, { method: "PATCH" }),

  /** GET /api/auth/newsletter/recipients — admin */
  newsletterRecipients: (): Promise<{ total: number; recipients: User[]; by_topic: Record<string, string[]> }> =>
    req("/api/auth/newsletter/recipients"),
};

// ─────────────────────────────────────────────────────────────────────────────
// ARTICLES
// ─────────────────────────────────────────────────────────────────────────────

export interface Article {
  id: string;
  title: string;
  content: string;
  url?: string;
  source?: string;
  topic?: string;
  short_summary?: string;
  image_url?: string;
  article_url?: string;
  matched_domains?: string[];
  has_insight?: boolean;
  ai_insight?: AiInsight;
  fetched_at?: string;
}

export const articles = {
  /** GET /api/articles?limit= */
  list: (limit = 30): Promise<{ articles: Article[] }> =>
    req(`/api/articles?limit=${limit}`),

  /** GET /api/articles/:id */
  get: (id: string): Promise<Article> => req(`/api/articles/${id}`),

  /** GET /api/articles/for-me — personalized by interests */
  forMe: (limit = 30): Promise<{ uid: string; interests: string[]; total: number; articles: Article[] }> =>
    req(`/api/articles/for-me?limit=${limit}`),

  /** POST /api/articles/refresh — mod/admin */
  refresh: (body?: { domains?: string[]; target?: number }): Promise<{
    deleted_articles: number; deleted_insights: number; fetched: number;
    new_saved: number; skipped: number; articles: Article[];
  }> => req("/api/articles/refresh", { method: "POST", body: JSON.stringify(body ?? {}) }),

  /** POST /api/articles/fetch — mod/admin */
  fetch: (body: { topic?: string; keywords?: string[]; limit?: number }) =>
    req("/api/articles/fetch", { method: "POST", body: JSON.stringify(body) }),

  /** POST /api/articles/fetch-source — mod/admin */
  fetchSource: (url: string, limit = 20) =>
    req("/api/articles/fetch-source", { method: "POST", body: JSON.stringify({ url, limit }) }),

  /** GET /api/articles/refresh/check — read-only check for newly saved articles */
  refreshCheck: (since_hours = 24): Promise<{ new_articles: number; since_hours: number; articles: Article[] }> =>
    req(`/api/articles/refresh/check?since_hours=${since_hours}`),
};

// ─────────────────────────────────────────────────────────────────────────────
// INSIGHTS
// ─────────────────────────────────────────────────────────────────────────────

export const insights = {
  /** POST /api/articles/:id/insight — requires login */
  generate: (article_id: string, force = false): Promise<{ article_id: string; ai_insight: AiInsight; cached: boolean }> =>
    req(`/api/articles/${article_id}/insight?force=${force}`, { method: "POST" }),

  /** GET /api/insights — requires login */
  list: (limit = 50): Promise<{ insights: Array<{ article_id: string; title: string; ai_insight: AiInsight; created_at: string }> }> =>
    req(`/api/insights?limit=${limit}`),

  /** GET /api/insights/:article_id — requires login */
  get: (article_id: string): Promise<{ article_id: string; ai_insight: AiInsight }> =>
    req(`/api/insights/${article_id}`),

  /** DELETE /api/articles/:id/insight — mod/admin */
  clear: (article_id: string) =>
    req(`/api/articles/${article_id}/insight`, { method: "DELETE" }),

  /** POST /api/articles/insights/process — mod/admin */
  process: (batch_size = 2) =>
    req("/api/articles/insights/process", { method: "POST", body: JSON.stringify({ batch_size }) }),

  /** GET /api/articles/insights/queue — admin queue status */
  queue: (): Promise<{
    pending: number; done: number; failed: number; processing: number; total: number;
    items: Array<{ article_id: string; title: string; queued_at?: string; attempts?: number }>;
  }> => req("/api/articles/insights/queue"),

  /** DELETE /api/articles/insights/queue — admin queue reset */
  clearQueue: (): Promise<{ cleared?: number; deleted?: number }> =>
    req("/api/articles/insights/queue", { method: "DELETE" }),
};

// ─────────────────────────────────────────────────────────────────────────────
// FEED
// ─────────────────────────────────────────────────────────────────────────────

export interface FeedArticle {
  id: string;
  title: string;
  short_summary?: string;
  image_url?: string;
  article_url?: string;
  url?: string;
  source?: string;
  matched_domains?: string[];
  keywords?: string[];
  selected_text?: string;
  published_at?: string;
  fetched_at: string;
  has_insight?: boolean;
  ai_insight?: AiInsight;
}

export const feed = {
  /** POST /api/feed/from-selection */
  fromSelection: (body: { selected_text: string; uid?: string; source_article_id?: string }): Promise<{
    selected_text: string; paragraphs: string[]; keywords: string[];
    matched_domains: string[]; source: string; total: number; articles: FeedArticle[];
  }> => req("/api/feed/from-selection", { method: "POST", body: JSON.stringify(body) }),

  /** GET /api/feed/items?uid=&limit= */
  list: (uid?: string, limit = 20): Promise<{ articles: FeedArticle[]; total: number }> => {
    const qs = new URLSearchParams({ limit: String(limit) });
    if (uid) qs.set("uid", uid);
    return req(`/api/feed/items?${qs}`);
  },

  /** GET /api/feed/items/:id */
  get: (id: string): Promise<FeedArticle> => req(`/api/feed/items/${id}`),

  /** POST /api/feed/items/:id/insight — requires auth */
  insight: (id: string, force = false): Promise<{ article_id: string; ai_insight: AiInsight; cached: boolean }> =>
    req(`/api/feed/items/${id}/insight?force=${force}`, { method: "POST" }),

  /** DELETE /api/feed/items/:id — requires auth */
  delete: (id: string): Promise<{ deleted: boolean; article_id: string }> =>
    req(`/api/feed/items/${id}`, { method: "DELETE" }),
};

// ─────────────────────────────────────────────────────────────────────────────
// CHAT
// ─────────────────────────────────────────────────────────────────────────────

export interface ChatUser {
  id: string; username: string; avatar: string; online: boolean; last_seen: string;
}

export interface ChatMessage {
  id: string; senderId: string; receiverId: string; text: string;
  status: "sent" | "seen"; timestamp: number; created_at: string;
}

export interface Conversation {
  user: ChatUser;
  last_message: { text: string; timestamp: number; senderId: string } | null;
  unread_count: number;
}

export const chat = {
  /** POST /api/chat/users — upsert user profile */
  upsertUser: (body: { id: string; username: string; avatar?: string; email?: string }): Promise<ChatUser> =>
    req("/api/chat/users", { method: "POST", body: JSON.stringify(body) }),

  /** GET /api/chat/users?uid=&q= */
  getUsers: async (uid: string, q = ""): Promise<ChatUser[]> => {
    const qs = new URLSearchParams({ uid });
    if (q) qs.set("q", q);
    const d = await req<{ users: ChatUser[] }>(`/api/chat/users?${qs}`);
    return d.users ?? [];
  },

  /** GET /api/chat/users/:uid */
  getUser: (uid: string): Promise<ChatUser> => req(`/api/chat/users/${uid}`),

  /** POST /api/chat/messages */
  sendMessage: (body: { senderId: string; receiverId: string; text: string }): Promise<ChatMessage> =>
    req("/api/chat/messages", { method: "POST", body: JSON.stringify(body) }),

  /** GET /api/chat/messages?u1=&u2=&after=&limit= */
  getMessages: async (u1: string, u2: string, after = 0, limit = 50): Promise<ChatMessage[]> => {
    const qs = new URLSearchParams({ u1, u2, after: String(after), limit: String(limit) });
    const d = await req<{ messages: ChatMessage[]; count: number }>(`/api/chat/messages?${qs}`);
    return d.messages ?? [];
  },

  /** PATCH /api/chat/messages/seen */
  markSeen: (receiverId: string, senderId: string): Promise<{ marked: number }> =>
    req("/api/chat/messages/seen", { method: "PATCH", body: JSON.stringify({ receiverId, senderId }) }),

  /** GET /api/chat/conversations?uid= */
  getConversations: async (uid: string): Promise<Conversation[]> => {
    const d = await req<{ conversations: Conversation[] }>(`/api/chat/conversations?uid=${uid}`);
    return d.conversations ?? [];
  },

  /** GET /api/chat/unread?uid= */
  getUnread: (uid: string): Promise<{ total_unread: number; by_sender: Record<string, number> }> =>
    req(`/api/chat/unread?uid=${uid}`),
};

export async function apiGetArticles(limit = 30): Promise<any[]> {
  const res = await articles.list(limit);
  return res.articles ?? [];
}

export function apiFetchArticles(keywords: string[] = [], limit = 20): Promise<any> {
  return articles.fetch({ keywords, limit });
}

export function apiGetInsight(articleId: string): Promise<any> {
  return insights.generate(articleId);
}

export type ConversationUser = ChatUser & {
  email?: string;
  lastMessage?: string;
  unseenCount?: number;
};

export const chatApi = {
  upsertProfile: chat.upsertUser,

  listUsers: async (uid?: string, q = ""): Promise<{ users: ConversationUser[] }> => {
    const currentUid = uid ?? "";
    const users = currentUid ? await chat.getUsers(currentUid, q) : [];
    return { users: users as ConversationUser[] };
  },

  conversation: async (u1: string, u2: string): Promise<{ messages: ChatMessage[] }> => {
    const messages = await chat.getMessages(u1, u2);
    return { messages };
  },

  send: (senderId: string, receiverId: string, text: string): Promise<ChatMessage> =>
    chat.sendMessage({ senderId, receiverId, text }),

  markSeen: chat.markSeen,
  getConversations: chat.getConversations,
  getUnread: chat.getUnread,
};

// ─────────────────────────────────────────────────────────────────────────────
// EXPLAINERS
// ─────────────────────────────────────────────────────────────────────────────

export interface Explainer {
  id: string; title: string; subtitle: string; field: string;
  badgeColor: string; readTime: string; image?: string;
  content: string[]; keyInsights: string[];
}

export const explainersApi = {
  /** GET /api/explainers?field= */
  list: async (field?: string): Promise<Explainer[]> => {
    const qs = field ? `?field=${encodeURIComponent(field)}` : "";
    const d = await req<{ explainers: Explainer[]; total: number }>(`/api/explainers${qs}`);
    return d.explainers ?? [];
  },

  /** GET /api/explainers/:id */
  get: (id: string): Promise<Explainer> => req(`/api/explainers/${id}`),

  /** POST /api/explainers — mod/admin */
  create: (body: Partial<Explainer>): Promise<Explainer> =>
    req("/api/explainers", { method: "POST", body: JSON.stringify(body) }),

  /** POST /api/explainers/create-with-image — multipart, mod/admin */
  createWithImage: (formData: FormData): Promise<Explainer> =>
    req("/api/explainers/create-with-image", { method: "POST", body: formData }),

  /** PUT /api/explainers/:id — mod/admin */
  update: (id: string, body: Partial<Explainer>): Promise<{ updated: boolean }> =>
    req(`/api/explainers/${id}`, { method: "PUT", body: JSON.stringify(body) }),

  /** DELETE /api/explainers/:id — admin */
  delete: (id: string): Promise<{ deleted: boolean }> =>
    req(`/api/explainers/${id}`, { method: "DELETE" }),

  /** POST /api/explainers/:id/image — multipart, mod/admin */
  uploadImage: (id: string, formData: FormData): Promise<{ updated: boolean; id: string; image: string }> =>
    req(`/api/explainers/${id}/image`, { method: "POST", body: formData }),
};

// ─────────────────────────────────────────────────────────────────────────────
// RESEARCH
// ─────────────────────────────────────────────────────────────────────────────

export interface ResearchArticle {
  id: string; title: string; abstract: string; field: string;
  author: string; date: string; readTime: string; image?: string;
  content: string[]; quotes: string[]; keyFindings: string[]; relatedTopics: string[];
}

export interface FieldsMeta {
  fields: string[];
  field_icons: Record<string, string>;
  field_colors: Record<string, string>;
  field_images?: Record<string, string>;
}

export const researchApi = {
  /** GET /api/research/fields */
  getFields: (): Promise<FieldsMeta> => req("/api/research/fields"),

  /** GET /api/research/images */
  getImages: (): Promise<Record<string, string>> => req("/api/research/images"),

  /** GET /api/research/articles?field= */
  list: async (field?: string): Promise<{
    articles: ResearchArticle[]; total: number;
    fields: string[]; field_icons: Record<string, string>;
    field_colors: Record<string, string>; field_images?: Record<string, string>;
  }> => {
    const qs = field ? `?field=${encodeURIComponent(field)}` : "";
    return req(`/api/research/articles${qs}`);
  },

  /** GET /api/research/articles/:id */
  get: (id: string): Promise<ResearchArticle> => req(`/api/research/articles/${id}`),

  /** POST /api/research/articles — mod/admin */
  create: (body: Partial<ResearchArticle>): Promise<ResearchArticle> =>
    req("/api/research/articles", { method: "POST", body: JSON.stringify(body) }),

  /** POST /api/research/articles/create-with-image — multipart */
  createWithImage: (formData: FormData): Promise<ResearchArticle> =>
    req("/api/research/articles/create-with-image", { method: "POST", body: formData }),

  /** PUT /api/research/articles/:id */
  update: (id: string, body: Partial<ResearchArticle>): Promise<{ updated: boolean }> =>
    req(`/api/research/articles/${id}`, { method: "PUT", body: JSON.stringify(body) }),

  /** DELETE /api/research/articles/:id */
  delete: (id: string): Promise<{ deleted: boolean }> =>
    req(`/api/research/articles/${id}`, { method: "DELETE" }),

  /** POST /api/research/articles/:id/image — multipart */
  uploadImage: (id: string, formData: FormData): Promise<{ updated: boolean; image: string }> =>
    req(`/api/research/articles/${id}/image`, { method: "POST", body: formData }),
};

// ─────────────────────────────────────────────────────────────────────────────
// DIARY
// ─────────────────────────────────────────────────────────────────────────────

export const diaryApi = {
  /** POST /api/diary */
  create: (body: {
    popup_type: DiaryEntry["popup_type"]; popup_id: string; title: string;
    selected_text: string; note?: string;
  }): Promise<DiaryEntry> =>
    req("/api/diary", { method: "POST", body: JSON.stringify(body) }),

  /** GET /api/diary?limit=&popup_type= */
  list: async (limit = 50, popup_type?: string): Promise<{ entries: DiaryEntry[]; total: number }> => {
    const qs = new URLSearchParams({ limit: String(limit) });
    if (popup_type) qs.set("popup_type", popup_type);
    return req(`/api/diary?${qs}`);
  },

  /** GET /api/diary/:id */
  get: (id: string): Promise<DiaryEntry> => req(`/api/diary/${id}`),

  /** PUT /api/diary/:id */
  update: (id: string, body: { note?: string; title?: string }): Promise<DiaryEntry> =>
    req(`/api/diary/${id}`, { method: "PUT", body: JSON.stringify(body) }),

  /** DELETE /api/diary/:id */
  delete: (id: string): Promise<{ deleted: boolean }> =>
    req(`/api/diary/${id}`, { method: "DELETE" }),
};

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────

export const dashboard = {
  /**
   * POST /api/dashboard/event
   * Fire-and-forget popup event tracker.
   * popup_type: "research_article" | "ai_insight" | "explainer" | "simulation"
   */
  event: (popup_type: string, popup_id: string, popup_title = ""): void => {
    req("/api/dashboard/event", {
      method: "POST",
      body: JSON.stringify({ popup_type, popup_id, popup_title }),
    }).catch(() => { /* best-effort, never throw */ });
  },

  /** GET /api/dashboard/me — own activity summary */
  me: (limit = 100): Promise<{
    total_events: number;
    by_type: Record<string, number>;
    by_date: Record<string, number>;
    most_opened: Array<{ popup_id: string; popup_title: string; popup_type: string; count: number }>;
    recent: PopupEvent[];
  }> => req(`/api/dashboard/me?limit=${limit}`),

  /** Backwards-compatible dashboard summary used by DashboardPage. */
  stats: (limit = 100) => req(`/api/dashboard/me?limit=${limit}`),

  /** GET /api/dashboard/admin — admin only */
  admin: (): Promise<{
    total_events: number; unique_users: number;
    by_type: Record<string, number>; by_date: Record<string, number>;
    top_items: Array<{ popup_id: string; popup_title: string; popup_type: string; count: number }>;
  }> => req("/api/dashboard/admin"),

  /** GET /api/dashboard/admin/events */
  adminEvents: (params?: { limit?: number; popup_type?: string; uid_filter?: string }): Promise<{
    events: PopupEvent[];
  }> => {
    const qs = new URLSearchParams({ limit: String(params?.limit ?? 100) });
    if (params?.popup_type) qs.set("popup_type", params.popup_type);
    if (params?.uid_filter)  qs.set("uid_filter",  params.uid_filter);
    return req(`/api/dashboard/admin/events?${qs}`);
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// IMAGES
// ─────────────────────────────────────────────────────────────────────────────

export const imagesApi = {
  /** POST /api/images/upload?folder= — multipart, mod/admin */
  upload: (file: File, folder: "research" | "explainers" = "research"): Promise<{
    url: string; filename: string; folder: string;
  }> => {
    const fd = new FormData();
    fd.append("file", file);
    return req(`/api/images/upload?folder=${folder}`, { method: "POST", body: fd });
  },
};

export const health = {
  check: () => req<{ ok?: boolean; status?: string }>("/health"),
};

export const pipeline = {
  run: (body: { topic?: string; keywords?: string[]; limit?: number }): Promise<any> =>
    req("/api/pipeline", { method: "POST", body: JSON.stringify(body) }),
};

export const sources = {
  list: (): Promise<{ sources?: unknown[] } | unknown[]> => req("/api/sources"),
};

/** Resolve a relative image path from the backend to a full URL */
export function resolveImg(path?: string | null): string {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${BASE}${path.startsWith("/") ? "" : "/"}${path}`;
}
