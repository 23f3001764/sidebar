/**
 * InsightPopup — horizontal rectangle layout
 *
 * Layout: wide landscape card (max-w-[900px]) split into two columns:
 *   LEFT  (380px) — SVG visualisation
 *   RIGHT (flex-1) — title, summary, key points, tags, footer
 *
 * On mobile: stacks vertically (SVG top, content bottom).
 *
 * Share link: sets ?insight=<articleId> in URL on mount so window.location.href
 * is always shareable before the user even clicks Share.
 */
import { useEffect, useState } from "react";
import {
  X, ExternalLink, Clock, TrendingUp, TrendingDown, Minus,
  Tag, Share2, Copy, Check,
} from "lucide-react";
import type { AiInsight } from "../types";
import { setDeepLinkParam, clearDeepLinkParam } from "../hooks/useDeepLink";
import { dashboard } from "../lib/api";

interface ArticleLike {
  id?: string;
  title: string;
  source?: string;
  published_at?: string;
  article_url?: string;
  url?: string;
  matched_domains?: string[];
}

interface Props {
  article: ArticleLike;
  insight: AiInsight;
  onClose: () => void;
}

const SHARE_APPS = [
  {
    name: "WhatsApp",  color: "#25D366",
    icon: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>`,
    url: (u: string, t: string) => `https://wa.me/?text=${encodeURIComponent(t + "\n" + u)}`,
  },
  {
    name: "Telegram",  color: "#2AABEE",
    icon: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>`,
    url: (u: string, t: string) => `https://t.me/share/url?url=${encodeURIComponent(u)}&text=${encodeURIComponent(t)}`,
  },
  {
    name: "Reddit",    color: "#FF4500",
    icon: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/></svg>`,
    url: (u: string, t: string) => `https://reddit.com/submit?url=${encodeURIComponent(u)}&title=${encodeURIComponent(t)}`,
  },
  {
    name: "LinkedIn",  color: "#0A66C2",
    icon: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`,
    url: (u: string) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(u)}`,
  },
  {
    name: "Instagram", color: "#E1306C",
    icon: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>`,
    url: (_u: string) => `https://www.instagram.com/`,
  },
] as const;

export default function InsightPopup({ article, insight, onClose }: Props) {
  const [shareOpen, setShareOpen] = useState(false);
  const [copied,    setCopied]    = useState(false);

  const articleId = article.id ?? "";

  // Set ?insight= in URL immediately so the page is shareable as soon as popup opens
  useEffect(() => {
    if (articleId) {
      setDeepLinkParam("insight", articleId);
      dashboard.event("ai_insight", articleId, article.title);
    }
    return () => { if (articleId) clearDeepLinkParam("insight"); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articleId]);

  // Close on Escape
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  const svg    = insight.svg ?? "";
  const hasSvg = svg.trimStart().toLowerCase().startsWith("<svg");
  const svgUri = hasSvg
    ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
    : null;

  const readUrl  = insight.article_url || article.article_url || article.url || "";
  const shareUrl = window.location.href; // already has ?insight= set above

  const sentimentMap = {
    positive: { icon: <TrendingUp  size={11} />, color: "text-emerald-400" },
    negative: { icon: <TrendingDown size={11} />, color: "text-red-400"     },
    neutral:  { icon: <Minus        size={11} />, color: "text-amber-400"   },
  };
  const senti = sentimentMap[insight.sentiment ?? "neutral"] ?? sentimentMap.neutral;

  function handleCopy() {
    navigator.clipboard.writeText(shareUrl).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 flex items-center justify-center p-3 sm:p-6"
      style={{ background: "rgba(2,4,12,0.82)", backdropFilter: "blur(14px)", zIndex: 210 }}
      onClick={onClose}
    >
      {/*
        ── Horizontal glass card ────────────────────────────────────────────
        max-w-[900px] wide, fixed height on desktop, scrollable on mobile.
        Two-column on desktop: SVG left (360px fixed) + content right (flex-1).
      */}
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full flex flex-col sm:flex-row overflow-hidden rounded-2xl shadow-2xl"
        style={{
          maxWidth:      900,
          maxHeight:     "88vh",
          background:    "rgba(8,12,24,0.97)",
          backdropFilter:"blur(32px)",
          border:        "1px solid rgba(255,255,255,0.09)",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── LEFT: SVG visualisation ────────────────────────────────────
            Desktop: 360px fixed width, full height.
            Mobile: full width, max 220px height.
        ──────────────────────────────────────────────────────────────── */}
        <div
          className="flex items-center justify-center overflow-hidden shrink-0"
          style={{
            background:   "rgba(99,102,241,0.06)",
            borderRight:  "1px solid rgba(255,255,255,0.07)",
            // Desktop: fixed column width
            width:        hasSvg ? undefined : 0,
          }}
        >
          {hasSvg ? (
            <div
              className="w-full sm:w-[360px] flex items-center justify-center"
              style={{ minHeight: 220 }}
            >
              {svgUri ? (
                <img
                  src={svgUri}
                  alt="AI visualisation"
                  className="w-full h-full object-contain"
                  style={{ maxWidth: 360, maxHeight: 420 }}
                  onError={e => {
                    const img  = e.currentTarget as HTMLImageElement;
                    const wrap = img.parentElement!;
                    img.remove();
                    const div = document.createElement("div");
                    div.style.cssText = "width:100%;height:100%;overflow:hidden;display:flex;align-items:center;justify-content:center;";
                    div.innerHTML = svg;
                    wrap.appendChild(div);
                  }}
                />
              ) : (
                <div
                  className="flex items-center justify-center"
                  style={{ maxWidth: 360, maxHeight: 420, overflow: "hidden" }}
                  dangerouslySetInnerHTML={{ __html: svg }}
                />
              )}
            </div>
          ) : null}
        </div>

        {/* ── RIGHT: content ─────────────────────────────────────────────
            Scrollable column.
        ──────────────────────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
          {/* Header bar */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.07] shrink-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-indigo-400">
                ✦ AI Insight
              </span>
              {insight.domain && (
                <span className="px-2 py-0.5 rounded-full bg-indigo-600/25 text-indigo-300 text-[10px] font-semibold">
                  {insight.domain}
                </span>
              )}
              <span className={`flex items-center gap-1 text-[10px] font-semibold ${senti.color}`}>
                {senti.icon}{insight.sentiment}
              </span>
              {insight.reading_time_min != null && (
                <span className="flex items-center gap-1 text-white/25 text-[10px]">
                  <Clock size={9} />{insight.reading_time_min} min
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Copy link */}
              <button
                onClick={handleCopy}
                title="Copy shareable link"
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-semibold
                  bg-white/[0.07] hover:bg-white/15 text-white/50 hover:text-white transition-colors"
              >
                {copied
                  ? <><Check size={11} className="text-emerald-400" /> Copied!</>
                  : <><Copy size={11} /> Copy Link</>
                }
              </button>

              {/* Social share */}
              <div className="relative">
                <button
                  onClick={() => setShareOpen(o => !o)}
                  className="p-1.5 rounded-lg bg-white/[0.07] hover:bg-white/15
                    text-white/50 hover:text-white transition-colors"
                  title="Share"
                >
                  <Share2 size={13} />
                </button>
                {shareOpen && (
                  <div
                    className="absolute right-0 top-9 z-10 flex flex-col gap-0.5 p-1.5 rounded-xl shadow-2xl"
                    style={{
                      background:    "rgba(8,12,24,0.99)",
                      border:        "1px solid rgba(255,255,255,0.12)",
                      backdropFilter:"blur(20px)",
                      minWidth:      148,
                    }}
                    onClick={e => e.stopPropagation()}
                  >
                    {SHARE_APPS.map(app => (
                      <a
                        key={app.name}
                        href={app.url(shareUrl, `${article.title} — STEAMI AI Insight`)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => {
                          if (app.name === "Instagram") navigator.clipboard.writeText(shareUrl).catch(() => {});
                          setShareOpen(false);
                        }}
                        className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg
                          hover:bg-white/[0.08] transition-colors no-underline"
                      >
                        <span className="w-4 h-4 shrink-0" style={{ color: app.color }}
                          dangerouslySetInnerHTML={{ __html: app.icon }} />
                        <span className="text-white/70 text-[11px] font-medium">{app.name}</span>
                        {app.name === "Instagram" && <span className="text-white/25 text-[9px]">(copy)</span>}
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* Close */}
              <button onClick={onClose} aria-label="Close"
                className="p-1.5 rounded-lg bg-white/[0.07] hover:bg-white/20
                  text-white/50 hover:text-white transition-colors">
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 px-5 py-4 space-y-3 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
            {/* Title */}
            <h3 className="text-white font-bold text-[16px] leading-snug">
              {article.title}
            </h3>

            {/* Confidence */}
            {insight.confidence != null && (
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1 rounded-full bg-white/[0.07] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-indigo-500"
                    style={{ width: `${Math.round(insight.confidence * 100)}%` }}
                  />
                </div>
                <span className="text-white/30 text-[9px] shrink-0">
                  {Math.round(insight.confidence * 100)}% confidence
                </span>
              </div>
            )}

            {/* Summary */}
            <p className="text-white/70 text-[13px] leading-[1.75]">
              {insight.summary}
            </p>

            {/* Key points */}
            {Array.isArray(insight.key_points) && insight.key_points.length > 0 && (
              <div>
                <p className="text-white/25 text-[9px] font-bold uppercase tracking-[0.18em] mb-2">
                  Key Points
                </p>
                <ul className="space-y-1.5">
                  {insight.key_points.map((pt, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-indigo-400 text-xs mt-0.5 shrink-0">›</span>
                      <span className="text-white/60 text-[12px] leading-relaxed">{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tags */}
            {Array.isArray(insight.tags) && insight.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <Tag size={9} className="text-white/15 shrink-0" />
                {insight.tags.map(tag => (
                  <span key={tag}
                    className="px-2 py-0.5 rounded-full bg-white/[0.07] text-white/35 text-[10px]">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.07] shrink-0">
            <div className="flex items-center gap-1.5 text-white/20 text-[10px]">
              {article.source && <span>{article.source}</span>}
              {article.published_at && (
                <span>· {new Date(article.published_at).toLocaleDateString("en-GB", {
                  day: "numeric", month: "short", year: "numeric",
                })}</span>
              )}
            </div>
            {readUrl && (
              <a href={readUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300
                  text-[11px] font-medium transition-colors">
                Read article <ExternalLink size={10} />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
