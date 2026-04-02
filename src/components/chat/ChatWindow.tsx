import { useEffect, useRef, useState } from "react";
import { Send, Loader2 } from "lucide-react";
import type { ChatUser, ChatMessage } from "../../types/chat";
import MessageBubble from "./MessageBubble";

interface Props {
  messages: ChatMessage[];
  selectedUser: ChatUser;
  uid: string;
  sending: boolean;
  onSend: (text: string) => void;
}

export default function ChatWindow({ messages, selectedUser, uid, sending, onSend }: Props) {
  const [text,   setText]   = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  function handleSend() {
    if (!text.trim() || sending) return;
    onSend(text);
    setText("");
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-white/[0.07] shrink-0">
        <div className="relative">
          <img
            src={selectedUser.avatar || `https://i.pravatar.cc/150?u=${selectedUser.id}`}
            alt={selectedUser.username}
            className="w-8 h-8 rounded-full object-cover"
          />
          {selectedUser.online && (
            <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full
              bg-emerald-400 border-2 border-[#080c18]" />
          )}
        </div>
        <div>
          <p className="text-white text-[13px] font-semibold">{selectedUser.username}</p>
          <p className="text-[10px] text-white/35">
            {selectedUser.online ? "Online" : `Last seen ${selectedUser.last_seen
              ? new Date(selectedUser.last_seen).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              : "recently"}`}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-white/20 text-xs text-center">
              No messages yet.<br />Say hello 👋
            </p>
          </div>
        )}
        {messages.map(msg => (
          <MessageBubble
            key={msg.id}
            msg={msg}
            isOwn={msg.senderId === uid}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="flex items-center gap-2 px-3 py-3 border-t border-white/[0.07] shrink-0">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Type a message…"
          className="flex-1 px-3 py-2 rounded-xl text-[12px] text-white
            bg-white/[0.07] border border-white/[0.10] placeholder-white/25
            focus:outline-none focus:border-indigo-500/60 transition-colors resize-none"
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || sending}
          className="w-9 h-9 rounded-xl bg-indigo-600 hover:bg-indigo-500
            disabled:opacity-40 disabled:cursor-not-allowed
            flex items-center justify-center shrink-0 transition-colors"
        >
          {sending
            ? <Loader2 size={14} className="animate-spin text-white" />
            : <Send size={14} className="text-white" />
          }
        </button>
      </div>
    </div>
  );
}