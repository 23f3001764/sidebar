/**
 * useChat — manages all chat state with HTTP polling.
 * Replaces Firebase onSnapshot with setInterval.
 *
 * Poll strategy:
 *   • While a chat window is open: every 2 s (incremental, using `after` param)
 *   • Unread badge: every 15 s
 *   • Conversations sidebar: every 10 s
 */
import { useState, useEffect, useRef, useCallback } from "react";
import type { ChatUser, ChatMessage, Conversation } from "../types/chat";
import {
  getMessages, sendMessage as apiSend, markSeen,
  getChatUsers, getConversations, getUnread,
  getLocalUser,
} from "../lib/chat";

const POLL_MESSAGES_MS     = 2000;
const POLL_UNREAD_MS       = 15000;
const POLL_CONVERSATIONS_MS = 10000;

export function useChat() {
  const localUser = getLocalUser();
  const uid       = localUser?.id ?? "";

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [unreadTotal,   setUnreadTotal]   = useState(0);
  const [messages,      setMessages]      = useState<ChatMessage[]>([]);
  const [selectedUser,  setSelectedUser]  = useState<ChatUser | null>(null);
  const [users,         setUsers]         = useState<ChatUser[]>([]);
  const [searchQuery,   setSearchQuery]   = useState("");
  const [sending,       setSending]       = useState(false);
  const [error,         setError]         = useState("");

  // Track the timestamp of the newest message we have — for incremental polling
  const lastTimestamp = useRef<number>(0);
  const msgPollRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const unreadRef     = useRef<ReturnType<typeof setInterval> | null>(null);
  const convRef       = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Fetch user list ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!uid) return;
    getChatUsers(uid, searchQuery)
      .then(setUsers)
      .catch(e => setError(e.message));
  }, [uid, searchQuery]);

  // ── Conversations sidebar + unread badge polling ───────────────────────────
  useEffect(() => {
    if (!uid) return;

    const fetchConv = () =>
      getConversations(uid).then(setConversations).catch(() => {});
    const fetchUnread = () =>
      getUnread(uid).then(r => setUnreadTotal(r.total_unread)).catch(() => {});

    fetchConv();
    fetchUnread();

    convRef.current   = setInterval(fetchConv,    POLL_CONVERSATIONS_MS);
    unreadRef.current = setInterval(fetchUnread,  POLL_UNREAD_MS);

    return () => {
      if (convRef.current)   clearInterval(convRef.current);
      if (unreadRef.current) clearInterval(unreadRef.current);
    };
  }, [uid]);

  // ── Message polling — starts/stops with selectedUser ──────────────────────
  useEffect(() => {
    if (msgPollRef.current) clearInterval(msgPollRef.current);
    if (!uid || !selectedUser) { setMessages([]); return; }

    lastTimestamp.current = 0;

    // Initial full load
    getMessages(uid, selectedUser.id, 0).then(msgs => {
      setMessages(msgs);
      if (msgs.length > 0)
        lastTimestamp.current = msgs[msgs.length - 1].timestamp;
      // Mark incoming as seen
      markSeen(uid, selectedUser.id).catch(() => {});
    }).catch(e => setError(e.message));

    // Incremental poll
    msgPollRef.current = setInterval(async () => {
      try {
        const fresh = await getMessages(uid, selectedUser.id, lastTimestamp.current);
        if (fresh.length > 0) {
          setMessages(prev => {
            const existingIds = new Set(prev.map(m => m.id));
            const newOnes = fresh.filter(m => !existingIds.has(m.id));
            if (newOnes.length === 0) return prev;
            // Merge and re-sort
            const merged = [...prev, ...newOnes].sort((a, b) => a.timestamp - b.timestamp);
            lastTimestamp.current = merged[merged.length - 1].timestamp;
            return merged;
          });
          markSeen(uid, selectedUser.id).catch(() => {});
        }
      } catch { /* silent poll failure */ }
    }, POLL_MESSAGES_MS);

    return () => { if (msgPollRef.current) clearInterval(msgPollRef.current); };
  }, [uid, selectedUser?.id]);

  // ── Send ──────────────────────────────────────────────────────────────────
  const sendMsg = useCallback(async (text: string) => {
    if (!uid || !selectedUser || !text.trim()) return;
    setSending(true);
    setError("");
    try {
      const msg = await apiSend({
        senderId:   uid,
        receiverId: selectedUser.id,
        text:       text.trim(),
      });
      // Optimistically append
      setMessages(prev => {
        const merged = [...prev, msg].sort((a, b) => a.timestamp - b.timestamp);
        lastTimestamp.current = merged[merged.length - 1].timestamp;
        return merged;
      });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSending(false);
    }
  }, [uid, selectedUser]);

  return {
    localUser,
    uid,
    users,
    conversations,
    unreadTotal,
    messages,
    selectedUser,  setSelectedUser,
    searchQuery,   setSearchQuery,
    sending,
    error,         setError,
    sendMsg,
  };
}