import { useState, useCallback, useRef } from "react";
import {
  Newspaper, Link2, MessageCircle, X,
  ExternalLink, Sparkles, Loader2, RefreshCw, ArrowRight,
} from "lucide-react";
import type { Article, AiInsight } from "../types";
import { apiFetchSource, apiGetInsight } from "../lib/api";
import InsightPopup from "./InsightPopup";
import ChatPopup from "./ChatPopup";

type Tab = "articles" | "source" | null;

interface Props {
  articles: Article[];
  insightLoadingId: string | null;
  onInsight: (a: Article) => void;
  onRefresh: () => void;
  refreshing: boolean;
  openInsight: { article: Article; insight: AiInsight } | null;
  onCloseInsight: () => void;
}

const SESSION_KEY = "steami_source_url";

export default function SidePanel({
  articles,
  insightLoadingId,
  onInsight,
  onRefresh,
  refreshing,
  openInsight,
  onCloseInsight,
}: Props) {
  const [tab,      setTab]      = useState<Tab>(null);
  const [chatOpen, setChatOpen] = useState(false);

  // Source tab
  const [srcInput,   setSrcInput]   = useState(() => sessionStorage.getItem(SESSION_KEY) ?? "");
  const [srcArts,    setSrcArts]    = useState<Article[]>([]);
  const [srcLoading, setSrcLoading] = useState(false);
  const [srcErr,     setSrcErr]     = useState("");
  const [srcInsightId,   setSrcInsightId]   = useState<string | null>(null);
  const srcCache = useRef<Record<string, AiInsight>>({});
  const [srcPopup, setSrcPopup] = useState<{ article: Article; insight: AiInsight } | null>(null);

  const isOpen = tab !== null;

  function clickTab(t: Tab) {
    setTab(prev => prev === t ? null : t);
  }

  async function handleFetchSource() {
    if (!srcInput.trim()) { setSrcErr("Enter a URL first."); return; }
    setSrcErr("");
    setSrcLoading(true);
    sessionStorage.setItem(SESSION_KEY, srcInput.trim());
    try {
      const res = await apiFetchSource(srcInput.trim(), 20);
      setSrcArts(res.articles ?? []);
    } catch (e: any) {
      setSrcErr(e.message);
    } finally {
      setSrcLoading(false);
    }
  }

  const handleSrcInsight = useCallback(async (article: Article) => {
    if (srcCache.current[article.id]) {
      setSrcPopup({ article, insight: srcCache.current[article.id] });
      return;
    }
    setSrcInsightId(article.id);
    setSrcErr("");
    try {
      const resp = await apiGetInsight(article.id);
      srcCache.current[article.id] = resp.ai_insight;
      setSrcArts(prev => prev.map(a =>
        a.id === article.id ? { ...a, ai_insight: resp.ai_insight, has_insight: true } : a
      ));
      setSrcPopup({ article, insight: resp.ai_insight });
    } catch (e: any) {
      setSrcErr(e.message);
    } finally {
      setSrcInsightId(null);
    }
  }, []);

  return (
    <>
      {/* ─────────────────────────────────────────────────────────────────────
          Tab buttons — FIXED to the RIGHT EDGE, always above everything
          z-[60] so they're above the panel (z-50) but below popups (z-70+)
      ───────────────────────────────────────────────────────────────────── */}
      <div
        className="fixed right-0 top-1/2 -translate-y-1/2 z-[60] flex flex-col"
        style={{ gap: 2 }}
      >
        {([
          { key: "articles" as const, Icon: Newspaper,    label: "Articles"    },
          { key: "source"   as const, Icon: Link2,         label: "From Source" },
          { key: "chat"     as const, Icon: MessageCircle, label: "Chat"        },
        ]).map(({ key, Icon, label }) => (
          <button
            key={key}
            title={label}
            onClick={() =>
              key === "chat" ? setChatOpen(true) : clickTab(key)
            }
            className={[
              "flex flex-col items-center justify-center gap-1",
              "w-12 py-4 rounded-l-xl select-none",
              "border border-white/10 shadow-2xl",
              "text-[9px] font-bold tracking-widest uppercase",
              "transition-all duration-200",
              tab === key
                ? "bg-indigo-600 text-white border-indigo-500 shadow-indigo-500/40"
                : "bg-[#080c18]/85 backdrop-blur-xl text-white/50 hover:bg-white/10 hover:text-white",
            ].join(" ")}
          >
            <Icon size={15} />
            <span className="hidden sm:block leading-none">{label}</span>
          </button>
        ))}
      </div>

      {/* ─────────────────────────────────────────────────────────────────────
          Slide-in panel
          • width 42 vw (min 320px, max 660px) — covers ~42% of screen
          • z-50: in front of page content but behind tab buttons
          • paddingRight 48px: keeps content clear of the 48px-wide tab rail
          • Animates via width+opacity transition
      ───────────────────────────────────────────────────────────────────── */}
      <div
        className={[
          "fixed top-0 right-0 h-full z-50",
          "flex flex-col",
          "border-l border-white/[0.08] shadow-2xl",
          "transition-[width,opacity] duration-300 ease-in-out overflow-hidden",
        ].join(" ")}
        style={{
          width:         isOpen ? "clamp(320px, 42vw, 660px)" : 0,
          opacity:       isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          background:    "rgba(6,9,20,0.97)",
          backdropFilter:"blur(24px)",
          paddingRight:  48, // tab button width
        }}
      >
        {isOpen && (
          <>
            {/* Panel header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.07] shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                <span className="text-white font-bold text-[11px] uppercase tracking-[0.18em]">
                  {tab === "articles" ? "Intelligence Feed" : "From Source"}
                </span>
                {tab === "articles" && articles.length > 0 && (
                  <span className="text-white/20 text-[10px]">{articles.length} articles</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {tab === "articles" && (
                  <button
                    onClick={onRefresh}
                    disabled={refreshing}
                    className="flex items-center gap-1 text-[10px] text-indigo-400
                      hover:text-indigo-300 disabled:opacity-40 transition-colors"
                  >
                    <RefreshCw size={11} className={refreshing ? "animate-spin" : ""} />
                    {refreshing ? "Refreshing…" : "Refresh"}
                  </button>
                )}
                <button
                  onClick={() => setTab(null)}
                  className="p-1 rounded-md text-white/30 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* ── ARTICLES TAB ──────────────────────────────────────────── */}
            {tab === "articles" && (
              <div className="flex-1 overflow-y-auto overscroll-contain">
                {articles.length === 0 ? (
                  <Empty text={refreshing ? "Fetching articles…" : "No articles yet. Click Refresh."} />
                ) : (
                  <ul className="divide-y divide-white/[0.04]">
                    {articles.map(a => (
                      <ArticleCard
                        key={a.id}
                        article={a}
                        insightLoading={insightLoadingId === a.id}
                        onInsight={() => onInsight(a)}
                      />
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* ── SOURCE TAB ────────────────────────────────────────────── */}
            {tab === "source" && (
              <div className="flex flex-col flex-1 overflow-hidden">
                {/* URL input */}
                <div className="px-5 py-4 border-b border-white/[0.07] space-y-2.5 shrink-0">
                  <p className="text-white/35 text-[11px] leading-relaxed">
                    Paste an X profile, LinkedIn page, Facebook page, RSS feed or any news URL.
                    The URL is saved in your browser until you refresh the page.
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={srcInput}
                      onChange={e => setSrcInput(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleFetchSource()}
                      placeholder="https://x.com/openai"
                      className="flex-1 px-3 py-2 rounded-lg text-[11px] text-white
                        bg-white/[0.06] border border-white/[0.10] placeholder-white/20
                        focus:outline-none focus:border-indigo-500/70 focus:bg-white/[0.09]
                        transition-colors"
                    />
                    <button
                      onClick={handleFetchSource}
                      disabled={srcLoading}
                      className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500
                        text-white text-[11px] font-semibold disabled:opacity-50
                        flex items-center gap-1.5 transition-colors shrink-0"
                    >
                      {srcLoading
                        ? <Loader2 size={11} className="animate-spin" />
                        : <ArrowRight size={11} />
                      }
                      Fetch
                    </button>
                  </div>
                  {srcErr && <p className="text-red-400 text-[10px]">{srcErr}</p>}
                </div>

                <div className="flex-1 overflow-y-auto overscroll-contain">
                  {srcLoading
                    ? <Spinner text="Fetching from source…" />
                    : srcArts.length === 0
                      ? <Empty text="Enter a URL above and click Fetch." />
                      : (
                        <ul className="divide-y divide-white/[0.04]">
                          {srcArts.map(a => (
                            <ArticleCard
                              key={a.id}
                              article={a}
                              insightLoading={srcInsightId === a.id}
                              onInsight={() => handleSrcInsight(a)}
                            />
                          ))}
                        </ul>
                      )
                  }
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Insight popups */}
      {openInsight && (
        <InsightPopup
          article={openInsight.article}
          insight={openInsight.insight}
          onClose={onCloseInsight}
        />
      )}
      {srcPopup && (
        <InsightPopup
          article={srcPopup.article}
          insight={srcPopup.insight}
          onClose={() => setSrcPopup(null)}
        />
      )}

      {/* Chat popup */}
      {chatOpen && <ChatPopup onClose={() => setChatOpen(false)} />}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ArticleCard — image LEFT (76×60), domain + title + blurb RIGHT, insight btn
// ─────────────────────────────────────────────────────────────────────────────
function ArticleCard({
  article: a,
  insightLoading,
  onInsight,
}: {
  article: Article;
  insightLoading: boolean;
  onInsight: () => void;
}) {
  // 30-40 word blurb from short_summary → content → description → url
  const raw    = a.short_summary ?? a.content ?? a.description ?? "";
  const words  = raw.split(/\s+/).filter(Boolean);
  const blurb  = words.length > 35
    ? words.slice(0, 35).join(" ").replace(/[,;:]?\s*$/, "") + "…"
    : raw;

  const domain  = a.matched_domains?.[0] ?? a.topic ?? "";
  const dateStr = a.published_at
    ? new Date(a.published_at).toLocaleDateString("en-GB", {
        day: "numeric", month: "short",
      })
    : "";
  const hasInsight = !!(a.has_insight || a.ai_insight);
  const readUrl    = a.article_url ?? a.url ?? "";

  return (
    <li className="group flex gap-3 px-4 py-3.5 hover:bg-white/[0.025] transition-colors">
      {/* Image — left */}
      <div className="shrink-0 w-[76px] h-[60px] rounded-lg overflow-hidden bg-white/[0.04]">
        {a.image_url ? (
          <img
            src={a.image_url}
            alt=""
            loading="lazy"
            className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity"
            onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/8 text-xl select-none">
            📰
          </div>
        )}
      </div>

      {/* Text — right */}
      <div className="flex-1 min-w-0 flex flex-col justify-between gap-1">
        <div>
          {domain && (
            <p className="text-[9px] font-bold tracking-[0.16em] uppercase text-indigo-400 mb-0.5">
              {domain}
            </p>
          )}
          <p className="text-white text-[11px] font-semibold leading-snug line-clamp-2">
            {a.title}
          </p>
          {blurb && (
            <p className="text-white/38 text-[10px] leading-relaxed line-clamp-2 mt-0.5">
              {blurb}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-1.5">
            {a.source && <span className="text-white/18 text-[9px]">{a.source}</span>}
            {dateStr  && <span className="text-white/18 text-[9px]">· {dateStr}</span>}
            {readUrl  && (
              <a
                href={readUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                className="text-white/18 hover:text-white/60 transition-colors"
              >
                <ExternalLink size={9} />
              </a>
            )}
          </div>

          <button
            onClick={onInsight}
            disabled={insightLoading}
            className={[
              "flex items-center gap-1 px-2 py-1 rounded-md",
              "text-[9px] font-bold uppercase tracking-wide shrink-0",
              "transition-all duration-150 disabled:opacity-50",
              hasInsight
                ? "bg-indigo-600/45 hover:bg-indigo-500/70 text-indigo-200"
                : "bg-white/[0.07] hover:bg-indigo-600/55 text-white/55 hover:text-white",
            ].join(" ")}
          >
            {insightLoading
              ? <Loader2 size={9} className="animate-spin" />
              : <Sparkles size={9} />
            }
            {hasInsight ? "View Insight" : "AI Insight"}
          </button>
        </div>
      </div>
    </li>
  );
}

// ── Helpers ─────────────────────────────────────────────────────────────────
function Empty({ text }: { text: string }) {
  return (
    <div className="flex items-center justify-center h-48
      text-white/18 text-xs text-center px-6">
      {text}
    </div>
  );
}
function Spinner({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-48 gap-2 text-white/22">
      <Loader2 size={16} className="animate-spin" />
      <span className="text-xs">{text}</span>
    </div>
  );
}