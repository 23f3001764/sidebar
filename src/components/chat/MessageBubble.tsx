import type { ChatMessage } from "../../types/chat";

interface Props {
  msg: ChatMessage;
  isOwn: boolean;
}

export default function MessageBubble({ msg, isOwn }: Props) {
  const time = new Date(msg.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
      <div
        className={[
          "px-3 py-2 rounded-2xl max-w-[65%] text-sm leading-relaxed",
          "shadow-sm",
          isOwn
            ? "bg-indigo-600 text-white rounded-br-sm"
            : "bg-white/[0.10] text-white/90 border border-white/[0.08] rounded-bl-sm",
        ].join(" ")}
      >
        <p>{msg.text}</p>
        <div
          className={[
            "flex items-center gap-1 mt-1",
            isOwn ? "justify-end" : "justify-start",
          ].join(" ")}
        >
          <span className="text-[10px] opacity-50">{time}</span>
          {isOwn && (
            <span className="text-[11px] opacity-60">
              {msg.status === "seen" ? "✓✓" : "✓"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}