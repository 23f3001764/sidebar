import { useEffect, useState } from "react";
import { BookOpen, Loader2, Trash2 } from "lucide-react";
import { SteamiLayout } from "@/components/SteamiLayout";
import { diaryApi, type DiaryEntry } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

export default function DiaryPage() {
  const { isAuthenticated } = useAuthStore();
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await diaryApi.list(100);
      setEntries(res.entries ?? []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function remove(id: string) {
    setEntries((prev) => prev.filter((entry) => entry.id !== id));
    try { await diaryApi.delete(id); } catch { load(); }
  }

  useEffect(() => { if (isAuthenticated) load(); else setLoading(false); }, [isAuthenticated]);

  return (
    <SteamiLayout>
      <div className="space-y-5">
        <div>
          <div className="steami-section-label mb-2">DIARY API</div>
          <h1 className="steami-heading text-2xl md:text-3xl">Research Diary</h1>
          <p className="text-[12px] text-muted-foreground mt-1">
            Saved selections from explainers, research articles, simulations, and insights.
          </p>
        </div>

        {!isAuthenticated && (
          <div className="glass-card p-4 text-xs text-amber-300">Login is required to view diary entries.</div>
        )}
        {error && <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-300">{error}</div>}

        {loading ? (
          <div className="flex h-40 items-center justify-center text-white/30"><Loader2 className="animate-spin" /></div>
        ) : entries.length === 0 ? (
          <div className="glass-card p-10 text-center text-white/25">
            <BookOpen className="mx-auto mb-3" />
            <p className="text-sm">No diary entries yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => (
              <article key={entry.id} className="glass-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-[9px] uppercase text-indigo-300">{entry.popup_type}</p>
                    <h2 className="mt-1 text-sm font-semibold text-white/85">{entry.title}</h2>
                  </div>
                  <button onClick={() => remove(entry.id)} className="p-2 rounded-lg text-white/25 hover:text-red-300 hover:bg-red-500/10">
                    <Trash2 size={13} />
                  </button>
                </div>
                <p className="mt-3 text-[12px] leading-relaxed text-white/55">{entry.selected_text}</p>
                {entry.note && <p className="mt-3 rounded-lg bg-white/[0.04] p-3 text-[11px] text-white/45">{entry.note}</p>}
              </article>
            ))}
          </div>
        )}
      </div>
    </SteamiLayout>
  );
}
