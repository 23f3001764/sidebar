/**
 * useFeed — fixed version
 *
 * Key fixes:
 * 1. feedFromSelection error was silent — now surfaces to feedError state
 * 2. feedTabOpen state added — SidePanel reads this to auto-switch to Feed tab
 *    when fetchFeedForSelection is called from the toolbar
 * 3. Loads previously saved feed items on mount (so panel is not empty on open)
 */
import { useState, useCallback, useEffect, useRef } from "react";
import type { AiInsight } from "../types";
import {
  feedFromSelection, listFeedItems, feedItemInsight, deleteFeedItem,
  type FeedArticle,
} from "../lib/feed";
import { getLocalUser } from "../lib/chat";

export function useFeed() {
  const [feedArticles,  setFeedArticles]  = useState<FeedArticle[]>([]);
  const [feedLoading,   setFeedLoading]   = useState(false);
  const [feedError,     setFeedError]     = useState("");
  const [selectionText, setSelectionText] = useState("");
  const [keywords,      setKeywords]      = useState<string[]>([]);

  // ── NEW: signal to SidePanel to open the Feed tab automatically ───────────
  const [feedTabOpen,   setFeedTabOpen]   = useState(false);

  const feedInsightCache = useRef<Record<string, AiInsight>>({});
  const [feedInsightId,   setFeedInsightId]   = useState<string | null>(null);
  const [feedOpenInsight, setFeedOpenInsight] = useState<{
    article: FeedArticle;
    insight: AiInsight;
  } | null>(null);

  // Load previously saved feed items on mount
  useEffect(() => {
    const uid = getLocalUser()?.id ?? "";
    listFeedItems(uid, 20)
      .then(arts => { if (arts.length > 0) setFeedArticles(arts); })
      .catch(() => { /* no feed yet is fine */ });
  }, []);

  /** Called when user clicks ⚡ Feed toolbar button */
  const fetchFeedForSelection = useCallback(async (text: string) => {
    if (!text.trim()) return;
    setFeedLoading(true);
    setFeedError("");
    setFeedTabOpen(true);   // ← tells SidePanel to switch to Feed tab
    const uid = getLocalUser()?.id ?? "";
    try {
      const res = await feedFromSelection({ selected_text: text, uid });
      setKeywords(res.keywords ?? []);
      if ((res.saved ?? 0) === 0) {
        setFeedError(
          res.message ?? "No articles found for this selection. Try selecting longer text."
        );
        return;
      }
      setFeedArticles(prev => {
        const existingIds = new Set(prev.map(a => a.id));
        const newOnes     = (res.articles ?? []).filter(a => !existingIds.has(a.id));
        return [...newOnes, ...prev].slice(0, 50);
      });
    } catch (e: any) {
      // Show a user-friendly error instead of raw "Failed to fetch"
      const msg = e.message ?? "";
      if (msg.toLowerCase().includes("failed to fetch") || msg.toLowerCase().includes("networkerror")) {
        setFeedError("Cannot reach backend. Make sure Flask is running on http://127.0.0.1:5000");
      } else {
        setFeedError(msg || "Feed fetch failed. Please try again.");
      }
    } finally {
      setFeedLoading(false);
    }
  }, []);

  /** Fetch or show cached insight for a feed article */
  const requestFeedInsight = useCallback(async (article: FeedArticle) => {
    if (feedInsightCache.current[article.id]) {
      setFeedOpenInsight({ article, insight: feedInsightCache.current[article.id] });
      return;
    }
    if (article.ai_insight?.summary && article.ai_insight.summary.length > 50) {
      feedInsightCache.current[article.id] = article.ai_insight;
      setFeedOpenInsight({ article, insight: article.ai_insight });
      return;
    }
    setFeedInsightId(article.id);
    setFeedError("");
    try {
      const resp = await feedItemInsight(article.id);
      const ins  = resp.ai_insight;
      feedInsightCache.current[article.id] = ins;
      setFeedArticles(prev =>
        prev.map(a => a.id === article.id ? { ...a, ai_insight: ins, has_insight: true } : a)
      );
      setFeedOpenInsight({ article, insight: ins });
    } catch (e: any) {
      setFeedError(e.message || "Insight generation failed.");
    } finally {
      setFeedInsightId(null);
    }
  }, []);

  const removeFeedItem = useCallback(async (id: string) => {
    try {
      await deleteFeedItem(id);
      setFeedArticles(prev => prev.filter(a => a.id !== id));
    } catch { /* silent */ }
  }, []);

  return {
    feedArticles,
    feedLoading,
    feedError,       setFeedError,
    selectionText,   setSelectionText,
    keywords,
    feedTabOpen,     setFeedTabOpen,   // ← NEW
    feedInsightId,
    feedOpenInsight, setFeedOpenInsight,
    fetchFeedForSelection,
    requestFeedInsight,
    removeFeedItem,
  };
}