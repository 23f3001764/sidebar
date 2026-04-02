/**
 * lib/chat.ts
 * Typed wrappers for every /api/chat/* endpoint in chat.py.
 * Uses HTTP polling instead of Firestore onSnapshot.
 */

import type {
  ChatUser, ChatMessage, Conversation, UnreadResponse, LocalUser,
} from "../types/chat";

const BASE =
  (typeof import.meta !== "undefined"
    ? (import.meta as any).env?.VITE_FLASK_API_URL
    : undefined) ?? "http://127.0.0.1:5000";

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try { msg = (await res.json()).error ?? msg; } catch { /* ignore */ }
    throw new Error(msg);
  }
  return res.json() as Promise<T>;
}

// ─────────────────────────────────────────────────────────────────────────────
// USERS
// ─────────────────────────────────────────────────────────────────────────────

/** POST /api/chat/users  — upsert profile on login */
export function upsertChatUser(user: LocalUser): Promise<ChatUser> {
  return call("/api/chat/users", {
    method: "POST",
    body: JSON.stringify(user),
  });
}

/** GET /api/chat/users?uid=&q=  — all users except self */
export async function getChatUsers(uid: string, q = ""): Promise<ChatUser[]> {
  const qs = new URLSearchParams({ uid });
  if (q) qs.set("q", q);
  const data = await call<{ users: ChatUser[] }>(`/api/chat/users?${qs}`);
  return data.users ?? [];
}

/** GET /api/chat/users/:uid  — single user profile */
export function getChatUser(uid: string): Promise<ChatUser> {
  return call<ChatUser>(`/api/chat/users/${uid}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// MESSAGES
// ─────────────────────────────────────────────────────────────────────────────

/** POST /api/chat/messages  — send a message */
export function sendMessage(params: {
  senderId: string;
  receiverId: string;
  text: string;
}): Promise<ChatMessage> {
  return call("/api/chat/messages", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

/**
 * GET /api/chat/messages?u1=&u2=&after=&limit=
 * Fetch messages between two users, optionally newer than `after` (ms timestamp).
 * Use `after = lastMessage.timestamp` for efficient incremental polling.
 */
export async function getMessages(
  u1: string,
  u2: string,
  after = 0,
  limit = 50,
): Promise<ChatMessage[]> {
  const qs = new URLSearchParams({
    u1, u2,
    after: String(after),
    limit: String(limit),
  });
  const data = await call<{ messages: ChatMessage[]; count: number }>(
    `/api/chat/messages?${qs}`,
  );
  return data.messages ?? [];
}

/** PATCH /api/chat/messages/seen — mark incoming messages as seen */
export function markSeen(receiverId: string, senderId: string): Promise<{ marked: number }> {
  return call("/api/chat/messages/seen", {
    method: "PATCH",
    body: JSON.stringify({ receiverId, senderId }),
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// CONVERSATIONS + UNREAD
// ─────────────────────────────────────────────────────────────────────────────

/** GET /api/chat/conversations?uid=  — sidebar conversation list */
export async function getConversations(uid: string): Promise<Conversation[]> {
  const data = await call<{ conversations: Conversation[] }>(
    `/api/chat/conversations?uid=${uid}`,
  );
  return data.conversations ?? [];
}

/** GET /api/chat/unread?uid=  — badge count */
export function getUnread(uid: string): Promise<UnreadResponse> {
  return call<UnreadResponse>(`/api/chat/unread?uid=${uid}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// LOCAL USER HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const USER_KEY = "steami_chat_user";

export function getLocalUser(): LocalUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as LocalUser;
  } catch {
    return null;
  }
}

export function setLocalUser(user: LocalUser): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearLocalUser(): void {
  localStorage.removeItem(USER_KEY);
}