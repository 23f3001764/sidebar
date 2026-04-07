import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SteamiLayout } from '@/components/SteamiLayout';
import { TextSelectionPopover } from '@/components/TextSelectionPopover';
import { KnowledgeGraph } from '@/components/KnowledgeGraph';
import { ShareMenu } from '@/components/ShareMenu';
import { useSteamiStore } from '@/stores/steami-store';
import { staggerContainer, cardVariants, cardHover, cardTap, overlayVariants, modalVariants, fadeInUp } from '@/lib/motion';
import { X, ChevronLeft, ChevronRight, Network, FileText, Sparkles, Link } from 'lucide-react';
import { getResearchArticles, type Article } from '@/lib/content-api';
import { useDeepLink, clearDeepLinkParam, setDeepLinkParam } from '@/hooks/useDeepLink';

const FIELDS_FALLBACK = ["PHYSICS","CHEMISTRY","BIOLOGY","MEDICINE","EARTH & SPACE","COMPUTER SCIENCE","AI","ROBOTICS","ENGINEERING","MATHEMATICS & DATA","CLIMATE & ENERGY"];
const FIELD_ICONS_FB: Record<string,string> = {"PHYSICS":"⚛️","CHEMISTRY":"🧪","BIOLOGY":"🧬","MEDICINE":"💊","EARTH & SPACE":"🌍","COMPUTER SCIENCE":"💻","AI":"🤖","ROBOTICS":"🦾","ENGINEERING":"⚙️","MATHEMATICS & DATA":"📐","CLIMATE & ENERGY":"🌱"};
const FIELD_COLORS_FB: Record<string,string> = {"PHYSICS":"cyan","CHEMISTRY":"orange","BIOLOGY":"green","MEDICINE":"red","EARTH & SPACE":"violet","COMPUTER SCIENCE":"cyan","AI":"violet","ROBOTICS":"orange","ENGINEERING":"gold","MATHEMATICS & DATA":"cyan","CLIMATE & ENERGY":"green"};

function CategorySlider({ field, fieldIcon, fieldColor, articles, onSelect }: {
  field: string; fieldIcon: string; fieldColor: string;
  articles: Article[]; onSelect: (a: Article) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const fieldArts = articles.filter(a => a.field === field);
  if (fieldArts.length === 0) return null;
  const scroll = (dir: number) => scrollRef.current?.scrollBy({ left: dir * 320, behavior: 'smooth' });

  return (
    <motion.div className="mb-8" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="steami-section-label mb-3">{fieldIcon} {field} — {fieldArts.length} ARTICLES</div>
      <div className="relative group">
        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => scroll(-1)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-steami-cyan transition-colors opacity-0 group-hover:opacity-100"
          style={{ background: 'rgba(3,8,20,0.9)', border: '1px solid rgba(99,179,237,0.2)' }}>
          <ChevronLeft className="w-4 h-4" />
        </motion.button>
        <div ref={scrollRef} className="flex gap-3 overflow-x-auto py-1 px-1 snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', scrollSnapType: 'x mandatory' }}>
          {fieldArts.map((art, idx) => (
            <motion.div key={art.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }} whileHover={cardHover} whileTap={cardTap}
              className="glass-card relative p-6 cursor-pointer overflow-hidden shrink-0 snap-start group"
              style={{ width: 300 }} onClick={() => onSelect(art)}>
              <div className="flex items-center justify-between mb-3">
                <span className={`steami-badge steami-badge-${fieldColor} text-[8px]`}>{art.field}</span>
                <ShareMenu title={art.title} compact className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <h3 className="font-serif text-sm font-bold mb-2 leading-snug text-foreground">{art.title}</h3>
              <p className="text-[11px] font-light text-muted-foreground leading-relaxed line-clamp-3">{art.abstract}</p>
              <div className="mt-3 font-mono text-[9px] text-muted-foreground">{art.author}</div>
            </motion.div>
          ))}
        </div>
        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => scroll(1)}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-steami-cyan transition-colors opacity-0 group-hover:opacity-100"
          style={{ background: 'rgba(3,8,20,0.9)', border: '1px solid rgba(99,179,237,0.2)' }}>
          <ChevronRight className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.div>
  );
}

export default function ResearchPage() {
  const [articles,     setArticles]     = useState<Article[]>([]);
  const [fields,       setFields]       = useState<string[]>(FIELDS_FALLBACK);
  const [fieldIcons,   setFieldIcons]   = useState<Record<string,string>>(FIELD_ICONS_FB);
  const [fieldColors,  setFieldColors]  = useState<Record<string,string>>(FIELD_COLORS_FB);
  const [loading,      setLoading]      = useState(true);
  const [selectedArt,  setSelectedArt]  = useState<Article | null>(null);
  const [copied,       setCopied]       = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const diary          = useSteamiStore(s => s.diary);
  const recommendations = useSteamiStore(s => s.recommendations);

  useEffect(() => {
    getResearchArticles()
      .then(res => {
        setArticles(res.articles ?? []);
        if (res.fields?.length)      setFields(res.fields);
        if (res.field_icons)         setFieldIcons(res.field_icons);
        if (res.field_colors)        setFieldColors(res.field_colors);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Deep-link support
  useDeepLink({
    onResearch: (id) => {
      const tryOpen = (attempts = 0) => {
        setArticles(prev => {
          const art = prev.find(a => a.id === id);
          if (art) {
            setSelectedArt(art);
          } else if (attempts < 20) {
            setTimeout(() => tryOpen(attempts + 1), 100);
          }
          return prev;
        });
      };
      tryOpen();
    },
  });

  function openArticle(art: Article) {
    setSelectedArt(art);
    setDeepLinkParam("research", art.id);
  }

  function closeArticle() {
    setSelectedArt(null);
    clearDeepLinkParam("research");
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(window.location.href).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const activeFields = fields.filter(f => articles.some(a => a.field === f));

  if (loading) return (
    <SteamiLayout>
      <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">Loading research articles…</div>
    </SteamiLayout>
  );

  return (
    <SteamiLayout>
      <motion.div className="mb-6" variants={fadeInUp} initial="hidden" animate="visible">
        <h1 className="steami-heading text-3xl md:text-4xl mb-3">📚 Research Articles</h1>
        <p className="text-[13px] font-light text-muted-foreground max-w-xl leading-relaxed">
          Deep research environment across {activeFields.length} scientific fields. Browse by category and click articles for full study.
        </p>
      </motion.div>

      {activeFields.map(field => (
        <CategorySlider key={field} field={field}
          fieldIcon={fieldIcons[field] ?? "📄"}
          fieldColor={fieldColors[field] ?? "cyan"}
          articles={articles} onSelect={openArticle} />
      ))}

      {/* Full Article Modal — z-[150] so SidePanel tabs (z-60) remain clickable */}
      <AnimatePresence>
        {selectedArt && (
          <motion.div variants={overlayVariants} initial="hidden" animate="visible" exit="exit"
            className="fixed inset-0 flex p-4"
            style={{ background: 'rgba(2,8,18,0.85)', backdropFilter: 'blur(8px)', zIndex: 150 }}
            onClick={closeArticle}>
            <motion.div variants={modalVariants} initial="hidden" animate="visible" exit="exit"
              className="flex flex-1 max-w-[1100px] mx-auto gap-4 max-h-[90vh]"
              onClick={e => e.stopPropagation()}>
              {/* Main */}
              <div ref={contentRef} className="flex-1 overflow-y-auto rounded-xl"
                style={{ background: 'rgba(5,14,32,0.92)', backdropFilter: 'blur(24px) saturate(160%)',
                  border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.6)' }}>
                <TextSelectionPopover containerRef={contentRef as React.RefObject<HTMLDivElement>}
                  source={selectedArt.title} sourceType="article" field={selectedArt.field} />
                {/* Header */}
                <div className="sticky top-0 z-10 px-7 py-4 flex items-center justify-between border-b border-foreground/5"
                  style={{ background: 'rgba(5,14,32,0.95)', backdropFilter: 'blur(20px)' }}>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`steami-badge steami-badge-${fieldColors[selectedArt.field] ?? "cyan"}`}>{selectedArt.field}</span>
                    <span className="font-mono text-[9px] text-muted-foreground">{selectedArt.readTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                      onClick={handleCopyLink}
                      className="steami-btn py-1.5 px-2.5 text-[9px] flex items-center gap-1">
                      <Link className="w-3 h-3" />
                      {copied ? "Copied!" : "Copy Link"}
                    </motion.button>
                    <ShareMenu title={selectedArt.title} compact />
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={closeArticle}
                      className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-steami-red transition-colors"
                      style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(10,25,55,0.4)' }}>
                      <X className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
                {/* Content */}
                <div className="p-7">
                  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className="rounded-xl p-5 mb-5 md:float-right md:ml-5 md:mb-4 md:w-64"
                    style={{ background: 'rgba(6,16,38,0.5)', border: '1px solid rgba(99,179,237,0.14)' }}>
                    <div className="font-mono text-[10px] tracking-wider uppercase text-steami-cyan mb-3 flex items-center gap-2">
                      <Sparkles className="w-3 h-3" /> KEY FINDINGS
                    </div>
                    {selectedArt.keyFindings.map((f, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.25 + i * 0.05 }}
                        className="flex items-start gap-2 py-1.5 border-b border-steami-cyan/5 last:border-0">
                        <span className="text-steami-cyan text-xs mt-0.5">◆</span>
                        <span className="font-mono text-[11px] text-muted-foreground leading-relaxed">{f}</span>
                      </motion.div>
                    ))}
                  </motion.div>
                  <motion.h2 className="steami-heading text-2xl mb-2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                    {selectedArt.title}
                  </motion.h2>
                  <div className="flex items-center gap-3 mb-5 font-mono text-[10px] text-muted-foreground">
                    <span>{selectedArt.author}</span>
                    <span>{selectedArt.date}</span>
                  </div>
                  <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                    className="text-sm font-light leading-relaxed text-muted-foreground mb-6 pl-5 border-l-2 border-steami-gold/50"
                    style={{ fontStyle: 'italic', color: '#8aacca' }}>
                    {selectedArt.abstract}
                  </motion.div>
                  {selectedArt.content.map((para, i) => (
                    <motion.p key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25 + i * 0.05 }}
                      className="text-[13px] font-light leading-relaxed text-foreground/80 mb-5">
                      {para}
                    </motion.p>
                  ))}
                  {selectedArt.quotes.map((quote, i) => (
                    <motion.blockquote key={i} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 + i * 0.08 }} className="my-6 p-4 rounded-lg"
                      style={{ background: 'rgba(232,184,75,0.06)', borderLeft: '3px solid hsl(var(--steami-gold))' }}>
                      <p className="text-sm font-light leading-relaxed text-steami-gold2 italic">{quote}</p>
                    </motion.blockquote>
                  ))}
                </div>
              </div>
              {/* Right Sidebar */}
              <motion.div className="w-72 hidden lg:flex flex-col gap-3 overflow-y-auto"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2, duration: 0.4 }}>
                <div className="rounded-xl p-4" style={{ background: 'rgba(5,14,32,0.88)', border: '1px solid rgba(99,179,237,0.14)' }}>
                  <div className="font-mono text-[10px] tracking-wider uppercase text-steami-cyan mb-3 flex items-center gap-2">
                    <Network className="w-3 h-3" /> KNOWLEDGE MAP
                  </div>
                  <KnowledgeGraph centerTopic={selectedArt.title} relatedTopics={selectedArt.relatedTopics} field={selectedArt.field} compact />
                  <div className="mt-3 pt-3 border-t border-steami-cyan/10">
                    <div className="font-mono text-[9px] text-muted-foreground mb-2">RELATED ARTICLES</div>
                    {articles.filter(a => a.id !== selectedArt.id && a.field === selectedArt.field).slice(0, 2).map(a => (
                      <motion.button key={a.id} whileHover={{ x: 3, backgroundColor: 'rgba(99,179,237,0.08)' }}
                        onClick={() => openArticle(a)} className="block w-full text-left p-2 rounded-md mb-1 transition-colors">
                        <div className="font-serif text-[11px] font-bold text-foreground leading-tight">{a.title}</div>
                        <div className="font-mono text-[9px] text-muted-foreground mt-1">{a.author}</div>
                      </motion.button>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl p-4" style={{ background: 'rgba(5,14,32,0.88)', border: '1px solid rgba(232,184,75,0.14)' }}>
                  <div className="font-mono text-[10px] tracking-wider uppercase text-steami-gold mb-3 flex items-center gap-2">
                    <FileText className="w-3 h-3" /> RESEARCH DIARY
                  </div>
                  {diary.length === 0 ? (
                    <p className="font-mono text-[10px] text-muted-foreground">Select text in any article to save notes here.</p>
                  ) : (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {diary.slice(0, 5).map(entry => (
                        <div key={entry.id} className="p-2 rounded-md text-[10px] font-mono text-muted-foreground"
                          style={{ background: 'rgba(232,184,75,0.05)', border: '1px solid rgba(232,184,75,0.1)' }}>
                          "{entry.text.slice(0, 80)}..."
                          <div className="text-[8px] mt-1 text-steami-gold/60">{entry.source}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="rounded-xl p-4" style={{ background: 'rgba(5,14,32,0.88)', border: '1px solid rgba(167,139,250,0.14)' }}>
                  <div className="font-mono text-[10px] tracking-wider uppercase text-steami-violet mb-3 flex items-center gap-2">
                    <Sparkles className="w-3 h-3" /> RECOMMENDATIONS
                  </div>
                  {recommendations.slice(0, 3).map(rec => (
                    <motion.div key={rec.id} whileHover={{ scale: 1.02 }}
                      className="p-2 rounded-md mb-1.5 transition-colors"
                      style={{ background: 'rgba(167,139,250,0.04)', border: '1px solid rgba(167,139,250,0.08)' }}>
                      <div className="font-serif text-[11px] font-bold text-foreground leading-tight">{rec.title}</div>
                      <div className="text-[9px] font-light text-muted-foreground mt-1 leading-relaxed">{rec.description.slice(0, 80)}...</div>
                      <span className="steami-badge steami-badge-violet text-[7px] mt-1.5 inline-block">{rec.field}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </SteamiLayout>
  );
}