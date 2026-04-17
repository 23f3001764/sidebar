import { useEffect, useState } from "react";
import { Loader2, Search, Trash2 } from "lucide-react";
import { SteamiLayout } from "@/components/SteamiLayout";
import { deleteFeedItem, feedFromSelection, listFeedItems, type FeedArticle } from "@/lib/feed";
import { useAuthStore } from "@/stores/auth-store";

export default function FeedPage() {
  const { user, isAuthenticated } = useAuthStore();
  const [text, setText] = useState("quantum computing and robotics");
  const [items, setItems] = useState<FeedArticle[]>([]);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    if (!isAuthenticated) return;
    setLoading(true);
    setError("");
    try {
      setItems(await listFeedItems(user?.id, 40));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function search() {
    setLoading(true);
    setError("");
    try {
      const res = await feedFromSelection({ selected_text: text, uid: user?.id });
      setItems(res.articles ?? []);
      setKeywords(res.keywords ?? []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function remove(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id));
    try { await deleteFeedItem(id); } catch { load(); }
  }

  useEffect(() => { load(); }, [isAuthenticated, user?.id]);

  return (
    <SteamiLayout>
      <div className="space-y-5">
        <div>
          <div className="steami-section-label mb-2">FEED API</div>
          <h1 className="steami-heading text-2xl md:text-3xl">Smart Feed</h1>
          <p className="text-[12px] text-muted-foreground mt-1">
            Search related articles from selected text and manage saved feed items.
          </p>
        </div>

        {!isAuthenticated && (
          <div className="glass-card p-4 text-xs text-amber-300">Login is required to use the feed APIs.</div>
        )}

        <div className="glass-card p-4 space-y-3">
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3}
            className="w-full rounded-lg bg-white/[0.06] border border-white/10 px-3 py-2 text-xs text-white resize-none"
            placeholder="Paste selected text..." />
          <button onClick={search} disabled={!isAuthenticated || loading || !text.trim()}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-40">
            {loading ? <Loader2 size={13} className="animate-spin" /> : <Search size={13} />}
            Search Feed
          </button>
          {keywords.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {keywords.map((keyword) => (
                <span key={keyword} className="px-2 py-1 rounded-md bg-indigo-500/10 text-indigo-200 text-[9px] font-mono">
                  {keyword}
                </span>
              ))}
            </div>
          )}
        </div>

        {error && <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-300">{error}</div>}
        {loading ? (
          <div className="flex h-40 items-center justify-center text-white/30"><Loader2 className="animate-spin" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {items.map((item) => (
              <article key={item.id} className="glass-card p-4 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-sm font-semibold text-white/85 leading-snug">{item.title}</h2>
                  <button onClick={() => remove(item.id)} className="p-2 rounded-lg text-white/25 hover:text-red-300 hover:bg-red-500/10">
                    <Trash2 size={13} />
                  </button>
                </div>
                <p className="text-[11px] leading-relaxed text-white/45 line-clamp-3">{item.short_summary}</p>
                <p className="font-mono text-[9px] uppercase text-white/25">{item.source || "Feed item"}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </SteamiLayout>
  );
}
