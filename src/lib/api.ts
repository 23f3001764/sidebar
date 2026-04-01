/**
 * All API calls mapped to the uploaded app.py (v3).
 * Base URL read from VITE_FLASK_API_URL, defaults to http://127.0.0.1:5000
 */
import type { Article, AiInsight, InsightDoc, InsightResponse } from "../types";

const BASE =
  typeof import.meta !== "undefined"
    ? ((import.meta as any).env?.VITE_FLASK_API_URL ?? "http://127.0.0.1:5000")
    : "http://127.0.0.1:5000";

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try { msg = (await res.json()).error ?? msg; } catch { /* ignore */ }
    throw new Error(msg);
  }
  return res.json() as Promise<T>;
}

// ── 1. Health ────────────────────────────────────────────────────────────────
export const apiHealth = () =>
  call<{ status: string; ts: string }>("/health");

// ── 8. GET /api/articles?limit=N ────────────────────────────────────────────
export const apiGetArticles = (limit = 35) =>
  call<{ articles: Article[] }>(`/api/articles?limit=${limit}`)
    .then(d => d.articles ?? []);

// ── 9. GET /api/articles/:id ─────────────────────────────────────────────────
export const apiGetArticle = (id: string) =>
  call<Article>(`/api/articles/${id}`);

// ── 14. POST /api/articles/fetch ─────────────────────────────────────────────
export const apiFetchArticles = (keywords: string[], limit = 20) =>
  call<{ saved: number; articles: Article[] }>("/api/articles/fetch", {
    method: "POST",
    body: JSON.stringify({ keywords, limit }),
  });

// ── 13. POST /api/articles/fetch-source ─────────────────────────────────────
export const apiFetchSource = (url: string, limit = 20) =>
  call<{ saved: number; articles: Article[]; source_url: string }>(
    "/api/articles/fetch-source",
    { method: "POST", body: JSON.stringify({ url, limit }) }
  );

// ── 10. POST /api/articles/:id/insight ───────────────────────────────────────
export const apiGetInsight = (articleId: string, force = false) =>
  call<InsightResponse>(
    `/api/articles/${articleId}/insight${force ? "?force=1" : ""}`,
    { method: "POST" }
  );

// ── 11. GET /api/insights?limit=N ────────────────────────────────────────────
export const apiListInsights = (limit = 50) =>
  call<{ insights: InsightDoc[] }>(`/api/insights?limit=${limit}`)
    .then(d => d.insights ?? []);

// ── 12. GET /api/insights/:id ────────────────────────────────────────────────
export const apiGetInsightById = (id: string) =>
  call<InsightDoc>(`/api/insights/${id}`);

// ── 3. GET /api/sources ──────────────────────────────────────────────────────
export const apiGetSources = () =>
  call<{ sources: { name: string; url: string }[] }>("/api/sources")
    .then(d => d.sources ?? []);