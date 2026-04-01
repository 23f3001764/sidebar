import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { SteamiLayout } from '@/components/SteamiLayout';
import { useSteamiStore } from '@/stores/steami-store';
import { Link } from 'react-router-dom';
import { Trash2, ExternalLink, BookOpen, Sparkles, BarChart3, Activity, TrendingUp, Zap } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';

export default function DashboardPage() {
  const { diary, recommendations, removeDiaryEntry, clearDiary } = useSteamiStore();
  const [feedFilter, setFeedFilter] = useState<'all' | 'article' | 'news' | 'explainer'>('all');

  const filteredRecs = feedFilter === 'all'
    ? recommendations
    : recommendations.filter((r) => r.type === feedFilter);

  const stats = {
    totalNotes: diary.length,
    fields: [...new Set(diary.map((d) => d.field).filter(Boolean))].length,
    articles: diary.filter((d) => d.sourceType === 'article').length,
    explainers: diary.filter((d) => d.sourceType === 'explainer').length,
  };

  return (
    <SteamiLayout>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="steami-heading text-3xl md:text-4xl mb-3">📊 Intelligence Dashboard</h1>
        <p className="text-[13px] font-light text-muted-foreground max-w-xl leading-relaxed">
          Your personalized research hub. Notes, AI recommendations, and learning insights — all in one place.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'SAVED NOTES', value: stats.totalNotes, icon: BookOpen, color: 'steami-gold' },
          { label: 'FIELDS EXPLORED', value: stats.fields, icon: BarChart3, color: 'steami-cyan' },
          { label: 'ARTICLES READ', value: stats.articles, icon: Activity, color: 'steami-green' },
          { label: 'EXPLAINERS', value: stats.explainers, icon: Zap, color: 'steami-violet' },
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
            className="glass-card relative p-5 overflow-hidden text-center"
          >
            <stat.icon className={`w-5 h-5 mx-auto mb-2 text-${stat.color}`} />
            <div className="font-mono text-2xl font-bold text-foreground mb-1">{stat.value}</div>
            <div className="font-mono text-[9px] tracking-wider uppercase text-muted-foreground">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Research Diary Storage */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="steami-section-label mb-0">📝 RESEARCH DIARY</div>
            {diary.length > 0 && (
              <button onClick={clearDiary} className="steami-btn text-[8px] py-1 px-2.5" style={{ borderColor: 'rgba(252, 92, 101, 0.3)', color: 'hsl(var(--steami-red))' }}>
                CLEAR ALL
              </button>
            )}
          </div>

          {diary.length === 0 ? (
            <div className="glass-card relative p-10 text-center overflow-hidden">
              <div className="text-4xl mb-4">📝</div>
              <p className="font-mono text-sm text-muted-foreground mb-2">No notes saved yet</p>
              <p className="text-[12px] font-light text-muted-foreground mb-5">
                Select text in any Explainer or Research Article to save it here.
              </p>
              <div className="flex gap-2 justify-center">
                <Link to="/" className="steami-btn text-[9px]">
                  <BookOpen className="w-3 h-3" /> EXPLAINERS
                </Link>
                <Link to="/research" className="steami-btn steami-btn-gold text-[9px]">
                  <ExternalLink className="w-3 h-3" /> RESEARCH
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {diary.map((entry, idx) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="glass-card relative p-4 overflow-hidden group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`steami-badge text-[7px] ${entry.sourceType === 'article' ? 'steami-badge-cyan' : 'steami-badge-violet'}`}>
                          {entry.sourceType}
                        </span>
                        {entry.field && (
                          <span className="steami-badge steami-badge-gold text-[7px]">{entry.field}</span>
                        )}
                        <span className="font-mono text-[8px] text-muted-foreground">
                          {new Date(entry.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-[12px] font-light text-foreground/80 leading-relaxed mb-1">"{entry.text}"</p>
                      <p className="font-mono text-[9px] text-muted-foreground">from: {entry.source}</p>
                    </div>
                    <button
                      onClick={() => removeDiaryEntry(entry.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-steami-red"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* AI Feed */}
          <div>
            <div className="steami-section-label mb-3">🤖 AI FEED</div>
            <div className="flex gap-1 mb-3">
              {(['all', 'article', 'news', 'explainer'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFeedFilter(f)}
                  className={`font-mono text-[8px] tracking-wider uppercase px-3 py-1.5 rounded-md transition-all ${
                    feedFilter === f
                      ? 'text-steami-gold bg-steami-gold/10 border-steami-gold/30'
                      : 'text-muted-foreground hover:text-foreground bg-transparent'
                  }`}
                  style={{
                    border: `1px solid ${feedFilter === f ? 'rgba(232, 184, 75, 0.3)' : 'rgba(99, 179, 237, 0.1)'}`,
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="space-y-2">
              {filteredRecs.map((rec, idx) => (
                <motion.div
                  key={rec.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.06 }}
                  className="glass-card relative p-4 overflow-hidden cursor-pointer"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`steami-badge text-[7px] ${rec.type === 'article' ? 'steami-badge-cyan' : rec.type === 'news' ? 'steami-badge-green' : 'steami-badge-violet'}`}>
                      {rec.type}
                    </span>
                    <span className="steami-badge steami-badge-gold text-[7px]">{rec.field}</span>
                  </div>
                  <h4 className="font-serif text-[12px] font-bold text-foreground leading-snug mb-1">{rec.title}</h4>
                  <p className="text-[10px] font-light text-muted-foreground leading-relaxed">{rec.description}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* User Intelligence */}
          <div>
            <div className="steami-section-label mb-3">📊 INTELLIGENCE PROFILE</div>
            <div className="glass-card relative p-5 overflow-hidden">
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              >
                <ResponsiveContainer width="100%" height={240}>
                  <RadarChart
                    cx="50%"
                    cy="50%"
                    outerRadius="70%"
                    data={[
                      { metric: 'Research Depth', value: Math.min(100, stats.totalNotes * 15), fullMark: 100 },
                      { metric: 'Field Diversity', value: Math.min(100, stats.fields * 20), fullMark: 100 },
                      { metric: 'Engagement', value: Math.min(100, (stats.articles + stats.explainers) * 12), fullMark: 100 },
                      { metric: 'Articles', value: Math.min(100, stats.articles * 25), fullMark: 100 },
                      { metric: 'Explainers', value: Math.min(100, stats.explainers * 25), fullMark: 100 },
                      { metric: 'Consistency', value: Math.min(100, stats.totalNotes * 10), fullMark: 100 },
                    ]}
                  >
                    <PolarGrid
                      stroke="hsl(207 72% 65% / 0.12)"
                      strokeWidth={0.5}
                    />
                    <PolarAngleAxis
                      dataKey="metric"
                      tick={{ fill: 'hsl(210 25% 55%)', fontSize: 9, fontFamily: 'var(--font-mono)' }}
                    />
                    <PolarRadiusAxis
                      angle={90}
                      domain={[0, 100]}
                      tick={false}
                      axisLine={false}
                    />
                    <Radar
                      name="Profile"
                      dataKey="value"
                      stroke="hsl(207 72% 65%)"
                      strokeWidth={2}
                      fill="hsl(207 72% 65%)"
                      fillOpacity={0.15}
                      dot={{
                        r: 3,
                        fill: 'hsl(207 72% 65%)',
                        stroke: 'hsl(207 72% 85%)',
                        strokeWidth: 1,
                      }}
                      activeDot={{
                        r: 5,
                        fill: 'hsl(42 75% 60%)',
                        stroke: 'hsl(42 75% 70%)',
                        strokeWidth: 2,
                      }}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const data = payload[0].payload;
                        return (
                          <div className="glass-card relative px-3 py-2 overflow-hidden !border-steami-cyan/30">
                            <p className="font-mono text-[9px] text-muted-foreground uppercase tracking-wider">{data.metric}</p>
                            <p className="font-mono text-sm font-bold text-foreground">{data.value}%</p>
                          </div>
                        );
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </motion.div>
              <div className="mt-2 pt-3 border-t border-steami-cyan/10">
                <div className="flex items-center gap-2 text-steami-cyan font-mono text-[9px]">
                  <TrendingUp className="w-3 h-3" />
                  {stats.totalNotes > 0
                    ? 'Your research activity is growing. Keep exploring!'
                    : 'Start exploring to build your intelligence profile.'
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SteamiLayout>
  );
}
