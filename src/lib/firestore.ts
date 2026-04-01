import {
  collection, doc, getDocs, getDoc, setDoc, query,
  orderBy, limit, where, Timestamp, deleteDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import { Article, AiInsight } from "../types";

const ARTICLES_COL  = "articles";
const INSIGHTS_COL  = "ai_insights";
const HOURS_24      = 24 * 60 * 60 * 1000;

// ── Articles ──────────────────────────────────────────────────────────────────

export async function getArticles(limitN = 30): Promise<Article[]> {
  const q = query(
    collection(db, ARTICLES_COL),
    orderBy("fetchedAt", "desc"),
    limit(limitN)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Article));
}

export async function saveArticle(article: Omit<Article, "id"> & { id: string }): Promise<void> {
  await setDoc(doc(db, ARTICLES_COL, article.id), article, { merge: true });
}

/** Returns articles fetched from a specific sourceUrl within the last 24 h */
export async function getArticlesBySourceUrl(sourceUrl: string): Promise<Article[]> {
  const cutoff = new Date(Date.now() - HOURS_24).toISOString();
  const q = query(
    collection(db, ARTICLES_COL),
    where("sourceUrl", "==", sourceUrl),
    where("fetchedAt", ">=", cutoff),
    orderBy("fetchedAt", "desc"),
    limit(20)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Article));
}

/** Delete all articles for a sourceUrl (before refreshing) */
export async function deleteArticlesBySourceUrl(sourceUrl: string): Promise<void> {
  const q = query(collection(db, ARTICLES_COL), where("sourceUrl", "==", sourceUrl));
  const snap = await getDocs(q);
  await Promise.all(snap.docs.map(d => deleteDoc(d.ref)));
}

// ── AI Insights ───────────────────────────────────────────────────────────────

export async function getInsight(articleId: string): Promise<AiInsight | null> {
  const snap = await getDoc(doc(db, INSIGHTS_COL, articleId));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as AiInsight) : null;
}

export async function saveInsight(insight: AiInsight): Promise<void> {
  await setDoc(doc(db, INSIGHTS_COL, insight.articleId), insight, { merge: true });
}