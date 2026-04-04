/**
 * SelectionToolbar
 *
 * Floats near the selected text. Shows two buttons:
 *   📓 Diary  — already working, calls existing diary save logic
 *   ⚡ Feed   — new, calls fetchFeedForSelection() then opens Feed tab
 *
 * Usage: render once at root level. Attach onFeedClick prop.
 * The toolbar positions itself at the mouse-up point using a ref.
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

  useEffect(() => {
    function handleMouseUp(e: MouseEvent) {
      // Small delay so browser finishes setting the selection
      setTimeout(() => {
        const sel = window.getSelection();
        const selected = sel?.toString().trim() ?? "";
        if (!selected || selected.length < 3) {
          setPos(null);
          setText("");
          return;
        }
        setText(selected);

        // Position the toolbar just above where the user released the mouse
        const scrollY = window.scrollY;
        const scrollX = window.scrollX;
        setPos({
          x: Math.min(e.clientX + scrollX, window.innerWidth + scrollX - 140),
          y: e.clientY + scrollY - 56,  // 56px above cursor
        });
      }, 10);
    }

    function handleMouseDown(e: MouseEvent) {
      // Dismiss if user clicks away from toolbar
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setPos(null);
        setText("");
      }
    }

    document.addEventListener("mouseup",   handleMouseUp);
    document.addEventListener("mousedown", handleMouseDown);
    return () => {
      document.removeEventListener("mouseup",   handleMouseUp);
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, []);

  // Also handle touch selection on mobile
  useEffect(() => {
    function handleTouchEnd() {
      setTimeout(() => {
        const sel = window.getSelection();
        const selected = sel?.toString().trim() ?? "";
        if (!selected || selected.length < 3) return;
        setText(selected);
        // On mobile centre the toolbar at the bottom of the screen
        setPos({
          x: window.scrollX + window.innerWidth / 2 - 70,
          y: window.scrollY + window.innerHeight - 120,
        });
      }, 80);
    }
    document.addEventListener("touchend", handleTouchEnd);
    return () => document.removeEventListener("touchend", handleTouchEnd);
  }, []);

  if (!pos || !text) return null;

  return (
    <div
      ref={ref}
      className="fixed z-[100] flex items-center gap-1.5 px-2 py-1.5 rounded-xl shadow-2xl"
      style={{
        left:          pos.x,
        top:           pos.y,
        background:    "rgba(8,12,24,0.97)",
        border:        "1px solid rgba(255,255,255,0.12)",
        backdropFilter:"blur(20px)",
        transform:     "translateX(-50%)",
        pointerEvents: "auto",
      }}
    >
      {/* Diary button */}
      <button
        onMouseDown={e => e.preventDefault()}   // prevent blur before click
        onClick={() => { onDiary(text); setPos(null); setText(""); }}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg
          bg-amber-500/20 hover:bg-amber-500/40 text-amber-300
          text-[11px] font-semibold transition-colors"
        title="Save to Research Diary"
      >
        <BookOpen size={12} />
        Diary
      </button>

      {/* Feed button */}
      <button
        onMouseDown={e => e.preventDefault()}
        onClick={() => { onFeed(text); setPos(null); setText(""); }}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg
          bg-indigo-500/25 hover:bg-indigo-500/50 text-indigo-300
          text-[11px] font-semibold transition-colors"
        title="Find related articles in Feed"
      >
        <Zap size={12} />
        Feed
      </button>

      {/* Dismiss */}
      <button
        onMouseDown={e => e.preventDefault()}
        onClick={() => { setPos(null); setText(""); }}
        className="p-1 text-white/25 hover:text-white/60 transition-colors"
      >
        <X size={10} />
      </button>
    </div>
  );
}