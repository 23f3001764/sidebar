// ────────────────────────────────────────────────────────────────────────────
// Matches the EXACT Firestore document shape confirmed from the database dump
// and API responses from the uploaded app.py
// ────────────────────────────────────────────────────────────────────────────

/** GET /api/articles  |  GET /api/articles/:id  |  POST /api/articles/fetch */
export interface Article {
  id: string;
  title: string;
  // Content fields — all three may appear depending on source
  content?: string;
  full_content?: string;         // fetched page body for Gemini
  short_summary?: string;        // 30-40 word og:description
  description?: string;
  url: string;
  article_url?: string;          // canonical URL (used by Gemini + link)
  source_url?: string;           // set for fetch-source articles
  source: string;                // "MIT Technology Review" | "BBC Tech" | …
  topic?: string;
  matched_domains?: string[];    // e.g. ["AI","Space"]
  image_url?: string;
  published_at?: string;
  fetched_at: string;
  has_insight?: boolean;
  ai_insight?: AiInsight | null;
  insight_generated_at?: string;
  // Legacy fields
  author?: string;
}

/**
 * The ai_insight object inside article AND the response from
 * POST /api/articles/:id/insight  →  response.ai_insight
 * Verified against real Firestore dump.
 */
export interface AiInsight {
  summary: string;               // 150-200 word prose
  svg: string;                   // raw SVG string, single-quoted attrs, 400×400
  key_points: string[];          // exactly 3 strings
  sentiment: "positive" | "neutral" | "negative";
  confidence: number;            // 0.0–1.0
  tags: string[];                // 3-5 strings
  domain: string;                // "AI" | "Robotics" | …
  reading_time_min: number;      // integer
  article_url: string;           // guaranteed by backend
  raw?: string;                  // only on parse failure (treat as error)
}

/** GET /api/insights  →  { insights: InsightDoc[] } */
export interface InsightDoc {
  article_id: string;
  title: string;
  topic?: string;
  source?: string;
  matched_domains?: string[];
  article_url?: string;
  ai_insight: AiInsight;
  created_at: string;
}

/** POST /api/articles/:id/insight response */
export interface InsightResponse {
  article_id: string;
  cached: boolean;
  ai_insight: AiInsight;
}