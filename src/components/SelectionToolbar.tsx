/**
 * SelectionToolbar
 *
 * Fixes vs previous version:
 *  1. Position is now `position: fixed` using raw clientX/Y — the previous
 *     version added window.scrollX/Y which double-counted scroll and pushed
 *     the toolbar far to the right / bottom.
 *  2. Feed button calls onFeed AND onOpenFeedTab so the sidebar switches to
 *     the Feed tab automatically.
 *  3. Touch: toolbar centred at bottom of viewport (unchanged).
 */
import { useEffect, useRef, useState } from "react";
import { BookOpen, Zap, X } from "lucide-react";

interface Props {
  onDiary:       (text: string) => void;
  onFeed:        (text: string) => void;
  /** Called when Feed is clicked so the sidebar can open the Feed tab */
  onOpenFeedTab: () => void;
}

interface Pos { x: number; y: number }

export default function SelectionToolbar({ onDiary, onFeed, onOpenFeedTab }: Props) {
  const [pos,  setPos]  = useState<Pos | null>(null);
  const [text, setText] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleMouseUp(e: MouseEvent) {
      // Small delay so browser finishes updating the selection
      setTimeout(() => {
        const sel      = window.getSelection();
        const selected = sel?.toString().trim() ?? "";
        if (!selected || selected.length < 3) {
          setPos(null);
          setText("");
          return;
        }
        setText(selected);

        // Use raw clientX/Y — the toolbar is `position: fixed` so we must NOT
        // add scrollX/Y (that was the bug causing it to appear far off-screen).
        const x = Math.min(e.clientX, window.innerWidth - 140);
        const y = Math.max(e.clientY - 56, 8);   // 56px above cursor, min 8px from top
        setPos({ x, y });
      }, 10);
    }

    function handleMouseDown(e: MouseEvent) {
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

  // Touch support
  useEffect(() => {
    function handleTouchEnd() {
      setTimeout(() => {
        const sel      = window.getSelection();
        const selected = sel?.toString().trim() ?? "";
        if (!selected || selected.length < 3) return;
        setText(selected);
        setPos({
          x: window.innerWidth / 2 - 70,
          y: window.innerHeight - 120,
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
        left:           pos.x,
        top:            pos.y,
        background:     "rgba(8,12,24,0.97)",
        border:         "1px solid rgba(255,255,255,0.12)",
        backdropFilter: "blur(20px)",
        transform:      "translateX(-50%)",
        pointerEvents:  "auto",
      }}
    >
      {/* Diary button */}
      <button
        onMouseDown={e => e.preventDefault()}
        onClick={() => {
          onDiary(text);
          setPos(null);
          setText("");
          window.getSelection()?.removeAllRanges();
        }}
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
        onClick={() => {
          onFeed(text);        // trigger the API call
          onOpenFeedTab();     // open the Feed tab in the sidebar
          setPos(null);
          setText("");
          window.getSelection()?.removeAllRanges();
        }}
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
        onClick={() => {
          setPos(null);
          setText("");
          window.getSelection()?.removeAllRanges();
        }}
        className="p-1 text-white/25 hover:text-white/60 transition-colors"
      >
        <X size={10} />
      </button>
    </div>
  );
}