/**
 * SidePanel — updated
 *
 * New prop: feedTabOpen (boolean) — when true, SidePanel switches to
 * the Feed tab automatically (triggered by clicking Feed in SelectionToolbar).
 *
 * InsightPopup renders at z-210 so it overlays everything including this panel.
 * The Feed tab cards now also show the inline insight popup from SidePanel context.
 */
import { useState, useCallback, useRef, useEffect } from "react";
import {
  Newspaper, Zap, MessageCircle,
  X, ExternalLink, Sparkles, Loader2, RefreshCw, Trash2,
} from "lucide-react";
import type { Article, AiInsight } from "../types";
import { apiGetInsight } from "../lib/api";
import type { FeedArticle } from "../lib/feed";
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
  feedOpenInsight: { article: FeedArticle; insight: AiInsight } | null;
  onFeedInsight: (a: FeedArticle) => void;
  onCloseFeedInsight: () => void;
  onRemoveFeed: (id: string) => void;
  hasPendingSelection: boolean;
  selectionKeywords: string[];

  // NEW: auto-open feed tab
  feedTabOpen: boolean;
  onFeedTabOpened: () => void;  // called after tab is opened so parent can reset
}

export default function SidePanel({
  articles, insightLoadingId, onInsight, onRefresh, refreshing,
  openInsight, onCloseInsight,
  feedArticles, feedLoading, feedError, feedInsightId,
  feedOpenInsight, onFeedInsight, onCloseFeedInsight, onRemoveFeed,
  hasPendingSelection, selectionKeywords,
  feedTabOpen, onFeedTabOpened,
}: Props) {
  const [tab,      setTab]      = useState<Tab>(null);
  const [chatOpen, setChatOpen] = useState(false);

  // Auto-open Feed tab when feedTabOpen becomes true
  useEffect(() => {
    if (feedTabOpen) {
      setTab("feed");
      onFeedTabOpened();
    }
  }, [feedTabOpen, onFeedTabOpened]);

  const isOpen = tab !== null;

  return (
    <>
      {/* ── Tab buttons — right edge, always visible ──────────────────── */}
      <div
        className="fixed right-0 top-1/2 -translate-y-1/2 z-[60] sm:flex-col flex-row hidden sm:flex"
        style={{ gap: 2 }}
      >
        {([
          { key: "articles" as const, Icon: Newspaper,    label: "Articles" },
          { key: "feed"     as const, Icon: Zap,           label: "Feed"     },
          { key: "chat"     as const, Icon: MessageCircle, label: "Chat"     },
        ]).map(({ key, Icon, label }) => {
          const badge = key === "feed" && feedArticles.length > 0;
          return (
            <button
              key={key}
              title={label}
              onClick={() => key === "chat" ? setChatOpen(true) : setTab(prev => prev === key ? null : key)}
              className={[
                "relative flex flex-col items-center justify-center gap-1",
                "w-12 py-4 rounded-l-xl select-none",
                "border border-white/10 shadow-2xl",
                "text-[9px] font-bold tracking-widest uppercase",
                "transition-all duration-200",
                tab === key
                  ? "bg-indigo-600 text-white border-indigo-500 shadow-indigo-500/30"
                  : "bg-[#080c18]/90 backdrop-blur-xl text-white/50 hover:bg-white/10 hover:text-white",
              ].join(" ")}
            >
              <Icon size={15} />
              <span className="hidden sm:block leading-none">{label}</span>
              {badge && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-indigo-500
                  text-white text-[8px] font-bold flex items-center justify-center">
                  {feedArticles.length > 9 ? "9+" : feedArticles.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Mobile bottom tab bar */}
      <div className="fixed bottom-0 left-0 right-0 z-[60] flex sm:hidden"
        style={{ gap: 1 }}>
        {([
          { key: "articles" as const, Icon: Newspaper,    label: "Articles" },
          { key: "feed"     as const, Icon: Zap,           label: "Feed"     },
          { key: "chat"     as const, Icon: MessageCircle, label: "Chat"     },
        ]).map(({ key, Icon, label }) => (
          <button
            key={key}
            onClick={() => key === "chat" ? setChatOpen(true) : setTab(prev => prev === key ? null : key)}
            className={[
              "flex-1 flex flex-col items-center justify-center gap-1 py-3",
              "text-[9px] font-bold tracking-widest uppercase border-t border-white/10",
              "transition-all duration-200",
              tab === key
                ? "bg-indigo-600 text-white border-indigo-500"
                : "bg-[#080c18]/95 text-white/50 hover:text-white",
            ].join(" ")}
          >
            <Icon size={15} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* ── Slide-in panel ────────────────────────────────────────────── */}
      <div
        className={[
          "fixed top-0 right-0 z-50",
          "flex flex-col",
          "border-l border-white/[0.08] shadow-2xl",
          "transition-[width,opacity] duration-300 ease-in-out overflow-hidden",
          "h-[calc(100%-56px)] sm:h-full",
        ].join(" ")}
        style={{
          width:         isOpen ? "clamp(300px, 42vw, 660px)" : 0,
          opacity:       isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          background:    "rgba(6,9,20,0.97)",
          backdropFilter:"blur(24px)",
          paddingRight:  0,
        }}
      >
        {/* On desktop, leave 48px right margin for the tab rail */}
        <div className="flex-1 flex flex-col min-h-0 sm:pr-12">
          {isOpen && (
            <>
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.07] shrink-0">
                <div className="flex items-center gap-2 flex-wrap">
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

              {/* ── ARTICLES TAB ─────────────────────────────────────── */}
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

              {/* ── FEED TAB ─────────────────────────────────────────── */}
              {tab === "feed" && (
                <div className="flex-1 overflow-y-auto overscroll-contain">
                  {feedLoading ? (
                    <Spinner text="Searching related articles…" />
                  ) : feedError ? (
                    <div className="px-4 py-4 space-y-2">
                      <p className="text-red-400 text-xs leading-relaxed">{feedError}</p>
                      <p className="text-white/20 text-[10px]">
                        Select text in an article and click ⚡ Feed to search.
                      </p>
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

      {/* Insight popups — z-210 so they overlay everything */}
      {openInsight && (
        <InsightPopup
          article={openInsight.article}
          insight={openInsight.insight}
          onClose={onCloseInsight}
        />
      )}
      {feedOpenInsight && (
        <InsightPopup
          article={feedOpenInsight.article as any}
          insight={feedOpenInsight.insight}
          onClose={onCloseFeedInsight}
        />
      )}

      {/* Chat popup */}
      {chatOpen && <ChatPopup onClose={() => setChatOpen(false)} />}
    </>
  );
}

// ── ArticleCard ───────────────────────────────────────────────────────────────
function ArticleCard({ article: a, insightLoading, onInsight }: {
  article: Article; insightLoading: boolean; onInsight: () => void;
}) {
  const raw    = a.short_summary ?? a.content ?? a.description ?? "";
  const blurb  = raw.split(/\s+/).slice(0, 35).join(" ") + (raw.split(/\s+/).length > 35 ? "…" : "");
  const domain  = a.matched_domains?.[0] ?? a.topic ?? "";
  const dateStr = a.published_at
    ? new Date(a.published_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })
    : "";
  const hasInsight = !!(a.has_insight || a.ai_insight);
  const readUrl    = a.article_url ?? a.url ?? "";

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

// ── FeedCard ──────────────────────────────────────────────────────────────────
function FeedCard({ article: a, insightLoading, onInsight, onRemove }: {
  article: FeedArticle; insightLoading: boolean; onInsight: () => void; onRemove: () => void;
}) {
  const blurb   = (a.short_summary ?? "").split(/\s+/).slice(0, 35).join(" ");
  const domain  = a.matched_domains?.[0] ?? "";
  const dateStr = a.published_at
    ? new Date(a.published_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })
    : "";
  const hasInsight = !!(a.has_insight || a.ai_insight);
  const readUrl    = a.article_url ?? a.url ?? "";

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
              {hasInsight ? "View" : "AI Insight"}
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