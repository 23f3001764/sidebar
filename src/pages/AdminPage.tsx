/**
 * AdminPage — /admin route
 * Uses exact endpoints from OpenAPI v8:
 *   GET  /api/auth/users           — list all users
 *   GET  /api/auth/users/:uid      — single user
 *   PUT  /api/auth/users/:uid/role — update role
 *   PUT  /api/auth/users/:uid      — update fields
 *   DELETE /api/auth/users/:uid    — delete user
 *   PATCH /api/auth/users/:uid/subscribe/toggle — toggle subscription
 *   GET  /api/dashboard/admin      — platform stats
 *   GET  /api/dashboard/admin/events — event log
 */
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';
import { auth, dashboard, type User, type UserRole } from '@/lib/api';
import { SteamiLayout } from '@/components/SteamiLayout';
import {
  Users, Shield, Bell, Activity, Search, RefreshCw,
  Trash2, X, Check, Loader2, Eye, Edit2, Crown, TrendingUp,
} from 'lucide-react';

// ── Role badge ─────────────────────────────────────────────────────────────────
function RoleBadge({ role }: { role: UserRole }) {
  const map: Record<string, string> = {
    admin: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
    mod:   "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
    user:  "bg-white/5 text-white/40 border-white/10",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${map[role] ?? map.user}`}>
      {role === "admin" && <Crown size={8} />}
      {role === "mod"   && <Shield size={8} />}
      {role}
    </span>
  );
}

// ── Stat card ──────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color }: {
  icon: React.ReactNode; label: string; value: number | string; sub?: string; color: string;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-card relative p-5 overflow-hidden">
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>{icon}</div>
        <div>
          <p className="font-mono text-[9px] tracking-widest uppercase text-muted-foreground">{label}</p>
          <p className="font-mono text-xl font-bold text-foreground">{value}</p>
          {sub && <p className="font-mono text-[9px] text-muted-foreground">{sub}</p>}
        </div>
      </div>
    </motion.div>
  );
}

// ── User detail side panel ─────────────────────────────────────────────────────
function UserPanel({ user: u, onClose, onUpdate }: {
  user: User; onClose: () => void;
  onUpdate: (id: string, patch: Partial<User>) => void;
}) {
  const [role,    setRole]    = useState<UserRole>(u.role);
  const [saving,  setSaving]  = useState(false);
  const [toggling, setToggling] = useState(false);
  const [success, setSuccess] = useState('');

  async function saveRole() {
    if (role === u.role) return;
    setSaving(true);
    try {
      await auth.setUserRole(u.id, role);
      onUpdate(u.id, { role });
      setSuccess('Role updated!');
      setTimeout(() => setSuccess(''), 2000);
    } catch { /* ignore */ } finally { setSaving(false); }
  }

  async function toggleSub() {
    setToggling(true);
    try {
      const res = await auth.adminToggleSubscribe(u.id);
      onUpdate(u.id, { subscribe_email: res.subscribe_email });
      setSuccess(res.message);
      setTimeout(() => setSuccess(''), 2000);
    } catch { /* ignore */ } finally { setToggling(false); }
  }

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
      className="fixed right-0 top-12 bottom-0 z-[60] w-80 flex flex-col overflow-hidden"
      style={{ background: 'rgba(6,9,20,0.98)', borderLeft: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(24px)' }}>
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
        <span className="font-mono text-[10px] tracking-widest uppercase text-white/40">User Profile</span>
        <button onClick={onClose} className="p-1 text-white/30 hover:text-white transition-colors"><X size={14} /></button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold"
            style={{ background: 'hsl(var(--steami-cyan))', color: 'hsl(var(--background))' }}>
            {u.full_name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
          </div>
          <div>
            <p className="text-white font-semibold text-sm">{u.full_name}</p>
            <p className="text-white/40 text-[11px]">{u.email}</p>
          </div>
        </div>

        {success && (
          <div className="px-3 py-2 rounded-lg bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 text-[11px] font-mono">
            ✓ {success}
          </div>
        )}

        {/* Info rows */}
        {[
          { label: "Profession", value: u.profession },
          { label: "Interests",  value: u.interests?.join(", ") || "None" },
          { label: "Active",     value: u.is_active ? "✓ Yes" : "✗ No" },
          { label: "Onboarded",  value: u.onboarded  ? "✓ Yes" : "✗ No" },
          { label: "Joined",     value: u.created_at ? new Date(u.created_at).toLocaleDateString("en-GB") : "—" },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-start justify-between py-2 border-b border-white/[0.04] gap-4">
            <span className="font-mono text-[10px] text-white/30 uppercase tracking-wider shrink-0">{label}</span>
            <span className="font-mono text-[10px] text-white/70 text-right">{value}</span>
          </div>
        ))}

        {/* Subscribe toggle — PATCH /api/auth/users/:uid/subscribe/toggle */}
        <div>
          <p className="font-mono text-[10px] text-white/30 uppercase tracking-wider mb-2">Email Digest</p>
          <div className="flex items-center justify-between">
            <span className={`font-mono text-[11px] ${u.subscribe_email ? 'text-steami-gold' : 'text-white/30'}`}>
              {u.subscribe_email ? '✓ Subscribed' : '✗ Not subscribed'}
            </span>
            <button onClick={toggleSub} disabled={toggling}
              className="px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-wide transition-colors bg-white/[0.05] text-white/50 hover:text-white border border-white/[0.08] disabled:opacity-40">
              {toggling ? <Loader2 size={11} className="animate-spin" /> : 'Toggle'}
            </button>
          </div>
        </div>

        {/* Role editor — PUT /api/auth/users/:uid/role */}
        <div>
          <p className="font-mono text-[10px] text-white/30 uppercase tracking-wider mb-2">Role</p>
          <div className="flex flex-col gap-1.5">
            {(["user", "mod", "admin"] as UserRole[]).map(r => (
              <button key={r} onClick={() => setRole(r)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${role === r ? "bg-indigo-600/30 border border-indigo-500/40 text-white" : "bg-white/[0.04] border border-white/[0.06] text-white/40 hover:text-white"}`}>
                {r === "admin" && <Crown size={11} />}
                {r === "mod"   && <Shield size={11} />}
                {r === "user"  && <Users  size={11} />}
                {r}
                {role === r && <Check size={11} className="ml-auto" />}
              </button>
            ))}
          </div>
          <button onClick={saveRole} disabled={saving || role === u.role}
            className="mt-3 w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 transition-colors flex items-center justify-center gap-2">
            {saving ? <Loader2 size={13} className="animate-spin" /> : success ? <Check size={13} /> : <Edit2 size={13} />}
            {saving ? "Saving…" : "Update Role"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const { user, isAuthenticated } = useAuthStore();
  const [users,      setUsers]      = useState<User[]>([]);
  const [q,          setQ]          = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [loading,    setLoading]    = useState(true);
  const [selected,   setSelected]   = useState<User | null>(null);
  const [deleting,   setDeleting]   = useState<string | null>(null);
  const [activeTab,  setActiveTab]  = useState<'users' | 'events'>('users');
  const [adminStats, setAdminStats] = useState<any>(null);
  const [events,     setEvents]     = useState<any[]>([]);

  if (!isAuthenticated || user?.role !== "admin") return <Navigate to="/" replace />;

  // Load users — GET /api/auth/users
  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await auth.listUsers();
      setUsers(res.users ?? []);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  useEffect(() => {
    dashboard.admin().then(setAdminStats).catch(() => {});
    dashboard.adminEvents({ limit: 50 }).then(r => setEvents(r.events ?? [])).catch(() => {});
  }, []);

  // Filter users client-side
  const filtered = users.filter(u => {
    const matchQ    = !q || u.full_name.toLowerCase().includes(q.toLowerCase()) || u.email.toLowerCase().includes(q.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchQ && matchRole;
  });

  async function handleDelete(uid: string) {
    if (!confirm("Delete this user? This cannot be undone.")) return;
    setDeleting(uid);
    try {
      await auth.deleteUser(uid);
      setUsers(prev => prev.filter(u => u.id !== uid));
      if (selected?.id === uid) setSelected(null);
    } catch { /* ignore */ } finally { setDeleting(null); }
  }

  function handleUpdate(id: string, patch: Partial<User>) {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...patch } : u));
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, ...patch } : prev);
  }

  return (
    <SteamiLayout>
      <motion.div className="mb-6" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="steami-section-label mb-2"><Shield className="w-3.5 h-3.5 text-steami-gold inline mr-2" />ADMIN DASHBOARD</div>
        <h1 className="steami-heading text-2xl md:text-3xl">Intelligence Platform Admin</h1>
        <p className="text-[12px] font-light text-muted-foreground mt-1">Manage users, roles, subscriptions, and monitor activity.</p>
      </motion.div>

      {/* Stats */}
      {adminStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard icon={<Users size={16} />}      label="Total Events"  value={adminStats.total_events}  color="bg-steami-cyan/10 text-steami-cyan" />
          <StatCard icon={<Activity size={16} />}   label="Unique Users"  value={adminStats.unique_users}  color="bg-steami-violet/10 text-steami-violet" />
          <StatCard icon={<TrendingUp size={16} />} label="Total Users"   value={users.length}             color="bg-steami-green/10 text-steami-green" />
          <StatCard icon={<Bell size={16} />}       label="Subscribed"    value={users.filter(u => u.subscribe_email).length}  color="bg-steami-gold/10 text-steami-gold" />
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {(['users', 'events'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`font-mono text-[10px] tracking-widest uppercase px-4 py-2 rounded-lg transition-colors ${activeTab === tab ? "bg-indigo-600 text-white" : "bg-white/[0.05] text-white/40 hover:text-white"}`}>
            {tab === "users" ? `👥 Users (${filtered.length})` : "📋 Activity Log"}
          </button>
        ))}
      </div>

      {/* Users tab */}
      {activeTab === 'users' && (
        <div className="glass-card relative overflow-hidden">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-white/[0.06]">
            <div className="relative flex-1">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
              <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search name or email…"
                className="w-full pl-8 pr-3 py-2 rounded-lg text-xs text-white bg-white/[0.06] border border-white/[0.08] placeholder-white/20 focus:outline-none focus:border-indigo-500/50 transition-colors" />
            </div>
            <div className="flex gap-2">
              {['all', 'admin', 'mod', 'user'].map(r => (
                <button key={r} onClick={() => setRoleFilter(r)}
                  className={`font-mono text-[9px] tracking-wider uppercase px-2.5 py-1.5 rounded-md transition-colors ${roleFilter === r ? "bg-indigo-600/40 text-white border border-indigo-500/30" : "bg-white/[0.04] text-white/30 hover:text-white border border-white/[0.06]"}`}>
                  {r}
                </button>
              ))}
              <button onClick={loadUsers} className="p-2 rounded-lg bg-white/[0.04] text-white/30 hover:text-white border border-white/[0.06] transition-colors">
                <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/[0.05]">
                  {["User", "Email", "Role", "Profession", "Subscribed", "Actions"].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-mono text-[9px] tracking-widest uppercase text-white/25">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="text-center py-12"><Loader2 size={20} className="animate-spin mx-auto text-white/30" /></td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-white/25 font-mono">No users found</td></tr>
                ) : filtered.map((u, i) => (
                  <motion.tr key={u.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className={`border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors group ${selected?.id === u.id ? "bg-indigo-600/5" : ""}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                          style={{ background: 'hsl(var(--steami-cyan)/0.2)', color: 'hsl(var(--steami-cyan))' }}>
                          {u.full_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <span className="text-white/80 font-medium truncate max-w-[120px]">{u.full_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-white/40 font-mono text-[10px] truncate max-w-[160px]">{u.email}</td>
                    <td className="px-4 py-3"><RoleBadge role={u.role} /></td>
                    <td className="px-4 py-3 text-white/40 text-[10px] capitalize">{u.profession?.replace(/_/g, ' ')}</td>
                    <td className="px-4 py-3">
                      <span className={`font-mono text-[10px] ${u.subscribe_email ? "text-steami-gold" : "text-white/20"}`}>
                        {u.subscribe_email ? "✓ Yes" : "✗ No"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setSelected(u)} title="View / Edit"
                          className="p-1.5 rounded-md bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 transition-colors">
                          <Eye size={12} />
                        </button>
                        <button onClick={() => handleDelete(u.id)} disabled={deleting === u.id} title="Delete"
                          className="p-1.5 rounded-md bg-red-500/10 hover:bg-red-500/25 text-red-400 transition-colors disabled:opacity-40">
                          {deleting === u.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Events tab */}
      {activeTab === 'events' && (
        <div className="glass-card relative overflow-hidden">
          <div className="divide-y divide-white/[0.04]">
            {events.length === 0 ? (
              <div className="text-center py-12 text-white/25 font-mono text-xs">No events recorded</div>
            ) : events.map((ev, i) => (
              <motion.div key={ev.id ?? i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.02 }}
                className="flex items-center gap-4 px-5 py-3 hover:bg-white/[0.02] transition-colors">
                <div className="w-2 h-2 rounded-full bg-indigo-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="font-mono text-[11px] text-white/70">{ev.popup_type}</span>
                  {ev.popup_id    && <span className="font-mono text-[10px] text-white/30 ml-2">· {ev.popup_id.slice(0, 12)}</span>}
                  {ev.popup_title && <span className="font-mono text-[10px] text-white/20 ml-1 truncate">{ev.popup_title.slice(0, 40)}</span>}
                </div>
                {ev.uid && <span className="font-mono text-[9px] text-white/20 shrink-0">{ev.uid.slice(0, 8)}…</span>}
                <span className="font-mono text-[9px] text-white/20 shrink-0">
                  {ev.opened_at ? new Date(ev.opened_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Side panel */}
      <AnimatePresence>
        {selected && (
          <UserPanel user={selected} onClose={() => setSelected(null)} onUpdate={handleUpdate} />
        )}
      </AnimatePresence>
    </SteamiLayout>
  );
}
