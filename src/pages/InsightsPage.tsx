import { useEffect, useState } from "react";
import { Loader2, RefreshCw, Sparkles, Trash2 } from "lucide-react";
import { SteamiLayout } from "@/components/SteamiLayout";
import { insights } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

export default function InsightsPage() {
  const { user, isAuthenticated } = useAuthStore();
  const [items, setItems] = useState<any[]>([]);
  const [queue, setQueue] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const canManage = user?.role === "admin" || user?.role === "mod";

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await insights.list(60);
      setItems(res.insights ?? []);
      if (canManage) {
        const q = await insights.queue().catch(() => null);
        setQueue(q);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function processQueue() {
    if (!canManage) return;
    setLoading(true);
    try {
      await insights.process(2);
      await load();
    } catch (e: any) {
      setError(e.message);
      setLoading(false);
    }
  }

  async function clearQueue() {
    if (!canManage || !confirm("Clear the insight queue?")) return;
    setLoading(true);
    try {
      await insights.clearQueue();
      await load();
    } catch (e: any) {
      setError(e.message);
      setLoading(false);
    }
  }

  useEffect(() => { if (isAuthenticated) load(); else setLoading(false); }, [isAuthenticated, canManage]);

  return (
    <SteamiLayout>
      <div className="space-y-5">
        <div>
          <div className="steami-section-label mb-2">INSIGHTS API</div>
          <h1 className="steami-heading text-2xl md:text-3xl">AI Insights</h1>
          <p className="text-[12px] text-muted-foreground mt-1">
            Review generated insights and manage the insight queue.
          </p>
        </div>

        {!isAuthenticated && (
          <div className="glass-card p-4 text-xs text-amber-300">Login is required to view insights.</div>
        )}

        {canManage && queue && (
          <div className="glass-card p-4 flex flex-col md:flex-row md:items-center gap-3 justify-between">
            <div className="grid grid-cols-5 gap-3 text-center flex-1">
              {["pending", "processing", "done", "failed", "total"].map((key) => (
                <div key={key}>
                  <p className="font-mono text-lg text-white">{queue[key] ?? 0}</p>
                  <p className="font-mono text-[8px] uppercase text-white/30">{key}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={processQueue} className="px-3 py-2 rounded-lg bg-indigo-600 text-white text-[10px] font-mono uppercase">
                Process 2
              </button>
              <button onClick={clearQueue} className="px-3 py-2 rounded-lg bg-red-500/15 text-red-300 text-[10px] font-mono uppercase">
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        )}

        <button onClick={load} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.05] text-white/45 hover:text-white text-xs">
          <RefreshCw size={13} /> Refresh
        </button>

        {error && <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-300">{error}</div>}
        {loading ? (
          <div className="flex h-40 items-center justify-center text-white/30"><Loader2 className="animate-spin" /></div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <article key={item.article_id} className="glass-card p-4">
                <div className="flex items-start gap-3">
                  <Sparkles size={16} className="text-indigo-300 shrink-0 mt-1" />
                  <div className="min-w-0">
                    <h2 className="text-sm font-semibold text-white/85">{item.title || item.article_id}</h2>
                    <p className="mt-2 text-[11px] leading-relaxed text-white/45 line-clamp-4">
                      {item.ai_insight?.summary || "No summary available."}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {(item.ai_insight?.tags ?? []).slice(0, 5).map((tag: string) => (
                        <span key={tag} className="px-2 py-1 rounded-md bg-indigo-500/10 text-indigo-200 text-[9px] font-mono">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </SteamiLayout>
  );
}
