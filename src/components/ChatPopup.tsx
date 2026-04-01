import { useEffect } from "react";
import { X, MessageCircle } from "lucide-react";

export default function ChatPopup({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      style={{ background: "rgba(2,4,12,0.82)", backdropFilter: "blur(14px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl text-center px-8 py-10 shadow-2xl"
        style={{
          background:    "rgba(8,12,24,0.98)",
          backdropFilter:"blur(32px)",
          border:        "1px solid rgba(255,255,255,0.09)",
        }}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 p-1.5 rounded-full
            bg-white/[0.09] hover:bg-white/20 text-white/70 hover:text-white transition-colors"
        >
          <X size={14} />
        </button>

        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-indigo-600/18 border border-indigo-500/28
            flex items-center justify-center">
            <MessageCircle size={26} className="text-indigo-400" />
          </div>
        </div>

        <h2 className="text-white font-bold text-lg mb-2">Intelligence Chat</h2>
        <p className="text-white/40 text-sm leading-relaxed mb-6">
          🚧 Chat room will be added soon.
          <br />
          Real-time collaboration across STEAMI's intelligence network.
        </p>

        <button
          onClick={onClose}
          className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500
            text-white text-sm font-semibold transition-colors"
        >
          Got it
        </button>
      </div>
    </div>
  );
}