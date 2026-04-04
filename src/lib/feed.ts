/**
 * lib/feed.ts
 * API wrappers for feed.py:
 *   POST /api/feed/from-selection
 *   GET  /api/feed/items
 *   GET  /api/feed/items/:id
 *   POST /api/feed/items/:id/insight
 *   DELETE /api/feed/items/:id
 */
import type { AiInsight } from "../types";

const BASE =
  (typeof import.meta !== "undefined"
    ? (import.meta as any).env?.VITE_FLASK_API_URL
    : undefined) ?? "http://127.0.0.1:5000";

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

export interface FeedArticle {
  id: string;
  title: string;
  short_summary?: string;
  image_url?: string;
  article_url?: string;
  url?: string;
  source: string;
  matched_domains?: string[];
  keywords?: string[];
  selected_text?: string;
  published_at?: string;
  fetched_at: string;
  has_insight?: boolean;
  ai_insight?: AiInsight | null;
}

export interface FeedFromSelectionResponse {
  selected_text: string;
  keywords: string[];
  matched_domains: string[];
  saved: number;
  articles: FeedArticle[];
  message?: string;         // present when saved=0
}

/** POST /api/feed/from-selection */
export function feedFromSelection(params: {
  selected_text: string;
  uid?: string;
  source_article_id?: string;
}): Promise<FeedFromSelectionResponse> {
  return call("/api/feed/from-selection", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

/** GET /api/feed/items?uid=&limit= */
export async function listFeedItems(uid?: string, limit = 20): Promise<FeedArticle[]> {
  const qs = new URLSearchParams({ limit: String(limit) });
  if (uid) qs.set("uid", uid);
  const data = await call<{ articles: FeedArticle[]; total: number }>(
    `/api/feed/items?${qs}`,
  );
  return data.articles ?? [];
}

/** POST /api/feed/items/:id/insight */
export function feedItemInsight(id: string, force = false): Promise<{
  article_id: string;
  source_table: string;
  ai_insight: AiInsight;
  cached: boolean;
}> {
  return call(`/api/feed/items/${id}/insight${force ? "?force=1" : ""}`, {
    method: "POST",
  });
}

/** DELETE /api/feed/items/:id */
export function deleteFeedItem(id: string): Promise<{ deleted: boolean; article_id: string }> {
  return call(`/api/feed/items/${id}`, { method: "DELETE" });
}