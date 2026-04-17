import { useEffect, useState } from "react";
import { ExternalLink, Loader2, RefreshCw, Sparkles } from "lucide-react";
import { SteamiLayout } from "@/components/SteamiLayout";
import { articles, type Article } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

export default function ArticlesPage() {
  const { user, isAuthenticated } = useAuthStore();
  const [tab, setTab] = useState<"all" | "for-me" | "new">("all");
  const [items, setItems] = useState<Article[]>([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const canRefresh = user?.role === "admin" || user?.role === "mod";

  async function load(nextTab = tab) {
    setLoading(true);
    setError("");
    try {
      if (nextTab === "for-me") {
        const res = await articles.forMe(40);
        setItems(res.articles ?? []);
        setStatus(`${res.total ?? 0} personalized articles`);
      } else if (nextTab === "new") {
        const res = await articles.refreshCheck(24);
        setItems(res.articles ?? []);
        setStatus(`${res.new_articles ?? 0} new articles in the last ${res.since_hours ?? 24} hours`);
      } else {
        const res = await articles.list(40);
        setItems(res.articles ?? []);
        setStatus(`${res.articles?.length ?? 0} articles loaded`);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchFresh() {
    if (!canRefresh) return;
    setLoading(true);
    setError("");
    try {
      const res: any = await articles.fetch({ topic: "technology", limit: 20 });
      setItems(res.articles ?? []);
      setStatus(`Fetched ${res.articles?.length ?? res.saved ?? 0} articles`);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(tab); }, [tab]);

  return (
    <SteamiLayout>
      <div className="space-y-5">
        <div>
          <div className="steami-section-label mb-2">ARTICLE API</div>
          <h1 className="steami-heading text-2xl md:text-3xl">Articles</h1>
          <p className="text-[12px] text-muted-foreground mt-1">
            Browse saved articles, personalized articles, and recent refresh checks.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            ["all", "All Articles"],
            ["for-me", "For Me"],
            ["new", "New Check"],
          ].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key as any)}
              className={`px-3 py-2 rounded-lg font-mono text-[10px] uppercase tracking-wider ${
                tab === key ? "bg-indigo-600 text-white" : "bg-white/[0.05] text-white/45 hover:text-white"
              }`}>
              {label}
            </button>
          ))}
          <button onClick={() => load(tab)}
            className="px-3 py-2 rounded-lg bg-white/[0.05] text-white/45 hover:text-white">
            <RefreshCw size={13} />
          </button>
          {canRefresh && (
            <button onClick={fetchFresh}
              className="px-3 py-2 rounded-lg bg-amber-500/15 text-amber-300 font-mono text-[10px] uppercase tracking-wider">
              Fetch Fresh
            </button>
          )}
        </div>

        {!isAuthenticated && tab !== "all" && (
          <div className="glass-card p-4 text-xs text-amber-300">
            Login is required for personalized and refresh-check article APIs.
          </div>
        )}

        {status && <p className="font-mono text-[10px] text-white/35">{status}</p>}
        {error && <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-300">{error}</div>}

        {loading ? (
          <div className="flex h-40 items-center justify-center text-white/30"><Loader2 className="animate-spin" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {items.map((article) => (
              <article key={article.id} className="glass-card p-4 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-sm font-semibold text-white/85 leading-snug">{article.title}</h2>
                  {article.has_insight && <Sparkles size={14} className="text-indigo-300 shrink-0" />}
                </div>
                <p className="text-[11px] leading-relaxed text-white/45 line-clamp-3">
                  {article.short_summary || article.content || "No summary available."}
                </p>
                <div className="flex items-center justify-between gap-3 pt-2">
                  <span className="font-mono text-[9px] uppercase text-white/25">{article.source || article.topic || "STEAMI"}</span>
                  {(article.article_url || article.url) && (
                    <a href={article.article_url || article.url} target="_blank" rel="noreferrer"
                      className="text-white/30 hover:text-white">
                      <ExternalLink size={13} />
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </SteamiLayout>
  );
}
