import { useEffect, useState } from "react";
import { Loader2, Play, RefreshCw } from "lucide-react";
import { SteamiLayout } from "@/components/SteamiLayout";
import { health, pipeline, sources } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

export default function ApiToolsPage() {
  const { user } = useAuthStore();
  const [status, setStatus] = useState("checking");
  const [sourceData, setSourceData] = useState<any>(null);
  const [topic, setTopic] = useState("technology");
  const [keywords, setKeywords] = useState("AI, robotics");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canRun = user?.role === "admin" || user?.role === "mod";

  async function load() {
    setError("");
    setStatus("checking");
    try {
      await health.check();
      setStatus("online");
    } catch {
      setStatus("offline");
    }
    try {
      setSourceData(await sources.list());
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function runPipeline() {
    if (!canRun) return;
    setLoading(true);
    setError("");
    try {
      const data = await pipeline.run({
        topic,
        keywords: keywords.split(",").map((item) => item.trim()).filter(Boolean),
        limit: 3,
      });
      setResult(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <SteamiLayout>
      <div className="space-y-5">
        <div>
          <div className="steami-section-label mb-2">API TOOLS</div>
          <h1 className="steami-heading text-2xl md:text-3xl">Backend Tools</h1>
          <p className="text-[12px] text-muted-foreground mt-1">
            Health, sources, and the article pipeline endpoint.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <section className="glass-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-mono text-[10px] uppercase tracking-widest text-white/60">Health</h2>
              <button onClick={load} className="text-white/35 hover:text-white"><RefreshCw size={13} /></button>
            </div>
            <p className={`font-mono text-sm ${status === "online" ? "text-emerald-300" : status === "offline" ? "text-red-300" : "text-amber-300"}`}>
              {status}
            </p>
          </section>

          <section className="glass-card p-4 space-y-3">
            <h2 className="font-mono text-[10px] uppercase tracking-widest text-white/60">Sources</h2>
            <pre className="max-h-40 overflow-auto rounded-lg bg-black/20 p-3 text-[10px] text-white/45">
              {JSON.stringify(sourceData, null, 2)}
            </pre>
          </section>
        </div>

        <section className="glass-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-mono text-[10px] uppercase tracking-widest text-white/60">Pipeline</h2>
            {!canRun && <span className="font-mono text-[9px] text-amber-300">mod/admin only</span>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input value={topic} onChange={(e) => setTopic(e.target.value)}
              className="rounded-lg bg-white/[0.06] border border-white/10 px-3 py-2 text-xs text-white"
              placeholder="Topic" />
            <input value={keywords} onChange={(e) => setKeywords(e.target.value)}
              className="rounded-lg bg-white/[0.06] border border-white/10 px-3 py-2 text-xs text-white"
              placeholder="Keywords, comma separated" />
          </div>
          <button onClick={runPipeline} disabled={!canRun || loading}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-40">
            {loading ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} />}
            Run Pipeline
          </button>
          {error && <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-300">{error}</div>}
          {result && (
            <pre className="max-h-72 overflow-auto rounded-lg bg-black/20 p-3 text-[10px] text-white/45">
              {JSON.stringify(result, null, 2)}
            </pre>
          )}
        </section>
      </div>
    </SteamiLayout>
  );
}
