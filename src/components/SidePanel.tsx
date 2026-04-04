/**
 * SidePanel — updated
 *
 * Changes from previous version:
 *  • "From Source" tab REMOVED
 *  • "Feed" tab ADDED (shows articles from text selection)
 *  • Feed tab shows prompt when no selection made yet
 *  • Mobile responsive: full-screen on small screens, overlay on desktop
 *  • Tab buttons stack correctly on mobile
 */
import { useState, useCallback, useRef } from "react";
import {
  Newspaper, Zap, MessageCircle,
  X, ExternalLink, Sparkles, Loader2, RefreshCw, Trash2,
} from "lucide-react";
import type { Article, AiInsight } from "../types";
import { apiGetInsight } from "../lib/api";
import type { FeedArticle } from "../lib/feed";
import type { AiInsight as FeedAiInsight } from "../types";
import InsightPopup from "./InsightPopup";
import ChatPopup from "./ChatPopup";

type Tab = "articles" | "feed" | null;

interface Props {
  // Articles tab
  articles: Article[];
  insightLoadingId: string | null;
  onInsight: (a: Article) => void;
  onRefresh: () => void;
  refreshing: boolean;
  openInsight: { article: Article; insight: AiInsight } | null;
  onCloseInsight: () => void;

  // Feed tab
  feedArticles: FeedArticle[];
  feedLoading: boolean;
  feedError: string;
  feedInsightId: string | null;
  feedOpenInsight: { article: FeedArticle; insight: FeedAiInsight } | null;
  onFeedInsight: (a: FeedArticle) => void;
  onCloseFeedInsight: () => void;
  onRemoveFeed: (id: string) => void;
  hasPendingSelection: boolean;   // true when user has selected text
  selectionKeywords: string[];
}

export default function SidePanel({
  articles, insightLoadingId, onInsight, onRefresh, refreshing,
  openInsight, onCloseInsight,
  feedArticles, feedLoading, feedError, feedInsightId,
  feedOpenInsight, onFeedInsight, onCloseFeedInsight, onRemoveFeed,
  hasPendingSelection, selectionKeywords,
}: Props) {
  const [tab,      setTab]      = useState<Tab>(null);
  const [chatOpen, setChatOpen] = useState(false);

  const isOpen = tab !== null;

  // On mobile we show full-width; on desktop clamp to 42vw
  const panelWidth = "min(100vw, clamp(300px, 42vw, 660px))";

  // When Feed tab clicked and panel is already open on feed — keep open
  function clickTab(t: Tab) {
    setTab(prev => prev === t ? null : t);
  }

  const tabs = [
    { key: "articles" as const, Icon: Newspaper,    label: "Articles" },
    { key: "feed"     as const, Icon: Zap,           label: "Feed"     },
    { key: "chat"     as const, Icon: MessageCircle, label: "Chat"     },
  ];

  return (
    <>
      {/* ── Tab buttons ──────────────────────────────────────────────────── */}
      {/* Desktop: fixed right rail. Mobile: fixed bottom bar */}
      <div className={[
        "fixed z-[60]",
        // Desktop
        "sm:right-0 sm:top-1/2 sm:-translate-y-1/2 sm:flex-col sm:bottom-auto sm:left-auto",
        // Mobile: full-width bottom bar
        "bottom-0 left-0 right-0 flex-row sm:w-auto w-full",
        "flex",
      ].join(" ")} style={{ gap: 2 }}>
        {tabs.map(({ key, Icon, label }) => {
          const isActive = tab === key;
          const hasBadge = key === "feed" && feedArticles.length > 0;
          return (
            <button
              key={key}
              title={label}
              onClick={() => key === "chat" ? setChatOpen(true) : clickTab(key)}
              className={[
                // Shared
                "flex items-center justify-center gap-1 font-bold select-none",
                "text-[10px] uppercase tracking-widest transition-all duration-200",
                "border relative",
                // Desktop shape
                "sm:flex-col sm:w-12 sm:py-4 sm:rounded-l-xl",
                // Mobile shape (equal thirds of the bottom bar)
                "flex-1 py-3 rounded-none sm:flex-none",
                isActive
                  ? "bg-indigo-600 text-white border-indigo-500 shadow-indigo-500/30 shadow-lg"
                  : "bg-[#080c18]/90 backdrop-blur-xl text-white/50 border-white/10 hover:bg-white/10 hover:text-white",
              ].join(" ")}
            >
              <Icon size={16} />
              <span className="hidden sm:block leading-none">{label}</span>
              <span className="sm:hidden text-[9px]">{label}</span>
              {/* Feed badge */}
              {hasBadge && (
                <span className="absolute -top-1 -right-1 sm:top-1 sm:right-1
                  w-4 h-4 rounded-full bg-indigo-500 text-white text-[8px]
                  font-bold flex items-center justify-center">
                  {feedArticles.length > 9 ? "9+" : feedArticles.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Slide-in panel ────────────────────────────────────────────────── */}
      <div
        className={[
          "fixed top-0 right-0 z-50",
          "flex flex-col",
          "border-l border-white/[0.08] shadow-2xl",
          "transition-[width,opacity] duration-300 ease-in-out overflow-hidden",
          // On mobile, push up to leave room for bottom tab bar (56px)
          "sm:h-full",
          isOpen ? "h-[calc(100%-56px)]" : "h-full",
        ].join(" ")}
        style={{
          width:         isOpen ? panelWidth : 0,
          opacity:       isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          background:    "rgba(6,9,20,0.97)",
          backdropFilter:"blur(24px)",
          // On desktop leave 48px for tab buttons; on mobile 0 (tabs are bottom bar)
          paddingRight:  0,
        }}
      >
        {/* Compensate for desktop tab rail */}
        <div className="flex-1 flex flex-col min-h-0 sm:pr-12">
          {isOpen && (
            <>
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.07] shrink-0">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                  <span className="text-white font-bold text-[11px] uppercase tracking-[0.18em]">
                    {tab === "articles" ? "Intelligence Feed" : "Smart Feed"}
                  </span>
                  {tab === "articles" && articles.length > 0 && (
                    <span className="text-white/20 text-[10px]">{articles.length}</span>
                  )}
                  {tab === "feed" && selectionKeywords.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                      {selectionKeywords.slice(0, 3).map(kw => (
                        <span key={kw} className="px-1.5 py-0.5 rounded-full
                          bg-indigo-600/25 text-indigo-300 text-[9px] font-semibold">
                          {kw}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {tab === "articles" && (
                    <button onClick={onRefresh} disabled={refreshing}
                      className="flex items-center gap-1 text-[10px] text-indigo-400
                        hover:text-indigo-300 disabled:opacity-40 transition-colors">
                      <RefreshCw size={11} className={refreshing ? "animate-spin" : ""} />
                      {refreshing ? "Refreshing…" : "Refresh"}
                    </button>
                  )}
                  <button onClick={() => setTab(null)}
                    className="p-1 rounded-md text-white/30 hover:text-white hover:bg-white/10">
                    <X size={15} />
                  </button>
                </div>
              </div>

              {/* ── ARTICLES TAB ─────────────────────────────────────────── */}
              {tab === "articles" && (
                <div className="flex-1 overflow-y-auto overscroll-contain">
                  {articles.length === 0 ? (
                    <Empty text={refreshing ? "Fetching…" : "No articles yet. Click Refresh."} />
                  ) : (
                    <ul className="divide-y divide-white/[0.04]">
                      {articles.map(a => (
                        <ArticleCard key={a.id} article={a}
                          insightLoading={insightLoadingId === a.id}
                          onInsight={() => onInsight(a)} />
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* ── FEED TAB ─────────────────────────────────────────────── */}
              {tab === "feed" && (
                <div className="flex-1 overflow-y-auto overscroll-contain">
                  {feedLoading ? (
                    <Spinner text="Searching related articles…" />
                  ) : feedError ? (
                    <div className="px-4 py-4">
                      <p className="text-red-400 text-xs">{feedError}</p>
                    </div>
                  ) : feedArticles.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-4 px-6 text-center py-12">
                      <span className="text-4xl">✍️</span>
                      <p className="text-white/35 text-sm leading-relaxed">
                        Select any text on the page and click the{" "}
                        <span className="text-indigo-400 font-semibold">⚡ Feed</span>{" "}
                        button to find related articles.
                      </p>
                    </div>
                  ) : (
                    <ul className="divide-y divide-white/[0.04]">
                      {feedArticles.map(a => (
                        <FeedCard key={a.id} article={a}
                          insightLoading={feedInsightId === a.id}
                          onInsight={() => onFeedInsight(a)}
                          onRemove={() => onRemoveFeed(a.id)} />
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Insight popups */}
      {openInsight && (
        <InsightPopup article={openInsight.article} insight={openInsight.insight}
          onClose={onCloseInsight} />
      )}
      {feedOpenInsight && (
        <InsightPopup article={feedOpenInsight.article as any}
          insight={feedOpenInsight.insight} onClose={onCloseFeedInsight} />
      )}

      {/* Chat popup */}
      {chatOpen && <ChatPopup onClose={() => setChatOpen(false)} />}
    </>
  );
}

// ── Article card (main articles tab) ─────────────────────────────────────────
function ArticleCard({ article: a, insightLoading, onInsight }: {
  article: Article; insightLoading: boolean; onInsight: () => void;
}) {
  const raw    = a.short_summary ?? a.content ?? a.description ?? "";
  const blurb  = raw.split(/\s+/).slice(0, 35).join(" ").replace(/[,;:]?\s*$/, "") +
    (raw.split(/\s+/).length > 35 ? "…" : "");
  const domain  = a.matched_domains?.[0] ?? a.topic ?? "";
  const dateStr = a.published_at
    ? new Date(a.published_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })
    : "";
  const hasInsight = !!(a.has_insight || a.ai_insight);
  const readUrl = a.article_url ?? a.url ?? "";

  return (
    <li className="group flex gap-3 px-4 py-3.5 hover:bg-white/[0.025] transition-colors">
      <div className="shrink-0 w-[72px] h-[56px] rounded-lg overflow-hidden bg-white/[0.04]">
        {a.image_url ? (
          <img src={a.image_url} alt="" loading="lazy"
            className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity"
            onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/10 text-lg">📰</div>
        )}
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-between gap-1">
        <div>
          {domain && <p className="text-[9px] font-bold tracking-widest uppercase text-indigo-400 mb-0.5">{domain}</p>}
          <p className="text-white text-[11px] font-semibold leading-snug line-clamp-2">{a.title}</p>
          {blurb && <p className="text-white/38 text-[10px] leading-relaxed line-clamp-2 mt-0.5">{blurb}</p>}
        </div>
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-1.5">
            {a.source && <span className="text-white/18 text-[9px]">{a.source}</span>}
            {dateStr  && <span className="text-white/18 text-[9px]">· {dateStr}</span>}
            {readUrl  && (
              <a href={readUrl} target="_blank" rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                className="text-white/18 hover:text-white/60 transition-colors">
                <ExternalLink size={9} />
              </a>
            )}
          </div>
          <button onClick={onInsight} disabled={insightLoading}
            className={["flex items-center gap-1 px-2 py-1 rounded-md text-[9px] font-bold",
              "uppercase tracking-wide transition-all shrink-0 disabled:opacity-50",
              hasInsight
                ? "bg-indigo-600/45 hover:bg-indigo-500/70 text-indigo-200"
                : "bg-white/[0.07] hover:bg-indigo-600/55 text-white/55 hover:text-white",
            ].join(" ")}>
            {insightLoading ? <Loader2 size={9} className="animate-spin" /> : <Sparkles size={9} />}
            {hasInsight ? "View Insight" : "AI Insight"}
          </button>
        </div>
      </div>
    </li>
  );
}

// ── Feed card (selection-based feed tab) ──────────────────────────────────────
function FeedCard({ article: a, insightLoading, onInsight, onRemove }: {
  article: FeedArticle; insightLoading: boolean; onInsight: () => void; onRemove: () => void;
}) {
  const blurb  = (a.short_summary ?? "").split(/\s+/).slice(0, 35).join(" ");
  const domain  = a.matched_domains?.[0] ?? "";
  const dateStr = a.published_at
    ? new Date(a.published_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })
    : "";
  const hasInsight = !!(a.has_insight || a.ai_insight);
  const readUrl = a.article_url ?? a.url ?? "";

  return (
    <li className="group flex gap-3 px-4 py-3.5 hover:bg-white/[0.025] transition-colors">
      <div className="shrink-0 w-[72px] h-[56px] rounded-lg overflow-hidden bg-white/[0.04]">
        {a.image_url ? (
          <img src={a.image_url} alt="" loading="lazy"
            className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity"
            onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/10 text-lg">⚡</div>
        )}
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-between gap-1">
        <div>
          {domain && <p className="text-[9px] font-bold tracking-widest uppercase text-indigo-400 mb-0.5">{domain}</p>}
          <p className="text-white text-[11px] font-semibold leading-snug line-clamp-2">{a.title}</p>
          {blurb && <p className="text-white/38 text-[10px] leading-relaxed line-clamp-2 mt-0.5">{blurb}</p>}
        </div>
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-1.5">
            {a.source && <span className="text-white/18 text-[9px]">{a.source}</span>}
            {dateStr  && <span className="text-white/18 text-[9px]">· {dateStr}</span>}
            {readUrl  && (
              <a href={readUrl} target="_blank" rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                className="text-white/18 hover:text-white/60 transition-colors">
                <ExternalLink size={9} />
              </a>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button onClick={onRemove}
              className="p-1 rounded text-white/20 hover:text-red-400 transition-colors">
              <Trash2 size={9} />
            </button>
            <button onClick={onInsight} disabled={insightLoading}
              className={["flex items-center gap-1 px-2 py-1 rounded-md text-[9px] font-bold",
                "uppercase tracking-wide transition-all shrink-0 disabled:opacity-50",
                hasInsight
                  ? "bg-indigo-600/45 hover:bg-indigo-500/70 text-indigo-200"
                  : "bg-white/[0.07] hover:bg-indigo-600/55 text-white/55 hover:text-white",
              ].join(" ")}>
              {insightLoading ? <Loader2 size={9} className="animate-spin" /> : <Sparkles size={9} />}
              {hasInsight ? "View Insight" : "AI Insight"}
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="flex items-center justify-center h-48 text-white/18 text-xs text-center px-6">{text}</div>;
}
function Spinner({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-48 gap-2 text-white/22">
      <Loader2 size={16} className="animate-spin" />
      <span className="text-xs">{text}</span>
    </div>
  );
}