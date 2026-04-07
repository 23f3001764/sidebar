/**
 * AdminPanel
 *
 * Almost-invisible button in the bottom-left corner.
 * Password: admin123
 * Provides forms to add new Explainers and Research Articles via the API.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, ChevronDown, ChevronUp, Lock } from 'lucide-react';
import { createExplainer, createResearchArticle } from '@/lib/content-api';

const FIELDS = ["PHYSICS","CHEMISTRY","BIOLOGY","MEDICINE","EARTH & SPACE","COMPUTER SCIENCE","AI","ROBOTICS","ENGINEERING","MATHEMATICS & DATA","CLIMATE & ENERGY"];
const BADGE_COLORS = ["cyan","green","violet","orange","red","gold"];
const ADMIN_PASSWORD = "admin123";

// ── Small helpers ─────────────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="font-mono text-[9px] tracking-wider uppercase text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = "text" }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <input type={type} value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2 rounded-lg text-xs text-white bg-white/[0.07] border border-white/[0.10]
        placeholder-white/25 focus:outline-none focus:border-steami-cyan/50 transition-colors" />
  );
}

function Textarea({ value, onChange, placeholder, rows = 3 }: {
  value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
}) {
  return (
    <textarea value={value} onChange={e => onChange(e.target.value)} rows={rows} placeholder={placeholder}
      className="w-full px-3 py-2 rounded-lg text-xs text-white bg-white/[0.07] border border-white/[0.10]
        placeholder-white/25 focus:outline-none focus:border-steami-cyan/50 transition-colors resize-none" />
  );
}

function ArrayField({ label, value, onChange, placeholder }: {
  label: string; value: string[]; onChange: (v: string[]) => void; placeholder?: string;
}) {
  const [draft, setDraft] = useState("");
  return (
    <Field label={label}>
      <div className="space-y-1.5">
        <div className="flex gap-1.5">
          <input value={draft} onChange={e => setDraft(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && draft.trim()) { onChange([...value, draft.trim()]); setDraft(""); e.preventDefault(); } }}
            placeholder={placeholder ?? "Type and press Enter"}
            className="flex-1 px-3 py-2 rounded-lg text-xs text-white bg-white/[0.07] border border-white/[0.10] placeholder-white/25 focus:outline-none focus:border-steami-cyan/50 transition-colors" />
          <button type="button" onClick={() => { if (draft.trim()) { onChange([...value, draft.trim()]); setDraft(""); } }}
            className="px-2 py-1 rounded-lg bg-indigo-600/50 hover:bg-indigo-500 text-white text-xs">
            <Plus size={12} />
          </button>
        </div>
        {value.map((item, i) => (
          <div key={i} className="flex items-start gap-1.5">
            <span className="flex-1 text-[11px] text-white/60 py-1 px-2 bg-white/[0.04] rounded-md leading-relaxed">{item}</span>
            <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))}
              className="text-red-400/50 hover:text-red-400 p-1 mt-0.5"><X size={10} /></button>
          </div>
        ))}
      </div>
    </Field>
  );
}

// ── Explainer form ─────────────────────────────────────────────────────────────
function ExplainerForm({ onSuccess }: { onSuccess: () => void }) {
  const [form, setForm] = useState({
    id: "", title: "", subtitle: "", field: FIELDS[0],
    badgeColor: "cyan", readTime: "8 MIN READ",
    content: [] as string[], keyInsights: [] as string[],
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const set = (key: string) => (v: any) => setForm(f => ({ ...f, [key]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.id || !form.title || form.content.length === 0) {
      setError("ID, title, and at least one content slide are required.");
      return;
    }
    setLoading(true); setError("");
    try {
      await createExplainer(form as any);
      onSuccess();
    } catch (e: any) {
      setError(e.message);
    } finally { setLoading(false); }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Field label="ID (slug)"><Input value={form.id} onChange={set("id")} placeholder="quantum-dog" /></Field>
        <Field label="Read Time"><Input value={form.readTime} onChange={set("readTime")} placeholder="8 MIN READ" /></Field>
      </div>
      <Field label="Title"><Input value={form.title} onChange={set("title")} placeholder="The Quantum Dog..." /></Field>
      <Field label="Subtitle"><Textarea value={form.subtitle} onChange={set("subtitle")} placeholder="One-line description..." rows={2} /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Field">
          <select value={form.field} onChange={e => set("field")(e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-xs text-white bg-white/[0.07] border border-white/[0.10] focus:outline-none focus:border-steami-cyan/50">
            {FIELDS.map(f => <option key={f} value={f} className="bg-[#080c18]">{f}</option>)}
          </select>
        </Field>
        <Field label="Badge Color">
          <select value={form.badgeColor} onChange={e => set("badgeColor")(e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-xs text-white bg-white/[0.07] border border-white/[0.10] focus:outline-none">
            {BADGE_COLORS.map(c => <option key={c} value={c} className="bg-[#080c18]">{c}</option>)}
          </select>
        </Field>
      </div>
      <ArrayField label="Content Slides" value={form.content} onChange={set("content")} placeholder="Slide text, press Enter to add" />
      <ArrayField label="Key Insights" value={form.keyInsights} onChange={set("keyInsights")} placeholder="Key insight, press Enter to add" />
      {error && <p className="text-red-400 text-[10px]">{error}</p>}
      <button type="submit" disabled={loading}
        className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold disabled:opacity-50">
        {loading ? "Saving…" : "Create Explainer"}
      </button>
    </form>
  );
}

// ── Research Article form ──────────────────────────────────────────────────────
function ResearchForm({ onSuccess }: { onSuccess: () => void }) {
  const [form, setForm] = useState({
    id: "", title: "", abstract: "", field: FIELDS[0],
    author: "", date: new Date().toISOString().slice(0, 10), readTime: "10 min",
    content: [] as string[], quotes: [] as string[],
    keyFindings: [] as string[], relatedTopics: [] as string[],
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const set = (key: string) => (v: any) => setForm(f => ({ ...f, [key]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.id || !form.title || !form.abstract) {
      setError("ID, title, and abstract are required.");
      return;
    }
    setLoading(true); setError("");
    try {
      await createResearchArticle(form as any);
      onSuccess();
    } catch (e: any) {
      setError(e.message);
    } finally { setLoading(false); }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Field label="ID"><Input value={form.id} onChange={set("id")} placeholder="a99" /></Field>
        <Field label="Read Time"><Input value={form.readTime} onChange={set("readTime")} placeholder="10 min" /></Field>
      </div>
      <Field label="Title"><Input value={form.title} onChange={set("title")} placeholder="Article title..." /></Field>
      <Field label="Abstract"><Textarea value={form.abstract} onChange={set("abstract")} placeholder="Short abstract..." rows={2} /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Field">
          <select value={form.field} onChange={e => set("field")(e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-xs text-white bg-white/[0.07] border border-white/[0.10] focus:outline-none">
            {FIELDS.map(f => <option key={f} value={f} className="bg-[#080c18]">{f}</option>)}
          </select>
        </Field>
        <Field label="Author"><Input value={form.author} onChange={set("author")} placeholder="Dr. Jane Doe" /></Field>
      </div>
      <Field label="Date"><Input value={form.date} onChange={set("date")} type="date" /></Field>
      <ArrayField label="Content Paragraphs" value={form.content} onChange={set("content")} placeholder="Paragraph text, press Enter" />
      <ArrayField label="Key Findings" value={form.keyFindings} onChange={set("keyFindings")} placeholder="Key finding, press Enter" />
      <ArrayField label="Quotes" value={form.quotes} onChange={set("quotes")} placeholder='"Quote" — Author' />
      <ArrayField label="Related Topics" value={form.relatedTopics} onChange={set("relatedTopics")} placeholder="Related topic, press Enter" />
      {error && <p className="text-red-400 text-[10px]">{error}</p>}
      <button type="submit" disabled={loading}
        className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold disabled:opacity-50">
        {loading ? "Saving…" : "Create Research Article"}
      </button>
    </form>
  );
}

// ── Main AdminPanel ────────────────────────────────────────────────────────────
export default function AdminPanel() {
  const [open,        setOpen]        = useState(false);
  const [authed,      setAuthed]      = useState(false);
  const [password,    setPassword]    = useState("");
  const [pwError,     setPwError]     = useState("");
  const [activeTab,   setActiveTab]   = useState<"explainer" | "research">("explainer");
  const [collapsed,   setCollapsed]   = useState(false);
  const [successMsg,  setSuccessMsg]  = useState("");

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) { setAuthed(true); setPwError(""); }
    else { setPwError("Wrong password."); }
  }

  function handleSuccess() {
    setSuccessMsg("✓ Saved successfully!");
    setTimeout(() => setSuccessMsg(""), 3000);
  }

  return (
    <>
      {/* Trigger button — almost invisible, bottom-left corner */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-16 sm:bottom-2 left-2 z-[55] w-6 h-6 rounded-full
          opacity-10 hover:opacity-40 transition-opacity duration-300"
        style={{ background: 'rgba(99,102,241,0.3)', border: '1px solid rgba(99,102,241,0.4)' }}
        title="Admin"
        aria-label="Open admin panel"
      >
        <Lock size={10} className="text-indigo-400 mx-auto" />
      </button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4"
            style={{ background: 'rgba(2,4,12,0.75)', backdropFilter: 'blur(8px)' }}
            onClick={() => setOpen(false)}>
            <motion.div
              initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
              className="relative w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl"
              style={{ background: 'rgba(8,12,24,0.98)', border: '1px solid rgba(255,255,255,0.09)',
                maxHeight: '88vh', overflowY: 'auto' }}
              onClick={e => e.stopPropagation()}>
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.07]">
                <div className="flex items-center gap-2">
                  <Lock size={12} className="text-indigo-400" />
                  <span className="text-white font-bold text-xs uppercase tracking-widest">Admin Panel</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => setCollapsed(c => !c)}
                    className="p-1 text-white/30 hover:text-white transition-colors">
                    {collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                  </button>
                  <button onClick={() => { setOpen(false); setAuthed(false); setPassword(""); }}
                    className="p-1 text-white/30 hover:text-white transition-colors">
                    <X size={14} />
                  </button>
                </div>
              </div>

              {!collapsed && (
                <div className="px-5 py-4">
                  {/* Login */}
                  {!authed ? (
                    <form onSubmit={handleLogin} className="space-y-3">
                      <p className="text-white/40 text-xs">Enter admin password to continue.</p>
                      <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                        placeholder="Password" autoFocus
                        className="w-full px-3 py-2 rounded-lg text-xs text-white bg-white/[0.07] border border-white/[0.10]
                          placeholder-white/25 focus:outline-none focus:border-indigo-500 transition-colors" />
                      {pwError && <p className="text-red-400 text-[10px]">{pwError}</p>}
                      <button type="submit"
                        className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold">
                        Unlock
                      </button>
                    </form>
                  ) : (
                    <>
                      {/* Tabs */}
                      <div className="flex gap-2 mb-4">
                        {(["explainer", "research"] as const).map(tab => (
                          <button key={tab} onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-1.5 rounded-lg text-[10px] font-semibold uppercase tracking-wider transition-colors
                              ${activeTab === tab ? "bg-indigo-600 text-white" : "bg-white/[0.06] text-white/40 hover:text-white"}`}>
                            {tab === "explainer" ? "New Explainer" : "New Research Article"}
                          </button>
                        ))}
                      </div>

                      {successMsg && (
                        <div className="mb-3 px-3 py-2 rounded-lg bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 text-xs">
                          {successMsg}
                        </div>
                      )}

                      {activeTab === "explainer" && <ExplainerForm onSuccess={handleSuccess} />}
                      {activeTab === "research"   && <ResearchForm  onSuccess={handleSuccess} />}
                    </>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}