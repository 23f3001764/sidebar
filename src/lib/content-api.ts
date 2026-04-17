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

/** Resolve a backend image path to a full URL.
 *  e.g. "/images/explainers/quantum-dog.jpg" → "http://127.0.0.1:5000/images/explainers/quantum-dog.jpg"
 *  Returns empty string if no image provided.
 */
export function resolveImageUrl(imagePath?: string | null): string {
  if (!imagePath) return "";
  // Already absolute (http/https) — return as-is
  if (imagePath.startsWith("http")) return imagePath;
  // Relative path — prepend backend base
  return `${BASE}${imagePath.startsWith("/") ? "" : "/"}${imagePath}`;
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Explainer {
  id: string;
  title: string;
  subtitle: string;
  field: string;
  badgeColor: string;
  readTime: string;
  image?: string;            // relative path like "/images/explainers/quantum-dog.jpg"
  content: string[];
  keyInsights: string[];
}

export interface Article {
  id: string;
  title: string;
  abstract: string;
  field: string;
  author: string;
  date: string;
  readTime: string;
  image?: string;            // relative path like "/images/research/physics.jpg"
  content: string[];
  quotes: string[];
  keyFindings: string[];
  relatedTopics: string[];
}

export interface FieldsMeta {
  fields: string[];
  field_icons: Record<string, string>;
  field_colors: Record<string, string>;
  field_images?: Record<string, string>;   // NEW — from latest API
}

// ── Explainers ────────────────────────────────────────────────────────────────

export async function getExplainers(field?: string): Promise<Explainer[]> {
  const qs = field ? `?field=${encodeURIComponent(field)}` : "";
  const d  = await call<{ explainers: Explainer[]; total: number }>(`/api/explainers${qs}`);
  return d.explainers ?? [];
}

export function getExplainer(id: string): Promise<Explainer> {
  return call<Explainer>(`/api/explainers/${id}`);
}

export function createExplainer(data: Partial<Explainer>): Promise<Explainer> {
  return call("/api/explainers", { method: "POST", body: JSON.stringify(data) });
}

export function updateExplainer(id: string, data: Partial<Explainer>): Promise<{ updated: boolean }> {
  return call(`/api/explainers/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export function deleteExplainer(id: string): Promise<{ deleted: boolean }> {
  return call(`/api/explainers/${id}`, { method: "DELETE" });
}

// ── Research Articles ─────────────────────────────────────────────────────────

export async function getResearchArticles(field?: string): Promise<{
  articles: Article[];
  fields: string[];
  field_icons: Record<string, string>;
  field_colors: Record<string, string>;
  field_images?: Record<string, string>;
}> {
  const qs = field ? `?field=${encodeURIComponent(field)}` : "";
  return call(`/api/research/articles${qs}`);
}

export function getResearchArticle(id: string): Promise<Article> {
  return call<Article>(`/api/research/articles/${id}`);
}

export function createResearchArticle(data: Partial<Article>): Promise<Article> {
  return call("/api/research/articles", { method: "POST", body: JSON.stringify(data) });
}

export function updateResearchArticle(id: string, data: Partial<Article>): Promise<{ updated: boolean }> {
  return call(`/api/research/articles/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export function deleteResearchArticle(id: string): Promise<{ deleted: boolean }> {
  return call(`/api/research/articles/${id}`, { method: "DELETE" });
}

export function getFields(): Promise<FieldsMeta> {
  return call("/api/research/fields");
}