import { useEffect, useState, useCallback } from 'react';
import { useSteamiStore } from '@/stores/steami-store';

interface Props {
  containerRef: React.RefObject<HTMLDivElement>;
  source: string;
  sourceType: 'explainer' | 'article';
  field?: string;
}

export function TextSelectionPopover({ containerRef, source, sourceType, field }: Props) {
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [selectedText, setSelectedText] = useState('');
  const addToDiary = useSteamiStore((s) => s.addToDiary);

  const handleMouseUp = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.toString().trim()) {
      setShow(false);
      return;
    }
    const text = sel.toString().trim();
    if (text.length < 5) {
      setShow(false);
      return;
    }
    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    setPos({ x: rect.left + rect.width / 2, y: rect.top - 10 });
    setSelectedText(text);
    setShow(true);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('mouseup', handleMouseUp);
    return () => el.removeEventListener('mouseup', handleMouseUp);
  }, [containerRef, handleMouseUp]);

  if (!show) return null;

  return (
    <div
      className="fixed z-[999] flex gap-1 animate-fade-in"
      style={{
        left: pos.x,
        top: pos.y,
        transform: 'translate(-50%, -100%)',
      }}
    >
      <button
        onClick={() => {
          addToDiary({ text: selectedText, source, sourceType, field });
          setShow(false);
          window.getSelection()?.removeAllRanges();
        }}
        className="steami-btn text-[9px] py-1.5 px-3"
        style={{ fontSize: '9px', padding: '6px 10px' }}
      >
        📝 Save to Diary
      </button>
      <button
        onClick={() => {
          setShow(false);
          window.getSelection()?.removeAllRanges();
        }}
        className="steami-btn steami-btn-gold text-[9px] py-1.5 px-3"
        style={{ fontSize: '9px', padding: '6px 10px' }}
      >
        🤖 AI Recommend
      </button>
    </div>
  );
}
