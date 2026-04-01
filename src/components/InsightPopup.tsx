/**
 * InsightPopup
 *
 * CRITICAL SVG NOTE:
 * The backend (gemini_client.py) generates SVG with SINGLE-QUOTED attributes
 * (e.g. width='400') to survive JSON serialisation.
 * Both rendering strategies below handle this correctly:
 *   • Strategy A: data:image/svg+xml → <img>   (preferred, sandboxed)
 *   • Strategy B: dangerouslySetInnerHTML       (fallback if img fails)
 * Single-quoted SVG is valid XML so browsers render both identically.
 */
import { useEffect } from "react";
import { X, ExternalLink, Clock, TrendingUp, TrendingDown, Minus, Tag } from "lucide-react";
import type { Article, AiInsight } from "../types";

interface Props {
  article: Article;
  insight: AiInsight;
  onClose: () => void;
}

export default function InsightPopup({ article, insight, onClose }: Props) {
  // Close on Escape
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  const svg = insight.svg ?? "";
  const hasSvg = svg.trimStart().startsWith("<svg") || svg.trimStart().startsWith("<SVG");

  // data-uri: encodeURIComponent handles both single and double quoted SVG attrs
  const svgUri = hasSvg
    ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
    : null;

  const sentimentMap = {
    positive: { icon: <TrendingUp  size={11} />, color: "text-emerald-400" },
    negative: { icon: <TrendingDown size={11} />, color: "text-red-400" },
    neutral:  { icon: <Minus        size={11} />, color: "text-amber-400" },
  };
  const senti = sentimentMap[insight.sentiment ?? "neutral"] ?? sentimentMap.neutral;

  // Resolved read URL — backend always sets article_url
  const readUrl =
    insight.article_url ||
    article.article_url ||
    article.url ||
    "";

  return (
    /* ── Backdrop ───────────────────────────────────────────────────────── */
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      style={{ background: "rgba(2,4,12,0.82)", backdropFilter: "blur(14px)" }}
      onClick={onClose}
    >
      {/* ── Glass card ─────────────────────────────────────────────────── */}
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-[520px] rounded-2xl overflow-hidden shadow-2xl"
        style={{
          background:    "rgba(8,12,24,0.97)",
          backdropFilter:"blur(32px)",
          border:        "1px solid rgba(255,255,255,0.09)",
          maxHeight:     "90vh",
          overflowY:     "auto",
          scrollbarWidth:"thin",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3.5 right-3.5 z-20 p-1.5 rounded-full
            bg-white/[0.09] hover:bg-white/20 text-white/70 hover:text-white transition-colors"
        >
          <X size={14} />
        </button>

        {/* ── SVG visualisation ─────────────────────────────────────────── */}
        {hasSvg && (
          <div
            className="w-full flex items-center justify-center overflow-hidden"
            style={{
              background:   "rgba(99,102,241,0.04)",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              minHeight:    160,
            }}
          >
            {svgUri ? (
              /*
               * Strategy A — img with data-uri
               * Works for both single-quoted and double-quoted SVG attrs.
               * onError falls back to Strategy B.
               */
              <img
                src={svgUri}
                alt="AI visualisation"
                width={400}
                height={400}
                className="max-w-full"
                style={{ maxHeight: 340, display: "block" }}
                onError={e => {
                  const img = e.currentTarget as HTMLImageElement;
                  const wrap = img.parentElement!;
                  img.remove();
                  // Strategy B — inline render
                  const div = document.createElement("div");
                  div.style.maxWidth  = "100%";
                  div.style.maxHeight = "340px";
                  div.style.overflow  = "hidden";
                  div.innerHTML = svg;
                  wrap.appendChild(div);
                }}
              />
            ) : (
              /* Strategy B direct (no data-uri available) */
              <div
                className="max-w-full overflow-hidden"
                style={{ maxHeight: 340 }}
                dangerouslySetInnerHTML={{ __html: svg }}
              />
            )}
          </div>
        )}

        {/* ── Content ────────────────────────────────────────────────────── */}
        <div className="px-6 py-5">

          {/* Badge row */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-indigo-400">
              ✦ AI Insight
            </span>

            {insight.domain && (
              <span className="px-2 py-0.5 rounded-full bg-indigo-600/25 text-indigo-300 text-[10px] font-semibold">
                {insight.domain}
              </span>
            )}

            <span className={`flex items-center gap-1 text-[10px] font-semibold ${senti.color}`}>
              {senti.icon}
              {insight.sentiment}
            </span>

            {insight.reading_time_min != null && (
              <span className="flex items-center gap-1 text-white/25 text-[10px]">
                <Clock size={9} />
                {insight.reading_time_min} min read
              </span>
            )}

            {insight.confidence != null && (
              <span className="text-white/20 text-[10px]">
                {Math.round(insight.confidence * 100)}% confidence
              </span>
            )}
          </div>

          {/* Article title */}
          <h3 className="text-white font-bold text-[15px] leading-snug mb-3">
            {article.title}
          </h3>

          {/* Summary — the real output from Gemini */}
          <p className="text-white/72 text-[13px] leading-[1.7] mb-4">
            {insight.summary}
          </p>

          {/* Key points */}
          {Array.isArray(insight.key_points) && insight.key_points.length > 0 && (
            <div className="mb-4">
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
            <div className="flex flex-wrap items-center gap-1.5 mb-4">
              <Tag size={9} className="text-white/15 shrink-0" />
              {insight.tags.map(tag => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-full bg-white/[0.07] text-white/35 text-[10px]"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-white/[0.07]">
            <div className="flex items-center gap-1.5 text-white/20 text-[10px]">
              <span>{article.source}</span>
              {article.published_at && (
                <>
                  <span>·</span>
                  <span>
                    {new Date(article.published_at).toLocaleDateString("en-GB", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </span>
                </>
              )}
            </div>

            {readUrl && (
              <a
                href={readUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300
                  text-[11px] font-medium transition-colors"
              >
                Read article <ExternalLink size={10} />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}