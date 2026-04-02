import { useState } from "react";
import { X } from "lucide-react";
import { useChat } from "../../hooks/useChat";
import { getLocalUser, setLocalUser } from "../../lib/chat";
import type { LocalUser } from "../../types/chat";
import UserSearch  from "./UserSearch";
import ChatWindow  from "./ChatWindow";
import LoginPrompt from "./LoginPrompt";

interface Props {
  onClose: () => void;
}

export default function ChatDashboard({ onClose }: Props) {
  // localUser may be null on first open — LoginPrompt handles that case
  const [localUser, setLocalUserState] = useState<LocalUser | null>(getLocalUser);

  const {
    users, conversations, messages,
    selectedUser, setSelectedUser,
    searchQuery,  setSearchQuery,
    sending, error, setError,
    unreadTotal,
    sendMsg,
  } = useChat();

  // Unread per sender for badges
  const unreadBySender: Record<string, number> = {};
  conversations.forEach(c => {
    if (c.unread_count > 0) unreadBySender[c.user.id] = c.unread_count;
  });

  function handleLogin(user: LocalUser) {
    setLocalUserState(user);
  }

  return (
    /* ── Backdrop ─────────────────────────────────────────────────────────── */
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4"
      style={{ background: "rgba(2,4,12,0.82)", backdropFilter: "blur(14px)" }}
      onClick={onClose}
    >
      {/* ── Glass card ─────────────────────────────────────────────────────── */}
      <div
        className="relative flex w-full max-w-[860px] h-[560px] rounded-2xl overflow-hidden shadow-2xl"
        style={{
          background:    "rgba(8,12,24,0.97)",
          backdropFilter:"blur(32px)",
          border:        "1px solid rgba(255,255,255,0.09)",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 z-10 p-1.5 rounded-full
            bg-white/[0.08] hover:bg-white/20 text-white/60 hover:text-white transition-colors"
        >
          <X size={14} />
        </button>

        {/* ── No user: show login prompt ─────────────────────────────────── */}
        {!localUser ? (
          <div className="w-full">
            <LoginPrompt onLogin={handleLogin} />
          </div>
        ) : (
          <>
            {/* ── LEFT: user list ──────────────────────────────────────── */}
            <div
              className="w-[300px] shrink-0 flex flex-col border-r border-white/[0.07] p-4"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <img
                    src={localUser.avatar || `https://i.pravatar.cc/150?u=${localUser.id}`}
                    alt={localUser.username}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                  <span className="text-white text-[12px] font-semibold truncate max-w-[110px]">
                    {localUser.username}
                  </span>
                </div>
                {unreadTotal > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-indigo-500 text-white text-[9px] font-bold">
                    {unreadTotal > 99 ? "99+" : unreadTotal}
                  </span>
                )}
              </div>

              <div className="flex-1 min-h-0">
                <UserSearch
                  users={users}
                  conversations={conversations}
                  query={searchQuery}
                  onQuery={setSearchQuery}
                  onSelect={u => { setSelectedUser(u); setError(""); }}
                  selectedId={selectedUser?.id}
                  unreadBySender={unreadBySender}
                />
              </div>
            </div>

            {/* ── RIGHT: chat window ────────────────────────────────────── */}
            <div className="flex-1 min-w-0 flex flex-col">
              {selectedUser ? (
                <ChatWindow
                  messages={messages}
                  selectedUser={selectedUser}
                  uid={localUser.id}
                  sending={sending}
                  onSend={sendMsg}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-2 text-white/20">
                  <span className="text-3xl">💬</span>
                  <p className="text-xs">Select someone to start a conversation</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Error strip */}
        {error && (
          <div className="absolute bottom-0 left-0 right-0 px-4 py-2
            bg-red-950/90 border-t border-red-800/50 text-red-300 text-[10px]
            flex items-center justify-between">
            <span>⚠ {error}</span>
            <button onClick={() => setError("")} className="font-bold">✕</button>
          </div>
        )}
      </div>
    </div>
  );
}