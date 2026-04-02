// ── User (from GET /api/chat/users, GET /api/chat/users/:uid) ─────────────────
export interface ChatUser {
  id: string;
  username: string;
  avatar: string;
  online: boolean;
  last_seen: string;
  email?: string;
}

// ── Message (from GET /api/chat/messages, POST /api/chat/messages) ────────────
export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  status: "sent" | "seen";
  timestamp: number;   // ms since epoch — matches Date.now()
  created_at: string;
}

// ── Conversation (from GET /api/chat/conversations) ───────────────────────────
export interface Conversation {
  user: {
    id: string;
    username: string;
    avatar: string;
    online: boolean;
  };
  last_message: {
    text: string;
    timestamp: number;
    senderId: string;
  } | null;
  unread_count: number;
}

// ── Unread (from GET /api/chat/unread) ────────────────────────────────────────
export interface UnreadResponse {
  total_unread: number;
  by_sender: Record<string, number>;
}

// ── Current user stored in localStorage ──────────────────────────────────────
export interface LocalUser {
  id: string;
  username: string;
  avatar: string;
  email?: string;
}