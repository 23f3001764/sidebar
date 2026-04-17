/**
 * DashboardPage.tsx
 * User dashboard:
 * - Profile editing (name, profession, password)
 * - Email subscription toggle
 * - Interests management
 * - Research diary
 * - Recent dashboard events/stats
 */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, BookOpen, Bell, Tag, Save,
  Trash2, Edit3, X, Loader2, TrendingUp,
  Eye, Check, Lock, ChevronDown,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useSteamiStore } from "@/stores/steami-store";
import { useNavigate } from "react-router-dom";
import { auth, dashboard, type Profession } from "@/lib/api";
import { SteamiLayout } from "@/components/SteamiLayout";

const PROFESSIONS: { value: Profession; label: string }[] = [
  { value: "student",              label: "Student" },
  { value: "professor",            label: "Professor" },
  { value: "working_professional", label: "Working Professional" },
  { value: "other",                label: "Other" },
];

const TOPICS = [
  { id: "PHYSICS",            label: "Physics",            icon: "⚛️" },
  { id: "CHEMISTRY",          label: "Chemistry",          icon: "🧪" },
  { id: "BIOLOGY",            label: "Biology",            icon: "🧬" },
  { id: "MEDICINE",           label: "Medicine",           icon: "💊" },
  { id: "EARTH & SPACE",      label: "Earth & Space",      icon: "🌍" },
  { id: "COMPUTER SCIENCE",   label: "Computer Science",   icon: "💻" },
  { id: "AI + ROBOTICS",      label: "AI + Robotics",      icon: "🤖" },
  { id: "ENGINEERING",        label: "Engineering",        icon: "⚙️" },
  { id: "MATHEMATICS & DATA", label: "Math & Data",        icon: "📐" },
  { id: "CLIMATE & ENERGY",   label: "Climate & Energy",   icon: "🌱" },
];

// ── Profile card ──────────────────────────────────────────────────────────────
function ProfileCard() {
  const { user, fetchMe, toggleSubscribe } = useAuthStore();
  const [editing,    setEditing]    = useState(false);
  const [showPwForm, setShowPwForm] = useState(false);
  const [form, setForm] = useState({
    full_name:        user?.full_name ?? "",
    profession:       user?.profession ?? "student" as Profession,
    current_password: "",
    new_password:     "",
  });
  const [loading,  setLoading]  = useState(false);
  const [subLoad,  setSubLoad]  = useState(false);
  const [msg,      setMsg]      = useState("");
  const [err,      setErr]      = useState("");

  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(""), 3000); };
  const error = (e: string) => { setErr(e); setTimeout(() => setErr(""), 5000); };

  async function saveProfile() {
    setLoading(true);
    try {
      const body: any = { full_name: form.full_name, profession: form.profession };
      if (showPwForm && form.current_password && form.new_password) {
        body.current_password = form.current_password;
        body.new_password = form.new_password;
      }
      await auth.updateProfile(body);
      await fetchMe();
      setEditing(false);
      setShowPwForm(false);
      flash("✓ Profile updated");
    } catch (e: any) { error(e.message); }
    setLoading(false);
  }

  async function handleSubscribe() {
    setSubLoad(true);
    try { await toggleSubscribe(); } catch (e: any) { error(e.message); }
    setSubLoad(false);
  }

  if (!user) return null;
  const initials = user.full_name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="glass-card rounded-2xl p-6 space-y-5">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600/25 border border-indigo-500/20
            flex items-center justify-center text-indigo-200 text-xl font-bold">
            {initials}
          </div>
          <div>
            <h2 className="steami-heading text-lg">{user.full_name}</h2>
            <p className="text-white/40 text-xs font-mono">{user.email}</p>
            <span className="mt-1 inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase"
              style={{
                background: user.role === "admin" ? "rgba(232,184,75,0.12)" : "rgba(111,168,255,0.1)",
                color: user.role === "admin" ? "hsl(43,68%,52%)" : "hsl(218,100%,72%)",
                border: `1px solid ${user.role === "admin" ? "rgba(232,184,75,0.25)" : "rgba(111,168,255,0.2)"}`,
              }}>
              {user.role}
            </span>
          </div>
        </div>
        <button onClick={() => setEditing(e => !e)}
          className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-white/40
            hover:text-white transition-colors">
          <Edit3 size={14} />
        </button>
      </div>

      {msg && <div className="px-3 py-2 rounded-lg bg-emerald-600/15 border border-emerald-500/25 text-emerald-400 text-xs">{msg}</div>}
      {err && <div className="px-3 py-2 rounded-lg bg-red-600/10 border border-red-500/20 text-red-400 text-xs">{err}</div>}

      {/* Edit form */}
      <AnimatePresence>
        {editing && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} className="overflow-hidden space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-mono text-[9px] uppercase tracking-wider text-white/30">Full Name</label>
                <input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-white/[0.07] border border-white/10
                    text-white text-xs focus:outline-none focus:border-indigo-500/50" />
              </div>
              <div className="space-y-1">
                <label className="font-mono text-[9px] uppercase tracking-wider text-white/30">Profession</label>
                <select value={form.profession}
                  onChange={e => setForm(f => ({ ...f, profession: e.target.value as Profession }))}
                  className="w-full px-3 py-2 rounded-lg bg-white/[0.07] border border-white/10
                    text-white text-xs focus:outline-none focus:border-indigo-500/50 appearance-none">
                  {PROFESSIONS.map(p => (
                    <option key={p.value} value={p.value} className="bg-[#080c18]">{p.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Password toggle */}
            <button onClick={() => setShowPwForm(v => !v)}
              className="flex items-center gap-2 text-[10px] text-white/40 hover:text-white font-mono uppercase tracking-wider transition-colors">
              <Lock size={11} />
              {showPwForm ? "Hide password form" : "Change password"}
              <ChevronDown size={10} className={`transition-transform ${showPwForm ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
              {showPwForm && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }} className="overflow-hidden grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-mono text-[9px] uppercase tracking-wider text-white/30">Current Password</label>
                    <input type="password" value={form.current_password}
                      onChange={e => setForm(f => ({ ...f, current_password: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg bg-white/[0.07] border border-white/10
                        text-white text-xs focus:outline-none focus:border-indigo-500/50" />
                  </div>
                  <div className="space-y-1">
                    <label className="font-mono text-[9px] uppercase tracking-wider text-white/30">New Password</label>
                    <input type="password" value={form.new_password}
                      onChange={e => setForm(f => ({ ...f, new_password: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg bg-white/[0.07] border border-white/10
                        text-white text-xs focus:outline-none focus:border-indigo-500/50" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-2">
              <button onClick={() => { setEditing(false); setShowPwForm(false); }}
                className="px-4 py-2 rounded-lg bg-white/[0.05] text-white/40 text-xs hover:bg-white/10 transition-colors">
                Cancel
              </button>
              <button onClick={saveProfile} disabled={loading}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500
                  text-white text-xs font-semibold disabled:opacity-50 transition-colors">
                {loading ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                Save Profile
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Email subscription */}
      <div className="flex items-center justify-between pt-1 border-t border-white/[0.07]">
        <div className="flex items-center gap-2">
          <Bell size={13} className={user.subscribe_email ? "text-amber-400" : "text-white/30"} />
          <span className="text-xs text-white/60">Daily digest email</span>
        </div>
        <button onClick={handleSubscribe} disabled={subLoad}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-mono
            uppercase tracking-wider transition-all disabled:opacity-50 ${
            user.subscribe_email
              ? "bg-amber-500/15 border border-amber-500/25 text-amber-400"
              : "bg-white/[0.05] border border-white/10 text-white/40 hover:text-white"
          }`}>
          {subLoad ? <Loader2 size={10} className="animate-spin" /> :
            user.subscribe_email ? <><Check size={10} /> Subscribed</> : "Subscribe"}
        </button>
      </div>
    </div>
  );
}

// ── Interests card ────────────────────────────────────────────────────────────
function InterestsCard() {
  const { user, saveInterests } = useAuthStore();
  const [selected, setSelected] = useState<string[]>(user?.interests ?? []);
  const [loading,  setLoading]  = useState(false);
  const [saved,    setSaved]    = useState(false);

  function toggle(id: string) {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    setSaved(false);
  }

  async function save() {
    setLoading(true);
    try {
      await saveInterests(selected);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {}
    setLoading(false);
  }

  return (
    <div className="glass-card rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tag size={14} className="text-indigo-400" />
          <h3 className="font-mono text-[10px] uppercase tracking-widest text-white/60">My Interests</h3>
        </div>
        <span className="text-[10px] text-white/25 font-mono">{selected.length} selected</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {TOPICS.map(topic => {
          const on = selected.includes(topic.id);
          return (
            <button key={topic.id} onClick={() => toggle(topic.id)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left transition-all ${
                on
                  ? "bg-indigo-600/20 border-indigo-500/40 text-white"
                  : "bg-white/[0.03] border-white/[0.07] text-white/45 hover:bg-white/[0.06] hover:text-white"
              }`}>
              <span className="text-sm shrink-0">{topic.icon}</span>
              <span className="text-[11px] font-semibold leading-tight">{topic.label}</span>
              {on && <Check size={11} className="ml-auto text-indigo-400 shrink-0" />}
            </button>
          );
        })}
      </div>
      <button onClick={save} disabled={loading}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500
          text-white text-xs font-semibold disabled:opacity-50 transition-colors">
        {loading ? <Loader2 size={12} className="animate-spin" /> :
          saved ? <Check size={12} /> : <Save size={12} />}
        {saved ? "Saved!" : "Save Interests"}
      </button>
    </div>
  );
}

// ── Diary card ────────────────────────────────────────────────────────────────
function DiaryCard() {
  const { diary, removeDiaryEntry } = useSteamiStore();
  const [editing, setEditing] = useState<string | null>(null);
  const [note,    setNote]    = useState("");

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-white/[0.07] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen size={14} className="text-amber-400" />
          <h3 className="font-mono text-[10px] uppercase tracking-widest text-white/60">Research Diary</h3>
        </div>
        <span className="text-[10px] text-white/25 font-mono">{diary.length} notes</span>
      </div>

      {diary.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-white/20">
          <BookOpen size={28} />
          <p className="text-sm">No notes yet. Select text on any page to save to diary.</p>
        </div>
      ) : (
        <div className="divide-y divide-white/[0.04] max-h-[500px] overflow-y-auto">
          {diary.map((entry: any) => (
            <div key={entry.id} className="px-5 py-4 group">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-white/80 text-sm leading-relaxed italic">
                    "{entry.text}"
                  </p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="text-[9px] text-amber-400/70 font-mono">{entry.source}</span>
                    {entry.field && (
                      <span className="text-[9px] text-white/25 font-mono">{entry.field}</span>
                    )}
                    {entry.created_at && (
                      <span className="text-[9px] text-white/15">
                        {new Date(entry.created_at).toLocaleDateString("en-GB", {
                          day: "numeric", month: "short",
                        })}
                      </span>
                    )}
                  </div>
                  {/* Note */}
                  {entry.note && editing !== entry.id && (
                    <p className="mt-2 text-xs text-white/50 bg-white/[0.04] rounded-lg px-3 py-2">
                      {entry.note}
                    </p>
                  )}
                  {editing === entry.id && (
                    <div className="mt-2 space-y-2">
                      <textarea value={note} onChange={e => setNote(e.target.value)} rows={2}
                        className="w-full px-3 py-2 rounded-lg bg-white/[0.07] border border-white/10
                          text-white text-xs placeholder-white/25 focus:outline-none resize-none" />
                      <div className="flex gap-2">
                        <button onClick={() => setEditing(null)}
                          className="text-[10px] text-white/30 hover:text-white px-2 py-1">Cancel</button>
                        <button onClick={() => setEditing(null)}
                          className="text-[10px] text-indigo-400 hover:text-indigo-300 px-2 py-1">Save</button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setEditing(entry.id); setNote(entry.note ?? ""); }}
                    className="p-1.5 rounded-lg text-white/25 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors">
                    <Edit3 size={11} />
                  </button>
                  <button onClick={() => removeDiaryEntry(entry.id)}
                    className="p-1.5 rounded-lg text-white/25 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Stats card ────────────────────────────────────────────────────────────────
function StatsCard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboard.me()
      .then(s => { setStats(s); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="glass-card rounded-2xl p-6 flex items-center justify-center h-36">
      <Loader2 size={20} className="animate-spin text-white/30" />
    </div>
  );
  if (!stats) return null;

  return (
    <div className="glass-card rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-2">
        <TrendingUp size={14} className="text-indigo-400" />
        <h3 className="font-mono text-[10px] uppercase tracking-widest text-white/60">Activity Stats</h3>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-3 text-center">
          <p className="text-2xl font-bold text-white">{stats.total_events ?? 0}</p>
          <p className="text-[9px] font-mono text-white/30 uppercase mt-0.5">Events</p>
        </div>
        <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-3 text-center">
          <p className="text-2xl font-bold text-white">{Object.keys(stats.by_type ?? {}).length}</p>
          <p className="text-[9px] font-mono text-white/30 uppercase mt-0.5">Types</p>
        </div>
      </div>
      {stats.most_opened?.length > 0 && (
        <div>
          <p className="font-mono text-[9px] uppercase tracking-wider text-white/25 mb-2">Most Opened</p>
          <div className="space-y-1.5">
            {stats.most_opened.slice(0, 5).map((t: any) => (
              <div key={`${t.popup_type}-${t.popup_id}`} className="flex items-center gap-2">
                <div className="flex-1 h-1.5 rounded-full bg-white/[0.07] overflow-hidden">
                  <div className="h-full rounded-full bg-indigo-500"
                    style={{ width: `${Math.min(100, (t.count / (stats.most_opened[0]?.count || 1)) * 100)}%` }} />
                </div>
                <span className="text-[10px] text-white/40 font-mono w-24 truncate">{t.popup_title || t.popup_id}</span>
                <span className="text-[9px] text-white/25 w-5 text-right">{t.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {stats.recent?.length > 0 && (
        <div>
          <p className="font-mono text-[9px] uppercase tracking-wider text-white/25 mb-2">Recent Activity</p>
          <div className="space-y-1">
            {stats.recent.slice(0, 5).map((e: any, i: number) => (
              <div key={i} className="flex items-center gap-2">
                <Eye size={9} className="text-white/20 shrink-0" />
                <span className="text-[10px] text-white/45 truncate flex-1">{e.popup_title || e.popup_id}</span>
                <span className="text-[9px] text-white/20 font-mono shrink-0">{e.popup_type}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
type Tab = "profile" | "interests" | "diary" | "stats";

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("profile");

  useEffect(() => {
    if (!isAuthenticated) navigate("/");
  }, [isAuthenticated, navigate]);

  if (!user) return null;

  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: "profile",   label: "Profile",   icon: User     },
    { key: "interests", label: "Interests", icon: Tag      },
    { key: "diary",     label: "Diary",     icon: BookOpen },
    { key: "stats",     label: "Stats",     icon: TrendingUp },
  ];

  return (
    <SteamiLayout>
      <div className="max-w-3xl mx-auto space-y-6 pt-4">
        {/* Header */}
        <div>
          <h1 className="steami-heading text-2xl">My Dashboard</h1>
          <p className="text-white/30 text-sm mt-1">Welcome back, {user.full_name}</p>
        </div>

        {/* Tab nav */}
        <div className="flex gap-1 p-1 rounded-xl"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
          {tabs.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg
                font-mono text-[10px] uppercase tracking-wider transition-all ${
                tab === key
                  ? "bg-indigo-600 text-white"
                  : "text-white/40 hover:text-white"
              }`}>
              <Icon size={12} /> <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div key={tab}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
            {tab === "profile"   && <ProfileCard   />}
            {tab === "interests" && <InterestsCard />}
            {tab === "diary"     && <DiaryCard     />}
            {tab === "stats"     && <StatsCard     />}
          </motion.div>
        </AnimatePresence>
      </div>
    </SteamiLayout>
  );
}
