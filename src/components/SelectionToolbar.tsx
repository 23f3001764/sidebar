/**
 * SelectionToolbar
 *
 * Floats near selected text. Shows:
 *   📓 Diary — save selection to research diary
 *   ⚡ Feed  — fetch related articles, open Feed tab in SidePanel
 *
 * Fix: The toolbar now calls onFeed(text) which should:
 *   1. Call fetchFeedForSelection(text) (sends POST to backend)
 *   2. Open the "feed" tab in SidePanel
 * Both happen in App.tsx's handleFeed().
 *
 * The "Failed to Fetch" error was because the toolbar showed an error
 * inline — now errors are passed up to the parent to show in SidePanel.
 */
import { useEffect, useRef, useState } from "react";
import { BookOpen, Zap, X } from "lucide-react";

interface Props {
  onDiary: (text: string) => void;
  onFeed:  (text: string) => void;
}

interface Pos { x: number; y: number }

export default function SelectionToolbar({ onDiary, onFeed }: Props) {
  const [pos,  setPos]  = useState<Pos | null>(null);
  const [text, setText] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  function dismiss() { setPos(null); setText(""); }

  useEffect(() => {
    function onMouseUp(e: MouseEvent) {
      setTimeout(() => {
        const sel      = window.getSelection();
        const selected = sel?.toString().trim() ?? "";
        // Ignore if user clicked inside our toolbar
        if (ref.current?.contains(e.target as Node)) return;
        if (!selected || selected.length < 3) { dismiss(); return; }
        setText(selected);
        // Position above the mouse-up point, centred
        setPos({
          x: e.clientX + window.scrollX,
          y: e.clientY + window.scrollY - 60,
        });
      }, 10);
    }

    function onMouseDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        // Only dismiss if clicking outside AND no text selected
        setTimeout(() => {
          const sel = window.getSelection()?.toString().trim() ?? "";
          if (!sel) dismiss();
        }, 0);
      }
    }

    document.addEventListener("mouseup",   onMouseUp);
    document.addEventListener("mousedown", onMouseDown);
    return () => {
      document.removeEventListener("mouseup",   onMouseUp);
      document.removeEventListener("mousedown", onMouseDown);
    };
  }, []);

  // Touch support for mobile
  useEffect(() => {
    function onTouchEnd() {
      setTimeout(() => {
        const sel      = window.getSelection();
        const selected = sel?.toString().trim() ?? "";
        if (!selected || selected.length < 3) return;
        setText(selected);
        setPos({
          x: window.scrollX + window.innerWidth / 2,
          y: window.scrollY + window.innerHeight - 130,
        });
      }, 80);
    }
    document.addEventListener("touchend", onTouchEnd);
    return () => document.removeEventListener("touchend", onTouchEnd);
  }, []);

  if (!pos || !text) return null;

  return (
    <div
      ref={ref}
      className="fixed z-[100] flex items-center gap-1 px-2 py-1.5 rounded-xl shadow-2xl select-none"
      style={{
        left:          pos.x,
        top:           pos.y,
        transform:     "translateX(-50%)",
        background:    "rgba(8,12,24,0.97)",
        border:        "1px solid rgba(255,255,255,0.12)",
        backdropFilter:"blur(20px)",
        pointerEvents: "auto",
      }}
    >
      {/* Diary */}
      <button
        onMouseDown={e => e.preventDefault()}
        onClick={() => { onDiary(text); dismiss(); }}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg
          bg-amber-500/20 hover:bg-amber-500/40 text-amber-300
          text-[11px] font-semibold transition-colors"
        title="Save to Research Diary"
      >
        <BookOpen size={12} />
        Diary
      </button>

      {/* Feed */}
      <button
        onMouseDown={e => e.preventDefault()}
        onClick={() => { onFeed(text); dismiss(); }}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg
          bg-indigo-500/25 hover:bg-indigo-500/50 text-indigo-300
          text-[11px] font-semibold transition-colors"
        title="Find related articles"
      >
        <Zap size={12} />
        Feed
      </button>

      {/* Dismiss */}
      <button
        onMouseDown={e => e.preventDefault()}
        onClick={dismiss}
        className="p-1 text-white/25 hover:text-white/60 transition-colors"
      >
        <X size={10} />
      </button>
    </div>
  );
}