import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SteamiLayout } from '@/components/SteamiLayout';
import { TextSelectionPopover } from '@/components/TextSelectionPopover';
import { articles, FIELDS, FIELD_ICONS, FIELD_COLORS, type Field, type Article } from '@/data/research-articles';
import { useSteamiStore } from '@/stores/steami-store';
import { X, ChevronLeft, ChevronRight, BookOpen, Network, FileText, Sparkles } from 'lucide-react';

export default function ResearchPage() {
  const [activeField, setActiveField] = useState<Field>('PHYSICS');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [scrollPos, setScrollPos] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const diary = useSteamiStore((s) => s.diary);
  const recommendations = useSteamiStore((s) => s.recommendations);

  const filtered = articles.filter((a) => a.field === activeField);

  const fieldScrollRef = useRef<HTMLDivElement>(null);
  const scrollFields = (dir: number) => {
    if (fieldScrollRef.current) {
      fieldScrollRef.current.scrollBy({ left: dir * 200, behavior: 'smooth' });
    }
  };

  return (
    <SteamiLayout>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="steami-heading text-3xl md:text-4xl mb-3">📚 Research Articles</h1>
        <p className="text-[13px] font-light text-muted-foreground max-w-xl leading-relaxed">
          Deep research environment across 11 scientific fields. Click articles for full study with knowledge tools.
        </p>
      </div>

      {/* Field Selector */}
      <div className="relative mb-6">
        <button
          onClick={() => scrollFields(-1)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-steami-cyan"
          style={{ background: 'rgba(3, 8, 20, 0.8)' }}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div
          ref={fieldScrollRef}
          className="flex gap-2 overflow-x-auto scrollbar-hide py-2 px-10"
          style={{ scrollbarWidth: 'none' }}
        >
          {FIELDS.map((field) => (
            <button
              key={field}
              onClick={() => setActiveField(field)}
              className={`shrink-0 font-mono text-[9px] tracking-wider uppercase px-4 py-2.5 rounded-lg transition-all flex items-center gap-2 ${
                activeField === field
                  ? 'text-steami-gold border-steami-gold/50'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              style={{
                border: `1px solid ${activeField === field ? 'rgba(232, 184, 75, 0.5)' : 'rgba(99, 179, 237, 0.14)'}`,
                background: activeField === field ? 'rgba(232, 184, 75, 0.12)' : 'rgba(8, 18, 40, 0.4)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <span>{FIELD_ICONS[field]}</span>
              {field}
            </button>
          ))}
        </div>
        <button
          onClick={() => scrollFields(1)}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-steami-cyan"
          style={{ background: 'rgba(3, 8, 20, 0.8)' }}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Article Cards */}
      <div className="steami-section-label">{FIELD_ICONS[activeField]} {activeField} — {filtered.length} ARTICLES</div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
        <AnimatePresence mode="popLayout">
          {filtered.map((article, idx) => (
            <motion.div
              key={article.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: idx * 0.05 }}
              className="glass-card relative p-5 cursor-pointer hover:translate-y-[-2px] transition-transform overflow-hidden"
              onClick={() => setSelectedArticle(article)}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className={`steami-badge steami-badge-${FIELD_COLORS[article.field]} text-[8px]`}>
                  {article.field}
                </span>
                <span className="font-mono text-[9px] text-muted-foreground">{article.readTime}</span>
              </div>
              <h3 className="font-serif text-sm font-bold mb-2 leading-snug text-foreground">{article.title}</h3>
              <p className="text-[11px] font-light text-muted-foreground leading-relaxed line-clamp-3">{article.abstract}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="font-mono text-[9px] text-muted-foreground">{article.author}</span>
                <span className="font-mono text-[9px] text-muted-foreground">{article.date}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {filtered.length === 0 && (
          <div className="col-span-full py-16 text-center text-muted-foreground font-mono text-sm">
            No articles in this field yet. More coming soon.
          </div>
        )}
      </div>

      {/* Full Article Modal */}
      <AnimatePresence>
        {selectedArticle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex p-4"
            style={{ background: 'rgba(2, 8, 18, 0.85)', backdropFilter: 'blur(8px)' }}
            onClick={() => setSelectedArticle(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="flex flex-1 max-w-[1100px] mx-auto gap-4 max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Main Content */}
              <div
                ref={contentRef}
                className="flex-1 overflow-y-auto rounded-xl"
                style={{
                  background: 'rgba(5, 14, 32, 0.92)',
                  backdropFilter: 'blur(24px) saturate(160%)',
                  border: '1px solid rgba(255, 255, 255, 0.07)',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
                }}
              >
                <TextSelectionPopover
                  containerRef={contentRef as React.RefObject<HTMLDivElement>}
                  source={selectedArticle.title}
                  sourceType="article"
                  field={selectedArticle.field}
                />

                {/* Header */}
                <div className="sticky top-0 z-10 px-7 py-4 flex items-center justify-between border-b border-foreground/5"
                  style={{ background: 'rgba(5, 14, 32, 0.95)', backdropFilter: 'blur(20px)' }}
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`steami-badge steami-badge-${FIELD_COLORS[selectedArticle.field]}`}>{selectedArticle.field}</span>
                    <span className="font-mono text-[9px] text-muted-foreground">{selectedArticle.readTime}</span>
                  </div>
                  <button onClick={() => setSelectedArticle(null)} className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-steami-red transition-colors" style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(10,25,55,0.4)' }}>
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Article Body */}
                <div className="p-7">
                  <h2 className="steami-heading text-2xl mb-2">{selectedArticle.title}</h2>
                  <div className="flex items-center gap-3 mb-5 font-mono text-[10px] text-muted-foreground">
                    <span>{selectedArticle.author}</span>
                    <span>·</span>
                    <span>{selectedArticle.date}</span>
                  </div>

                  {/* Abstract */}
                  <div className="text-sm font-light leading-relaxed text-muted-foreground mb-6 pl-5 border-l-2 border-steami-gold/50" style={{ fontStyle: 'italic', color: '#8aacca' }}>
                    {selectedArticle.abstract}
                  </div>

                  {/* Content */}
                  {selectedArticle.content.map((para, i) => (
                    <p key={i} className="text-[13px] font-light leading-relaxed text-foreground/80 mb-5">{para}</p>
                  ))}

                  {/* Quotes */}
                  {selectedArticle.quotes.map((quote, i) => (
                    <blockquote key={i} className="my-6 p-4 rounded-lg" style={{ background: 'rgba(232, 184, 75, 0.06)', borderLeft: '3px solid hsl(var(--steami-gold))' }}>
                      <p className="text-sm font-light leading-relaxed text-steami-gold2 italic">{quote}</p>
                    </blockquote>
                  ))}

                  {/* Key Findings */}
                  <div className="rounded-xl p-5 mt-6" style={{ background: 'rgba(6, 16, 38, 0.5)', border: '1px solid rgba(99, 179, 237, 0.14)' }}>
                    <div className="font-mono text-[10px] tracking-wider uppercase text-steami-cyan mb-3 flex items-center gap-2">
                      <Sparkles className="w-3 h-3" /> KEY FINDINGS
                    </div>
                    {selectedArticle.keyFindings.map((f, i) => (
                      <div key={i} className="flex items-start gap-2 py-1.5 border-b border-steami-cyan/5 last:border-0">
                        <span className="text-steami-cyan text-xs mt-0.5">◆</span>
                        <span className="font-mono text-[11px] text-muted-foreground leading-relaxed">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Sidebar */}
              <div className="w-72 hidden lg:flex flex-col gap-3 overflow-y-auto">
                {/* Knowledge Map */}
                <div className="rounded-xl p-4" style={{ background: 'rgba(5, 14, 32, 0.88)', border: '1px solid rgba(99, 179, 237, 0.14)' }}>
                  <div className="font-mono text-[10px] tracking-wider uppercase text-steami-cyan mb-3 flex items-center gap-2">
                    <Network className="w-3 h-3" /> KNOWLEDGE MAP
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedArticle.relatedTopics.map((topic) => (
                      <span key={topic} className="steami-badge steami-badge-cyan text-[8px]">{topic}</span>
                    ))}
                    <span className="steami-badge steami-badge-gold text-[8px]">{selectedArticle.field}</span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-steami-cyan/10">
                    <div className="font-mono text-[9px] text-muted-foreground mb-2">RELATED ARTICLES</div>
                    {articles.filter(a => a.id !== selectedArticle.id && a.field === selectedArticle.field).slice(0, 2).map(a => (
                      <button
                        key={a.id}
                        onClick={() => setSelectedArticle(a)}
                        className="block w-full text-left p-2 rounded-md mb-1 hover:bg-steami-cyan/5 transition-colors"
                      >
                        <div className="font-serif text-[11px] font-bold text-foreground leading-tight">{a.title}</div>
                        <div className="font-mono text-[9px] text-muted-foreground mt-1">{a.author}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Research Diary */}
                <div className="rounded-xl p-4" style={{ background: 'rgba(5, 14, 32, 0.88)', border: '1px solid rgba(232, 184, 75, 0.14)' }}>
                  <div className="font-mono text-[10px] tracking-wider uppercase text-steami-gold mb-3 flex items-center gap-2">
                    <FileText className="w-3 h-3" /> RESEARCH DIARY
                  </div>
                  {diary.length === 0 ? (
                    <p className="font-mono text-[10px] text-muted-foreground">Select text in any article to save notes here.</p>
                  ) : (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {diary.slice(0, 5).map((entry) => (
                        <div key={entry.id} className="p-2 rounded-md text-[10px] font-mono text-muted-foreground" style={{ background: 'rgba(232, 184, 75, 0.05)', border: '1px solid rgba(232, 184, 75, 0.1)' }}>
                          "{entry.text.slice(0, 80)}..."
                          <div className="text-[8px] mt-1 text-steami-gold/60">{entry.source}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* AI Recommendations */}
                <div className="rounded-xl p-4" style={{ background: 'rgba(5, 14, 32, 0.88)', border: '1px solid rgba(167, 139, 250, 0.14)' }}>
                  <div className="font-mono text-[10px] tracking-wider uppercase text-steami-violet mb-3 flex items-center gap-2">
                    <Sparkles className="w-3 h-3" /> AI RECOMMENDATIONS
                  </div>
                  {recommendations.slice(0, 3).map((rec) => (
                    <div key={rec.id} className="p-2 rounded-md mb-1.5" style={{ background: 'rgba(167, 139, 250, 0.04)', border: '1px solid rgba(167, 139, 250, 0.08)' }}>
                      <div className="font-serif text-[11px] font-bold text-foreground leading-tight">{rec.title}</div>
                      <div className="text-[9px] font-light text-muted-foreground mt-1 leading-relaxed">{rec.description.slice(0, 80)}...</div>
                      <span className="steami-badge steami-badge-violet text-[7px] mt-1.5 inline-block">{rec.field}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </SteamiLayout>
  );
}
