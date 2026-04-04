/**
 * ChatDashboard — mobile-first redesign.
 *
 * Mobile (< sm): full-screen, single panel that toggles between
 *   conversation list and active chat using a back arrow.
 * Desktop (≥ sm): side-by-side 300px user list + chat window.
 */
import { useState } from "react";
import { X, ArrowLeft } from "lucide-react";
import { useChat } from "../../hooks/useChat";
import { getLocalUser, setLocalUser } from "../../lib/chat";
import type { LocalUser } from "../../types/chat";
import UserSearch  from "./UserSearch";
import ChatWindow  from "./ChatWindow";
import LoginPrompt from "./LoginPrompt";

interface Props { onClose: () => void }

export default function ChatDashboard({ onClose }: Props) {
  const [localUser, setLocalUserState] = useState<LocalUser | null>(getLocalUser);
  // On mobile, track which panel is shown: "list" or "chat"
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");

  const {
    users, conversations, messages,
    selectedUser, setSelectedUser,
    searchQuery,  setSearchQuery,
    sending, error, setError,
    unreadTotal,
    sendMsg,
  } = useChat();

  const unreadBySender: Record<string, number> = {};
  conversations.forEach(c => {
    if (c.unread_count > 0) unreadBySender[c.user.id] = c.unread_count;
  });

  function handleLogin(user: LocalUser) {
    setLocalUserState(user);
  }

  function selectUser(u: typeof selectedUser) {
    setSelectedUser(u);
    setMobileView("chat");
  }

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-0 sm:p-4"
      style={{ background: "rgba(2,4,12,0.82)", backdropFilter: "blur(14px)" }}
      onClick={onClose}
    >
      <div
        className={[
          "relative flex overflow-hidden shadow-2xl",
          // Full screen on mobile, fixed size on desktop
          "w-full h-full sm:w-[860px] sm:h-[560px]",
          "sm:rounded-2xl",
        ].join(" ")}
        style={{
          background:    "rgba(8,12,24,0.97)",
          backdropFilter:"blur(32px)",
          border:        "1px solid rgba(255,255,255,0.09)",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button onClick={onClose}
          className="absolute top-3.5 right-3.5 z-20 p-1.5 rounded-full
            bg-white/[0.08] hover:bg-white/20 text-white/60 hover:text-white transition-colors">
          <X size={14} />
        </button>

        {!localUser ? (
          <div className="w-full"><LoginPrompt onLogin={handleLogin} /></div>
        ) : (
          <>
            {/* ── LEFT panel — user list ─────────────────────────────────
                Desktop: always visible (w-[300px])
                Mobile: shown when mobileView === "list"
            ──────────────────────────────────────────────────────────── */}
            <div className={[
              "flex flex-col border-r border-white/[0.07] p-4",
              // Desktop: fixed width, always shown
              "sm:flex sm:w-[300px] sm:relative sm:translate-x-0",
              // Mobile: full width, conditionally shown
              "absolute inset-0",
              mobileView === "list"
                ? "flex w-full translate-x-0 z-10"
                : "hidden sm:flex",
            ].join(" ")}>
              {/* Header */}
              <div className="flex items-center justify-between mb-3 pr-8">
                <div className="flex items-center gap-2">
                  <img
                    src={localUser.avatar || `https://i.pravatar.cc/150?u=${localUser.id}`}
                    alt={localUser.username}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                  <span className="text-white text-[12px] font-semibold truncate max-w-[120px]">
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
                  onSelect={u => selectUser(u)}
                  selectedId={selectedUser?.id}
                  unreadBySender={unreadBySender}
                />
              </div>
            </div>

            {/* ── RIGHT panel — chat window ──────────────────────────────
                Desktop: takes remaining space
                Mobile: full width, shown when mobileView === "chat"
            ──────────────────────────────────────────────────────────── */}
            <div className={[
              "flex flex-col",
              // Desktop
              "sm:flex sm:flex-1 sm:min-w-0 sm:relative sm:translate-x-0",
              // Mobile
              "absolute inset-0",
              mobileView === "chat"
                ? "flex w-full translate-x-0 z-10"
                : "hidden sm:flex",
            ].join(" ")}>
              {/* Mobile back button */}
              {mobileView === "chat" && (
                <div className="flex sm:hidden items-center gap-2 px-4 py-3 border-b border-white/[0.07] shrink-0">
                  <button
                    onClick={() => setMobileView("list")}
                    className="p-1.5 rounded-lg bg-white/[0.07] text-white/60 hover:text-white"
                  >
                    <ArrowLeft size={16} />
                  </button>
                  {selectedUser && (
                    <div className="flex items-center gap-2">
                      <img
                        src={selectedUser.avatar}
                        alt={selectedUser.username}
                        className="w-7 h-7 rounded-full object-cover"
                      />
                      <span className="text-white text-[13px] font-semibold">{selectedUser.username}</span>
                    </div>
                  )}
                </div>
              )}

              {selectedUser ? (
                <ChatWindow
                  messages={messages}
                  selectedUser={selectedUser}
                  uid={localUser.id}
                  sending={sending}
                  onSend={sendMsg}
                />
              ) : (
                <div className="hidden sm:flex flex-col items-center justify-center h-full gap-2 text-white/20">
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
            flex items-center justify-between z-30">
            <span>⚠ {error}</span>
            <button onClick={() => setError("")} className="font-bold ml-2">✕</button>
          </div>
        )}
      </div>
    </div>
  );
}