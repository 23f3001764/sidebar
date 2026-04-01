/**
 * useArticles — single source of truth for article + insight state.
 *
 * Boot sequence (matches uploaded app.py which has NO /api/refresh or /api/feed):
 *   1. GET /api/articles  (load from Firestore)
 *   2. If empty → POST /api/articles/fetch (pull fresh from RSS)
 *   3. On demand: POST /api/articles/:id/insight (Gemini, or cached)
 */
import { useState, useEffect, useCallback, useRef } from "react";
import type { Article, AiInsight } from "../types";
import {
  apiGetArticles, apiFetchArticles,
  apiGetInsight,
} from "../lib/api";

const KEYWORDS = [
  "AI", "machine learning", "robotics", "space", "biology",
  "physics", "engineering", "mathematics", "computer science", "finance",
];

export function useArticles() {
  const [articles,    setArticles]    = useState<Article[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [refreshing,  setRefreshing]  = useState(false);
  const [error,       setError]       = useState("");

  // insight state
  const cache              = useRef<Record<string, AiInsight>>({});
  const [insightLoadingId, setInsightLoadingId] = useState<string | null>(null);
  const [openInsight,      setOpenInsight]      = useState<{
    article: Article;
    insight: AiInsight;
  } | null>(null);

  // ── Boot ──────────────────────────────────────────────────────────────────
  useEffect(() => { boot(); }, []);

  async function boot() {
    setLoading(true);
    setError("");
    try {
      const arts = await apiGetArticles(35);
      if (arts.length > 0) {
        setArticles(arts);
      } else {
        // Nothing in DB — fetch fresh
        await doFetch();
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  // ── Fetch fresh articles (POST /api/articles/fetch) ───────────────────────
  const doFetch = useCallback(async () => {
    setRefreshing(true);
    setError("");
    try {
      const res = await apiFetchArticles(KEYWORDS, 25);
      if ((res.articles?.length ?? 0) > 0) {
        setArticles(res.articles);
      } else {
        // Fetch saved again (dedup logic means fresh might overlap with existing)
        const arts = await apiGetArticles(35);
        setArticles(arts);
      }
    } catch (e: any) {
      setError("Could not refresh articles: " + e.message);
    } finally {
      setRefreshing(false);
    }
  }, []);

  // ── Insight ───────────────────────────────────────────────────────────────
  const requestInsight = useCallback(async (article: Article) => {
    // 1. Memory cache
    if (cache.current[article.id]) {
      setOpenInsight({ article, insight: cache.current[article.id] });
      return;
    }
    // 2. Embedded on the article object (returned by GET /api/articles)
    if (
      article.ai_insight &&
      typeof article.ai_insight === "object" &&
      article.ai_insight.summary &&
      article.ai_insight.summary.length > 50
    ) {
      cache.current[article.id] = article.ai_insight;
      setOpenInsight({ article, insight: article.ai_insight });
      return;
    }
    // 3. Backend (cached Firestore or fresh Gemini)
    setInsightLoadingId(article.id);
    setError("");
    try {
      const resp = await apiGetInsight(article.id);
      const ins  = resp.ai_insight;
      cache.current[article.id] = ins;
      // Update article in list so "View Insight" shows next render
      setArticles(prev =>
        prev.map(a =>
          a.id === article.id
            ? { ...a, ai_insight: ins, has_insight: true }
            : a
        )
      );
      setOpenInsight({ article: { ...article, ai_insight: ins }, insight: ins });
    } catch (e: any) {
      setError("Insight failed: " + e.message);
    } finally {
      setInsightLoadingId(null);
    }
  }, []);

  return {
    articles,      setArticles,
    loading,
    refreshing,
    error,         setError,
    insightLoadingId,
    openInsight,   setOpenInsight,
    requestInsight,
    doFetch,
  };
}