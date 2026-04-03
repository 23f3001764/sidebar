import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSteamiStore } from '@/stores/steami-store';
import { BookOpen, Sparkles, Twitter, Link2, Check } from 'lucide-react';

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
  const [copied, setCopied] = useState(false);
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
    setPos({ x: rect.left + rect.width / 2, y: rect.top - 12 });
    setSelectedText(text);
    setShow(true);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('mouseup', handleMouseUp);
    return () => el.removeEventListener('mouseup', handleMouseUp);
  }, [containerRef, handleMouseUp]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed z-[999]"
          style={{
            left: pos.x,
            top: pos.y,
            transform: 'translate(-50%, -100%)',
          }}
          initial={{ opacity: 0, scale: 0.85, y: 6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 6 }}
          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        >
          <div
            className="flex items-center gap-1 rounded-xl px-1.5 py-1.5"
            style={{
              background: 'rgba(8, 20, 48, 0.88)',
              backdropFilter: 'blur(20px) saturate(160%)',
              border: '1px solid rgba(99, 179, 237, 0.25)',
              boxShadow:
                '0 12px 40px rgba(0, 0, 0, 0.5), 0 0 24px rgba(99, 179, 237, 0.1), inset 0 1px 0 rgba(255,255,255,0.08)',
            }}
          >
            <motion.button
              whileHover={{ scale: 1.06, backgroundColor: 'rgba(232, 184, 75, 0.18)' }}
              whileTap={{ scale: 0.94 }}
              onClick={() => {
                addToDiary({ text: selectedText, source, sourceType, field });
                setShow(false);
                window.getSelection()?.removeAllRanges();
              }}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 font-mono text-[9px] tracking-wider uppercase transition-colors"
              style={{
                color: 'hsl(var(--steami-gold))',
                border: '1px solid rgba(232, 184, 75, 0.2)',
                background: 'rgba(232, 184, 75, 0.06)',
              }}
            >
              <BookOpen className="w-3 h-3" />
              Diary
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.06, backgroundColor: 'rgba(111, 168, 255, 0.15)' }}
              whileTap={{ scale: 0.94 }}
              onClick={() => {
                setShow(false);
                window.getSelection()?.removeAllRanges();
              }}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 font-mono text-[9px] tracking-wider uppercase transition-colors"
              style={{
                color: 'hsl(var(--steami-cyan))',
                border: '1px solid rgba(111, 168, 255, 0.15)',
                background: 'rgba(111, 168, 255, 0.05)',
              }}
            >
              <Sparkles className="w-3 h-3" />
              Feed
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => {
                const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`"${selectedText}" — ${source}`)}&url=${encodeURIComponent(window.location.href)}`;
                window.open(tweetUrl, '_blank');
                setShow(false);
                window.getSelection()?.removeAllRanges();
              }}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 font-mono text-[9px] tracking-wider uppercase transition-colors"
              style={{
                color: 'hsl(var(--steami-cyan))',
                border: '1px solid rgba(111, 168, 255, 0.15)',
                background: 'rgba(111, 168, 255, 0.05)',
              }}
            >
              <Twitter className="w-3 h-3" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              onClick={async () => {
                await navigator.clipboard.writeText(selectedText);
                setCopied(true);
                setTimeout(() => { setCopied(false); setShow(false); }, 1200);
                window.getSelection()?.removeAllRanges();
              }}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 font-mono text-[9px] tracking-wider uppercase transition-colors"
              style={{
                color: copied ? 'hsl(var(--steami-gold))' : 'hsl(var(--muted-foreground))',
                border: '1px solid rgba(111, 168, 255, 0.15)',
                background: 'rgba(111, 168, 255, 0.05)',
              }}
            >
              {copied ? <Check className="w-3 h-3" /> : <Link2 className="w-3 h-3" />}
            </motion.button>
          </div>
          {/* Arrow */}
          <div
            className="mx-auto w-0 h-0"
            style={{
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: '6px solid rgba(10, 18, 42, 0.92)',
              marginTop: '-1px',
              width: 'fit-content',
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}