import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import type { DomainsResponse } from "../types";

const ICONS: Record<string, string> = {
  "Robotics":          "🤖",
  "Space":             "🚀",
  "AI":                "🧠",
  "Finance":           "📈",
  "Physics":           "⚛️",
  "Chemistry":         "🧪",
  "Biology/Medicine":  "🧬",
  "Engineering":       "⚙️",
  "Mathematics":       "∑",
  "Computer Science":  "💻",
};

interface Props {
  data: DomainsResponse;
  onSave: (selected: string[]) => Promise<void>;
}

export default function DomainPicker({ data, onSave }: Props) {
  const [selected, setSelected] = useState<string[]>([]);
  const [saving,   setSaving]   = useState(false);

  function toggle(name: string) {
    if (selected.includes(name)) {
      setSelected(s => s.filter(d => d !== name));
    } else if (selected.length < 3) {
      setSelected(s => [...s, name]);
    }
  }

  async function handleSave() {
    if (selected.length === 0) return;
    setSaving(true);
    try { await onSave(selected); }
    finally { setSaving(false); }
  }

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4"
      style={{ background: "rgba(4,8,16,0.92)", backdropFilter: "blur(20px)" }}
    >
      <div
        className="w-full max-w-[560px] rounded-2xl overflow-hidden shadow-2xl"
        style={{
          background: "rgba(8,12,24,0.98)",
          border:     "1px solid rgba(255,255,255,0.10)",
        }}
      >
        {/* Header */}
        <div className="px-8 pt-8 pb-5 text-center">
          <div className="text-4xl mb-3">🧠</div>
          <h2 className="text-white font-bold text-xl mb-2">
            Personalise Your Intelligence Feed
          </h2>
          <p className="text-white/45 text-sm leading-relaxed">
            Pick up to <span className="text-indigo-400 font-semibold">3 domains</span> you care about.
            <br />We'll filter your article feed accordingly.
          </p>
        </div>

        {/* Domain grid */}
        <div className="px-6 pb-5 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {data.domains.map(name => {
            const isOn  = selected.includes(name);
            const isDim = !isOn && selected.length >= 3;
            const kws   = (data.keywords[name] ?? []).slice(0, 2).join(", ");
            return (
              <button
                key={name}
                onClick={() => !isDim && toggle(name)}
                disabled={isDim}
                className={[
                  "relative flex flex-col items-center justify-center gap-1.5",
                  "py-4 px-3 rounded-xl border text-center",
                  "transition-all duration-200 select-none",
                  isOn
                    ? "bg-indigo-600/25 border-indigo-500/70 text-white"
                    : isDim
                      ? "bg-white/[0.02] border-white/[0.06] text-white/20 cursor-not-allowed"
                      : "bg-white/[0.04] border-white/[0.08] text-white/65 hover:bg-white/[0.08] hover:border-white/20 hover:text-white cursor-pointer",
                ].join(" ")}
              >
                {isOn && (
                  <span className="absolute top-2 right-2 w-4 h-4 rounded-full
                    bg-indigo-500 flex items-center justify-center">
                    <Check size={9} />
                  </span>
                )}
                <span className="text-[26px] leading-none">{ICONS[name] ?? "📌"}</span>
                <span className="text-[11px] font-semibold leading-tight">{name}</span>
                <span className="text-[9px] text-white/25 leading-tight">{kws}</span>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-8 pb-7 flex items-center justify-between">
          <span className="text-white/25 text-xs">
            {selected.length} / 3 selected
          </span>
          <button
            onClick={handleSave}
            disabled={selected.length === 0 || saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl
              bg-indigo-600 hover:bg-indigo-500
              text-white text-sm font-semibold
              disabled:opacity-40 disabled:cursor-not-allowed
              transition-colors"
          >
            {saving && <Loader2 size={13} className="animate-spin" />}
            {saving ? "Saving…" : "Set My Feed →"}
          </button>
        </div>
      </div>
    </div>
  );
}