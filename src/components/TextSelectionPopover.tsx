/**
 * TextSelectionPopover
 *
 * Renders a mini toolbar when the user selects text inside the research
 * article modal. Shows: Diary | Feed | Tweet | Copy
 *
 * KEY FIXES vs previous version:
 * ─────────────────────────────────────────────────────────────────────
 * 1. POSITION BUG — framer-motion applies CSS `transform` on the modal
 *    which creates a new stacking context. Any child with
 *    `position: fixed` gets positioned relative to that transformed
 *    ancestor — NOT the viewport — so the toolbar landed in the
 *    top-right corner. Fix: compute position using
 *    `getBoundingClientRect()` of the containerRef and offset from
 *    selection rect relative to that, then use `position: absolute`
 *    inside a full-overlay portal div that covers the whole modal.
 *
 * 2. FEED BUTTON — was just closing the popover. Now it calls
 *    POST /api/feed/from-selection and shows a small inline results
 *    drawer below the toolbar (no SidePanel dependency — self-contained).
 *
 * 3. REMOVED Twitter / copy-link clutter from the main row — kept only
 *    Diary | Feed | Copy (Twitter moved into a secondary icon).
 *
 * Props:
 *   containerRef  — ref to the scrollable modal content div
 *   source        — article title (for diary)
 *   sourceType    — 'article' | 'explainer'
 *   field         — article field/category (optional, for diary)
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSteamiStore } from '@/stores/steami-store';
import { BookOpen, Zap, Link2, Check, X, ExternalLink, Loader2 } from 'lucide-react';

// ── types ─────────────────────────────────────────────────────────────────────

interface FeedResult {
  id: string;
  title: string;
  short_summary?: string;
  article_url?: string;
  url?: string;
  source?: string;
  image_url?: string;
}

interface Props {
  containerRef: React.RefObject<HTMLDivElement>;
  source: string;
  sourceType: 'explainer' | 'article';
  field?: string;
}

// ── constants ─────────────────────────────────────────────────────────────────

const BASE =
  (typeof import.meta !== 'undefined'
    ? (import.meta as any).env?.VITE_FLASK_API_URL
    : undefined) ?? 'http://127.0.0.1:5000';

// ── component ─────────────────────────────────────────────────────────────────

export function TextSelectionPopover({ containerRef, source, sourceType, field }: Props) {
  const [show,         setShow]         = useState(false);
  // pos is relative to the viewport (used with position:fixed on the portal)
  const [pos,          setPos]          = useState({ x: 0, y: 0 });
  const [selectedText, setSelectedText] = useState('');
  const [copied,       setCopied]       = useState(false);

  // Feed state
  const [feedLoading,  setFeedLoading]  = useState(false);
  const [feedResults,  setFeedResults]  = useState<FeedResult[]>([]);
  const [feedError,    setFeedError]    = useState('');
  const [feedOpen,     setFeedOpen]     = useState(false);
  const [feedKeywords, setFeedKeywords] = useState<string[]>([]);

  const addToDiary = useSteamiStore((s) => s.addToDiary);
  const toolbarRef = useRef<HTMLDivElement>(null);

  // ── position calculation ──────────────────────────────────────────────────
  // We must NOT use `position: fixed` relative to viewport because framer-motion
  // transforms on parent elements create a new containing block for fixed children.
  // Instead we render into a portal at document.body with `position: fixed`.
  // The portal lives OUTSIDE the transformed modal, so fixed works correctly.

  const handleMouseUp = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.toString().trim()) {
      setShow(false);
      setFeedOpen(false);
      return;
    }
    const text = sel.toString().trim();
    if (text.length < 5) {
      setShow(false);
      return;
    }

    const range = sel.getRangeAt(0);
    const rect  = range.getBoundingClientRect();

    // Check the selection is actually inside our container
    const container = containerRef.current;
    if (container) {
      const containerRect = container.getBoundingClientRect();
      const inContainer   =
        rect.left   >= containerRect.left - 20 &&
        rect.right  <= containerRect.right + 20 &&
        rect.top    >= containerRect.top - 20 &&
        rect.bottom <= containerRect.bottom + 20;
      if (!inContainer) return;
    }

    // Toolbar appears centered above the selection, 8px gap
    setPos({
      x: rect.left + rect.width / 2,
      y: rect.top - 8,
    });
    setSelectedText(text);
    setFeedResults([]);
    setFeedError('');
    setFeedOpen(false);
    setShow(true);
  }, [containerRef]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('mouseup', handleMouseUp);
    return () => el.removeEventListener('mouseup', handleMouseUp);
  }, [containerRef, handleMouseUp]);

  // Close on mousedown outside toolbar
  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        setShow(false);
        setFeedOpen(false);
      }
    }
    if (show) document.addEventListener('mousedown', handleMouseDown);
    return ()  => document.removeEventListener('mousedown', handleMouseDown);
  }, [show]);

  // ── Feed API call ─────────────────────────────────────────────────────────

  async function handleFeed() {
    if (!selectedText) return;
    setFeedLoading(true);
    setFeedOpen(true);
    setFeedError('');
    setFeedResults([]);

    try {
      const res = await fetch(`${BASE}/api/feed/from-selection`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ selected_text: selectedText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      setFeedKeywords(data.keywords ?? []);
      setFeedResults(data.articles ?? []);
      if (!data.articles?.length) setFeedError('No related articles found.');
    } catch (err: any) {
      setFeedError(err.message ?? 'Failed to fetch feed articles.');
    } finally {
      setFeedLoading(false);
    }
  }

  // ── render ────────────────────────────────────────────────────────────────

  if (!show) return null;

  const toolbar = (
    <div
      ref={toolbarRef}
      style={{
        position:  'fixed',
        left:       pos.x,
        top:        pos.y,
        transform: 'translate(-50%, -100%)',
        zIndex:    9999,
        pointerEvents: 'auto',
      }}
    >
      <AnimatePresence>
        <motion.div
          key="toolbar"
          initial={{ opacity: 0, scale: 0.85, y: 6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{    opacity: 0, scale: 0.85, y: 6 }}
          transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
        >
          {/* ── Main action row ──────────────────────────────────────── */}
          <div
            className="flex items-center gap-1 rounded-xl px-1.5 py-1.5"
            style={{
              background:     'rgba(8, 20, 48, 0.95)',
              backdropFilter: 'blur(20px) saturate(160%)',
              border:         '1px solid rgba(99, 179, 237, 0.28)',
              boxShadow:
                '0 12px 40px rgba(0,0,0,0.55), 0 0 24px rgba(99,179,237,0.12), inset 0 1px 0 rgba(255,255,255,0.08)',
            }}
          >
            {/* Diary */}
            <motion.button
              whileHover={{ scale: 1.06, backgroundColor: 'rgba(232, 184, 75, 0.18)' }}
              whileTap={{ scale: 0.94 }}
              onMouseDown={e => e.preventDefault()}
              onClick={() => {
                addToDiary({ text: selectedText, source, sourceType, field });
                setShow(false);
                setFeedOpen(false);
                window.getSelection()?.removeAllRanges();
              }}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 font-mono text-[9px] tracking-wider uppercase transition-colors"
              style={{
                color:      'hsl(var(--steami-gold))',
                border:     '1px solid rgba(232, 184, 75, 0.2)',
                background: 'rgba(232, 184, 75, 0.06)',
              }}
            >
              <BookOpen className="w-3 h-3" />
              Diary
            </motion.button>

            {/* Feed */}
            <motion.button
              whileHover={{ scale: 1.06, backgroundColor: 'rgba(111, 168, 255, 0.15)' }}
              whileTap={{ scale: 0.94 }}
              onMouseDown={e => e.preventDefault()}
              onClick={handleFeed}
              disabled={feedLoading}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 font-mono text-[9px] tracking-wider uppercase transition-colors disabled:opacity-60"
              style={{
                color:      'hsl(var(--steami-cyan))',
                border:     '1px solid rgba(111, 168, 255, 0.15)',
                background: feedOpen ? 'rgba(111, 168, 255, 0.12)' : 'rgba(111, 168, 255, 0.05)',
              }}
            >
              {feedLoading
                ? <Loader2 className="w-3 h-3 animate-spin" />
                : <Zap className="w-3 h-3" />
              }
              Feed
            </motion.button>

            {/* Copy */}
            <motion.button
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              onMouseDown={e => e.preventDefault()}
              onClick={async () => {
                await navigator.clipboard.writeText(selectedText);
                setCopied(true);
                setTimeout(() => { setCopied(false); setShow(false); setFeedOpen(false); }, 1200);
                window.getSelection()?.removeAllRanges();
              }}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 transition-colors"
              style={{
                color:      copied ? 'hsl(var(--steami-gold))' : 'rgba(255,255,255,0.35)',
                border:     '1px solid rgba(111, 168, 255, 0.15)',
                background: 'rgba(111, 168, 255, 0.05)',
              }}
            >
              {copied ? <Check className="w-3 h-3" /> : <Link2 className="w-3 h-3" />}
            </motion.button>

            {/* Dismiss */}
            <motion.button
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              onMouseDown={e => e.preventDefault()}
              onClick={() => { setShow(false); setFeedOpen(false); window.getSelection()?.removeAllRanges(); }}
              className="flex items-center rounded-lg px-1.5 py-2 transition-colors"
              style={{ color: 'rgba(255,255,255,0.2)' }}
            >
              <X className="w-3 h-3" />
            </motion.button>
          </div>

          {/* Arrow pointing down */}
          <div
            style={{
              width:        0,
              height:       0,
              borderLeft:   '6px solid transparent',
              borderRight:  '6px solid transparent',
              borderTop:    '6px solid rgba(8, 20, 48, 0.95)',
              margin:       '-1px auto 0',
            }}
          />

          {/* ── Feed results drawer ───────────────────────────────────── */}
          <AnimatePresence>
            {feedOpen && (
              <motion.div
                key="feed-drawer"
                initial={{ opacity: 0, y: -4, scaleY: 0.95 }}
                animate={{ opacity: 1, y: 0,   scaleY: 1 }}
                exit={{    opacity: 0, y: -4,   scaleY: 0.95 }}
                transition={{ duration: 0.2 }}
                style={{
                  background:     'rgba(6, 14, 34, 0.98)',
                  backdropFilter: 'blur(20px)',
                  border:         '1px solid rgba(99, 179, 237, 0.22)',
                  borderRadius:   12,
                  marginTop:      8,
                  width:          340,
                  maxHeight:      320,
                  overflowY:      'auto',
                  boxShadow:      '0 16px 48px rgba(0,0,0,0.6)',
                  transformOrigin:'top center',
                  scrollbarWidth: 'thin',
                }}
              >
                {/* Drawer header */}
                <div
                  style={{
                    padding:      '8px 12px',
                    borderBottom: '1px solid rgba(99,179,237,0.1)',
                    display:      'flex',
                    alignItems:   'center',
                    gap:          6,
                  }}
                >
                  <Zap style={{ width: 10, height: 10, color: 'hsl(var(--steami-cyan))' }} />
                  <span style={{
                    fontFamily:   'monospace',
                    fontSize:     9,
                    letterSpacing:'0.15em',
                    textTransform:'uppercase',
                    color:        'hsl(var(--steami-cyan))',
                  }}>
                    Related Feed
                  </span>
                  {feedKeywords.length > 0 && (
                    <span style={{
                      marginLeft:   'auto',
                      fontFamily:   'monospace',
                      fontSize:     8,
                      color:        'rgba(255,255,255,0.3)',
                    }}>
                      {feedKeywords.slice(0, 3).join(' · ')}
                    </span>
                  )}
                </div>

                {/* Loading */}
                {feedLoading && (
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:24, gap:8 }}>
                    <Loader2 style={{ width:14, height:14, color:'hsl(var(--steami-cyan))' }} className="animate-spin" />
                    <span style={{ fontFamily:'monospace', fontSize:10, color:'rgba(255,255,255,0.4)' }}>
                      Finding related articles…
                    </span>
                  </div>
                )}

                {/* Error */}
                {!feedLoading && feedError && (
                  <div style={{ padding:'12px 14px', fontFamily:'monospace', fontSize:10, color:'rgba(255,100,100,0.8)' }}>
                    {feedError}
                  </div>
                )}

                {/* Results */}
                {!feedLoading && feedResults.map((art) => {
                  const url = art.article_url ?? art.url ?? '';
                  return (
                    <motion.div
                      key={art.id}
                      whileHover={{ backgroundColor: 'rgba(99,179,237,0.06)' }}
                      style={{
                        display:       'flex',
                        gap:           10,
                        padding:       '10px 12px',
                        borderBottom:  '1px solid rgba(255,255,255,0.04)',
                        cursor:        url ? 'pointer' : 'default',
                      }}
                      onClick={() => url && window.open(url, '_blank')}
                    >
                      {/* Thumbnail */}
                      <div style={{
                        width:         40,
                        height:        34,
                        borderRadius:  6,
                        overflow:      'hidden',
                        background:    'rgba(99,179,237,0.08)',
                        flexShrink:    0,
                        display:       'flex',
                        alignItems:    'center',
                        justifyContent:'center',
                        fontSize:      14,
                      }}>
                        {art.image_url
                          ? <img src={art.image_url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}
                              onError={e => { (e.currentTarget as HTMLImageElement).style.display='none'; }} />
                          : '⚡'
                        }
                      </div>

                      {/* Text */}
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{
                          fontSize:     11,
                          fontWeight:   600,
                          color:        'rgba(255,255,255,0.88)',
                          lineHeight:   1.35,
                          marginBottom: 3,
                          overflow:     'hidden',
                          display:      '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient:'vertical',
                        }}>
                          {art.title}
                        </div>
                        {art.short_summary && (
                          <div style={{
                            fontFamily:  'monospace',
                            fontSize:    9,
                            color:       'rgba(255,255,255,0.35)',
                            lineHeight:  1.5,
                            overflow:    'hidden',
                            display:     '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient:'vertical',
                          }}>
                            {art.short_summary}
                          </div>
                        )}
                        <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:4 }}>
                          {art.source && (
                            <span style={{ fontFamily:'monospace', fontSize:8, color:'rgba(255,255,255,0.2)' }}>
                              {art.source}
                            </span>
                          )}
                          {url && (
                            <ExternalLink style={{ width:8, height:8, color:'rgba(99,179,237,0.5)', marginLeft:'auto' }} />
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  );

  // Portal to document.body so fixed positioning works correctly
  // even inside framer-motion transformed parents.
  return createPortal(toolbar, document.body);
}