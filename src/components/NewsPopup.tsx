/**
 * NewsPopup — updated.
 * Now rendered inside a positioned div in App.tsx so it sits above
 * the mobile bottom tab bar automatically.
 * Removed its own `fixed` positioning — parent handles that.
 */
import { useState, useEffect, useRef } from "react";
import { X, Radio, ExternalLink } from "lucide-react";
import type { Article } from "../types";

interface Props { articles: Article[] }

export default function NewsPopup({ articles }: Props) {
  const pool = articles.slice(0, 15);
  const [idx,       setIdx]       = useState(0);
  const [visible,   setVisible]   = useState(true);
  const [dismissed, setDismissed] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (pool.length === 0 || dismissed) return;
    timer.current = setInterval(() => {
      setVisible(false);
      setTimeout(() => { setIdx(i => (i + 1) % pool.length); setVisible(true); }, 280);
    }, 5000);
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [pool.length, dismissed]);

  if (dismissed || pool.length === 0) return null;

  const item    = pool[idx];
  const domain  = item.matched_domains?.[0] ?? item.topic ?? item.source ?? "";
  const date    = item.published_at
    ? new Date(item.published_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })
    : "";
  const readUrl = item.article_url ?? item.url ?? "";

  return (
    <div
      className={[
        "w-64 rounded-xl overflow-hidden shadow-2xl",
        "transition-all duration-300 ease-in-out",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
      ].join(" ")}
      style={{
        background:    "rgba(6,9,20,0.91)",
        backdropFilter:"blur(22px)",
        border:        "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/[0.06]">
        <div className="flex items-center gap-1.5">
          <Radio size={9} className="text-indigo-400 animate-pulse" />
          <span className="text-[9px] font-bold tracking-[0.18em] uppercase text-indigo-400">Live</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex gap-0.5">
            {pool.slice(0, Math.min(pool.length, 8)).map((_, i) => (
              <button key={i}
                onClick={() => { setVisible(false); setTimeout(() => { setIdx(i); setVisible(true); }, 150); }}
                className={["rounded-full transition-all duration-200",
                  i === idx ? "w-3 h-1.5 bg-indigo-400" : "w-1.5 h-1.5 bg-white/18 hover:bg-white/40",
                ].join(" ")} />
            ))}
          </div>
          <button onClick={() => setDismissed(true)}
            className="text-white/22 hover:text-white/60 p-0.5 transition-colors">
            <X size={11} />
          </button>
        </div>
      </div>
      <div className="px-3 py-3">
        {domain && <p className="text-[9px] font-bold tracking-widest uppercase text-indigo-400 mb-1">{domain}</p>}
        <p className="text-white text-[11px] font-semibold leading-snug line-clamp-2 mb-1.5">{item.title}</p>
        {item.short_summary && (
          <p className="text-white/35 text-[10px] leading-relaxed line-clamp-2 mb-2">{item.short_summary}</p>
        )}
        <div className="flex items-center justify-between">
          <span className="text-white/18 text-[9px]">{item.source}{date ? ` · ${date}` : ""}</span>
          {readUrl && (
            <a href={readUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-0.5 text-[10px] text-indigo-400 hover:text-indigo-300 transition-colors">
              Read <ExternalLink size={8} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}