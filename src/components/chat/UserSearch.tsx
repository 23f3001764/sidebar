import { useEffect, useRef } from "react";
import { Search } from "lucide-react";
import type { ChatUser, Conversation } from "../../types/chat";

interface Props {
  users: ChatUser[];
  conversations: Conversation[];
  query: string;
  onQuery: (q: string) => void;
  onSelect: (user: ChatUser) => void;
  selectedId?: string;
  unreadBySender: Record<string, number>;
}

export default function UserSearch({
  users, conversations, query, onQuery, onSelect, selectedId, unreadBySender,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  // Show conversation partners first (with last message), then others
  const convUserIds = new Set(conversations.map(c => c.user.id));

  const convUsers  = conversations.map(c => c.user as ChatUser);
  const otherUsers = users.filter(u => !convUserIds.has(u.id));
  const display    = query ? users : [...convUsers, ...otherUsers];

  function timeLabel(ts: number) {
    const d = new Date(ts);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    if (diffMs < 60_000) return "now";
    if (diffMs < 3600_000) return `${Math.floor(diffMs / 60_000)}m`;
    if (diffMs < 86_400_000) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return d.toLocaleDateString([], { day: "numeric", month: "short" });
  }

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Search input */}
      <div className="relative">
        <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          ref={inputRef}
          value={query}
          onChange={e => onQuery(e.target.value)}
          placeholder="Search people…"
          className="w-full pl-8 pr-3 py-2 rounded-lg text-xs text-white
            bg-white/[0.07] border border-white/[0.10] placeholder-white/25
            focus:outline-none focus:border-indigo-500/60 transition-colors"
        />
      </div>

      {/* User list */}
      <div className="flex-1 overflow-y-auto space-y-0.5 -mx-1">
        {display.length === 0 && (
          <p className="text-white/25 text-xs text-center py-8">
            {query ? "No users found" : "No conversations yet"}
          </p>
        )}

        {display.map(user => {
          const conv = conversations.find(c => c.user.id === user.id);
          const unread = unreadBySender[user.id] ?? 0;
          const isSelected = user.id === selectedId;

          return (
            <button
              key={user.id}
              onClick={() => onSelect(user)}
              className={[
                "w-full flex items-center gap-2.5 px-2 py-2.5 rounded-lg",
                "text-left transition-colors",
                isSelected
                  ? "bg-indigo-600/35 border border-indigo-500/30"
                  : "hover:bg-white/[0.06] border border-transparent",
              ].join(" ")}
            >
              {/* Avatar */}
              <div className="relative shrink-0">
                <img
                  src={user.avatar || `https://i.pravatar.cc/150?u=${user.id}`}
                  alt={user.username}
                  className="w-9 h-9 rounded-full object-cover"
                  onError={e => {
                    (e.currentTarget as HTMLImageElement).src =
                      `https://i.pravatar.cc/150?u=${user.id}`;
                  }}
                />
                {user.online && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5
                    rounded-full bg-emerald-400 border-2 border-[#080c18]" />
                )}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-white text-[12px] font-semibold truncate">
                    {user.username}
                  </span>
                  {conv?.last_message && (
                    <span className="text-white/25 text-[9px] shrink-0">
                      {timeLabel(conv.last_message.timestamp)}
                    </span>
                  )}
                </div>
                {conv?.last_message ? (
                  <p className="text-white/35 text-[10px] truncate leading-tight">
                    {conv.last_message.text}
                  </p>
                ) : (
                  <p className="text-white/20 text-[10px]">
                    {user.online ? "Online" : "Offline"}
                  </p>
                )}
              </div>

              {/* Unread badge */}
              {unread > 0 && (
                <span className="shrink-0 w-4 h-4 rounded-full bg-indigo-500
                  text-white text-[9px] font-bold flex items-center justify-center">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}