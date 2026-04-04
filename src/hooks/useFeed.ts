/**
 * useFeed — manages the Feed tab state.
 *
 * Flow:
 *  1. User selects text anywhere on page → selectionText is set
 *  2. User clicks the floating "Feed" button → fetchFeedForSelection() called
 *  3. POST /api/feed/from-selection → articles saved + returned
 *  4. Articles shown in Feed tab of SidePanel
 *  5. Each article has an "AI Insight" button → feedItemInsight()
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

  // Insight state for feed articles (separate from main article insights)
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
      .catch(() => { /* silent — no feed yet is fine */ });
  }, []);

  /** Called when user clicks the floating "Feed" button after selecting text */
  const fetchFeedForSelection = useCallback(async (text: string) => {
    if (!text.trim()) return;
    setFeedLoading(true);
    setFeedError("");
    const uid = getLocalUser()?.id ?? "";
    try {
      const res = await feedFromSelection({ selected_text: text, uid });
      setKeywords(res.keywords);
      if (res.saved === 0) {
        setFeedError(res.message ?? "No articles found for this selection.");
        return;
      }
      // Prepend new articles, deduplicate by id
      setFeedArticles(prev => {
        const existingIds = new Set(prev.map(a => a.id));
        const newOnes = res.articles.filter(a => !existingIds.has(a.id));
        return [...newOnes, ...prev].slice(0, 50);
      });
    } catch (e: any) {
      setFeedError(e.message);
    } finally {
      setFeedLoading(false);
    }
  }, []);

  /** Generate or load insight for a feed article */
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
      setFeedError(e.message);
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
    feedError,    setFeedError,
    selectionText, setSelectionText,
    keywords,
    feedInsightId,
    feedOpenInsight, setFeedOpenInsight,
    fetchFeedForSelection,
    requestFeedInsight,
    removeFeedItem,
  };
}