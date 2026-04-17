/**
 * components/chat/ChatDashboard.tsx
 * Full real-time-style chat using the STEAMI messages API.
 * - Lists all users you can message
 * - Shows conversation thread
 * - Sends messages
 * - Marks as seen
 * - Polls for new messages every 4s
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Send, Loader2, MessageCircle, Search,
  User, ChevronLeft, Circle,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { chatApi, type ChatMessage, type ConversationUser } from "@/lib/api";

interface Props {
  onClose: () => void;
}

// ── Message bubble ─────────────────────────────────────────────────────────────
function Bubble({ msg, isMine }: { msg: ChatMessage; isMine: boolean }) {
  const time = new Date(msg.created_at).toLocaleTimeString("en-GB", {
    hour: "2-digit", minute: "2-digit",
  });
  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"} mb-2`}>
      <div className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl ${
        isMine
          ? "bg-indigo-600 text-white rounded-br-sm"
          : "bg-white/[0.08] text-white/85 rounded-bl-sm"
      }`}>
        <p className="text-[13px] leading-relaxed break-words">{msg.text}</p>
        <p className={`text-[9px] mt-1 ${isMine ? "text-white/50 text-right" : "text-white/30"}`}>
          {time}{isMine && msg.status === "seen" && " · seen"}
        </p>
      </div>
    </div>
  );
}

// ── User list item ─────────────────────────────────────────────────────────────
function UserItem({ u, selected, onClick }: {
  u: ConversationUser; selected: boolean; onClick: () => void;
}) {
  return (
    <button onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
        selected ? "bg-indigo-600/20" : "hover:bg-white/[0.04]"
      }`}>
      <div className="w-9 h-9 rounded-full bg-indigo-700/40 flex items-center justify-center shrink-0
        text-indigo-200 text-xs font-bold border border-indigo-500/20">
        {u.username.slice(0, 2).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-[12px] font-semibold truncate">{u.username}</p>
        {u.lastMessage && (
          <p className="text-white/30 text-[10px] truncate">{u.lastMessage}</p>
        )}
      </div>
      {(u.unseenCount ?? 0) > 0 && (
        <span className="w-5 h-5 rounded-full bg-indigo-500 text-white text-[9px] font-bold
          flex items-center justify-center shrink-0">
          {u.unseenCount}
        </span>
      )}
    </button>
  );
}

// ── Main dashboard ─────────────────────────────────────────────────────────────
export default function ChatDashboard({ onClose }: Props) {
  const { user, isAuthenticated } = useAuthStore();
  const [users,       setUsers]       = useState<ConversationUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ConversationUser | null>(null);
  const [messages,    setMessages]    = useState<ChatMessage[]>([]);
  const [text,        setText]        = useState("");
  const [loading,     setLoading]     = useState(true);
  const [sending,     setSending]     = useState(false);
  const [search,      setSearch]      = useState("");
  const [mobileView,  setMobileView]  = useState<"list" | "chat">("list");
  const bottomRef = useRef<HTMLDivElement>(null);
  const pollRef   = useRef<ReturnType<typeof setInterval> | null>(null);

  const myId = user?.id ?? "";

  // Upsert chat profile once
  useEffect(() => {
    if (!isAuthenticated || !user) return;
    chatApi.upsertProfile({
      id: myId,
      username: user.full_name,
      email: user.email,
      avatar: "",
    }).catch(() => {});
  }, [isAuthenticated, user, myId]);

  // Load users
  const loadUsers = useCallback(async () => {
    try {
      const r = await chatApi.listUsers(myId, search);
      setUsers(r.users ?? []);
    } catch {}
    setLoading(false);
  }, [myId, search]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  // Load conversation
  const loadConversation = useCallback(async () => {
    if (!selectedUser || !myId) return;
    try {
      const r = await chatApi.conversation(myId, selectedUser.id);
      setMessages(r.messages ?? []);
      // Mark as seen
      chatApi.markSeen(myId, selectedUser.id).catch(() => {});
    } catch {}
  }, [selectedUser, myId]);

  useEffect(() => {
    loadConversation();
    pollRef.current && clearInterval(pollRef.current);
    if (selectedUser) {
      pollRef.current = setInterval(loadConversation, 4000);
    }
    return () => { pollRef.current && clearInterval(pollRef.current); };
  }, [selectedUser, loadConversation]);

  // Scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    if (!text.trim() || !selectedUser || sending) return;
    const draft = text.trim();
    setText("");
    setSending(true);
    try {
      const msg = await chatApi.send(myId, selectedUser.id, draft);
      setMessages(prev => [...prev, msg]);
    } catch {
      setText(draft); // restore on error
    }
    setSending(false);
  }

  function selectUser(u: ConversationUser) {
    setSelectedUser(u);
    setMobileView("chat");
    setMessages([]);
  }

  const filteredUsers = users.filter(u =>
    !search || u.username.toLowerCase().includes(search.toLowerCase())
  );

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center"
        style={{ background: "rgba(2,4,12,0.85)", backdropFilter: "blur(16px)" }}>
        <div className="text-center text-white/40 space-y-3">
          <MessageCircle size={40} className="mx-auto opacity-30" />
          <p className="text-sm">Login to access Chat</p>
          <button onClick={onClose}
            className="text-[10px] font-mono uppercase text-indigo-400 hover:text-indigo-300">
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: "rgba(2,4,12,0.85)", backdropFilter: "blur(16px)" }}>
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 0.99, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 16 }}
        className="w-full max-w-3xl h-[580px] rounded-2xl overflow-hidden flex shadow-2xl"
        style={{ background: "rgba(8,12,24,0.98)", border: "1px solid rgba(255,255,255,0.09)" }}>

        {/* ── Left: user list ──────────────────────────────────────────── */}
        <div className={`flex flex-col w-72 shrink-0 border-r border-white/[0.07]
          ${mobileView === "chat" ? "hidden sm:flex" : "flex"} sm:flex`}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/[0.07]">
            <div className="flex items-center gap-2">
              <MessageCircle size={14} className="text-indigo-400" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-white/60">Messages</span>
            </div>
            <button onClick={onClose} className="text-white/30 hover:text-white transition-colors p-1">
              <X size={14} />
            </button>
          </div>

          {/* Search */}
          <div className="px-3 py-2 border-b border-white/[0.05]">
            <div className="relative">
              <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/25" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search users…"
                className="w-full pl-7 pr-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.07]
                  text-white text-[11px] placeholder-white/20 focus:outline-none focus:border-indigo-500/40" />
            </div>
          </div>

          {/* Users */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-32 text-white/20">
                <Loader2 size={18} className="animate-spin" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 gap-2 text-white/20">
                <User size={20} />
                <p className="text-xs">No users yet</p>
              </div>
            ) : (
              filteredUsers.filter(u => u.id !== myId).map(u => (
                <UserItem key={u.id} u={u}
                  selected={selectedUser?.id === u.id}
                  onClick={() => selectUser(u)} />
              ))
            )}
          </div>

          {/* My info */}
          <div className="px-4 py-3 border-t border-white/[0.07] flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-indigo-600/40 flex items-center justify-center
              text-indigo-200 text-[10px] font-bold shrink-0">
              {user?.full_name.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-[11px] font-semibold truncate">{user?.full_name}</p>
              <p className="text-white/25 text-[9px] font-mono">{user?.role}</p>
            </div>
            <Circle size={7} className="text-emerald-400 fill-emerald-400 shrink-0" />
          </div>
        </div>

        {/* ── Right: conversation ──────────────────────────────────────── */}
        <div className={`flex-1 flex flex-col min-w-0
          ${mobileView === "list" ? "hidden sm:flex" : "flex"} sm:flex`}>
          {!selectedUser ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-white/20">
              <MessageCircle size={36} />
              <p className="text-sm">Select a conversation</p>
            </div>
          ) : (
            <>
              {/* Conversation header */}
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.07]">
                <button onClick={() => setMobileView("list")}
                  className="sm:hidden p-1 text-white/40 hover:text-white">
                  <ChevronLeft size={16} />
                </button>
                <div className="w-8 h-8 rounded-full bg-indigo-700/40 flex items-center justify-center
                  text-indigo-200 text-xs font-bold border border-indigo-500/20 shrink-0">
                  {selectedUser.username.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">{selectedUser.username}</p>
                  <p className="text-white/25 text-[9px] font-mono">{selectedUser.email}</p>
                </div>
                <button onClick={onClose} className="ml-auto text-white/30 hover:text-white p-1 sm:hidden">
                  <X size={14} />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4"
                style={{ scrollbarWidth: "thin" }}>
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-white/15 text-xs">
                    No messages yet. Say hello! 👋
                  </div>
                ) : (
                  messages.map(msg => (
                    <Bubble key={msg.id} msg={msg} isMine={msg.senderId === myId} />
                  ))
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="px-4 py-3 border-t border-white/[0.07] flex items-center gap-2">
                <input
                  value={text}
                  onChange={e => setText(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  placeholder={`Message ${selectedUser.username}…`}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.09]
                    text-white text-[13px] placeholder-white/20
                    focus:outline-none focus:border-indigo-500/40 transition-colors" />
                <button onClick={sendMessage} disabled={!text.trim() || sending}
                  className="w-9 h-9 rounded-xl bg-indigo-600 hover:bg-indigo-500
                    flex items-center justify-center text-white
                    disabled:opacity-40 transition-all shrink-0">
                  {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
