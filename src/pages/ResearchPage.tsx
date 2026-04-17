import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SteamiLayout } from '@/components/SteamiLayout';
import { TextSelectionPopover } from '@/components/TextSelectionPopover';
import { KnowledgeGraph } from '@/components/KnowledgeGraph';
import { ShareMenu } from '@/components/ShareMenu';
import { useSteamiStore } from '@/stores/steami-store';
import { staggerContainer, cardVariants, cardHover, cardTap, overlayVariants, modalVariants, fadeInUp } from '@/lib/motion';
import { X, ChevronLeft, ChevronRight, Network, FileText, Sparkles, Link, Check } from 'lucide-react';
import { getResearchArticles, resolveImageUrl, type Article } from '@/lib/content-api';
import { useDeepLink, clearDeepLinkParam, setDeepLinkParam } from '@/hooks/useDeepLink';
import { dashboard } from '@/lib/api';

const FIELDS_FB  = ["PHYSICS","CHEMISTRY","BIOLOGY","MEDICINE","EARTH & SPACE","COMPUTER SCIENCE","AI","ROBOTICS","ENGINEERING","MATHEMATICS & DATA","CLIMATE & ENERGY"];
const ICONS_FB: Record<string,string>  = {"PHYSICS":"⚛️","CHEMISTRY":"🧪","BIOLOGY":"🧬","MEDICINE":"💊","EARTH & SPACE":"🌍","COMPUTER SCIENCE":"💻","AI":"🤖","ROBOTICS":"🦾","ENGINEERING":"⚙️","MATHEMATICS & DATA":"📐","CLIMATE & ENERGY":"🌱"};
const COLORS_FB: Record<string,string> = {"PHYSICS":"cyan","CHEMISTRY":"orange","BIOLOGY":"green","MEDICINE":"red","EARTH & SPACE":"violet","COMPUTER SCIENCE":"cyan","AI":"violet","ROBOTICS":"orange","ENGINEERING":"gold","MATHEMATICS & DATA":"cyan","CLIMATE & ENERGY":"green"};

// ── Category horizontal slider ────────────────────────────────────────────────
function CategorySlider({ field, fieldIcon, fieldColor, fieldBgImage, articles, onSelect }: {
  field: string; fieldIcon: string; fieldColor: string; fieldBgImage: string;
  articles: Article[]; onSelect: (a: Article) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const fieldArts = articles.filter(a => a.field === field);
  if (fieldArts.length === 0) return null;

  const scroll = (dir: number) =>
    scrollRef.current?.scrollBy({ left: dir * 320, behavior: 'smooth' });

  return (
    <motion.div className="mb-8" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      {/* Section label — with background image if available */}
      <div className="relative mb-3 rounded-lg overflow-hidden">
        {fieldBgImage && (
          <div className="absolute inset-0">
            <img src={fieldBgImage} alt="" className="w-full h-full object-cover opacity-15" />
            <div className="absolute inset-0 bg-gradient-to-r from-[rgba(5,14,32,0.9)] to-[rgba(5,14,32,0.6)]" />
          </div>
        )}
        <div className={`relative z-10 steami-section-label py-2 px-3 ${fieldBgImage ? "!mb-0" : ""}`}>
          {fieldIcon} {field} — {fieldArts.length} ARTICLES
        </div>
      </div>

      <div className="relative group">
        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => scroll(-1)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-steami-cyan transition-colors opacity-0 group-hover:opacity-100"
          style={{ background: 'rgba(3,8,20,0.9)', border: '1px solid rgba(99,179,237,0.2)' }}>
          <ChevronLeft className="w-4 h-4" />
        </motion.button>

        <div ref={scrollRef} className="flex gap-3 overflow-x-auto py-1 px-1 snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', scrollSnapType: 'x mandatory' }}>
          {fieldArts.map((art, idx) => {
            const imgUrl = resolveImageUrl(art.image);
            return (
              <motion.div key={art.id}
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={cardHover} whileTap={cardTap}
                className="glass-card relative cursor-pointer overflow-hidden shrink-0 snap-start group/card"
                style={{ width: 300 }}
                onClick={() => onSelect(art)}>
                {/* Card image */}
                {imgUrl && (
                  <div className="relative h-28 overflow-hidden">
                    <img src={imgUrl} alt={art.title}
                      className="w-full h-full object-cover opacity-55 group-hover/card:opacity-75
                        transition-all duration-300 group-hover/card:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[rgba(5,14,32,0.98)]" />
                    <div className="absolute bottom-2 left-3">
                      <span className={`steami-badge steami-badge-${fieldColor} text-[8px]`}>{art.field}</span>
                    </div>
                    <div className="absolute top-2 right-2">
                      <ShareMenu title={art.title} compact className="opacity-0 group-hover/card:opacity-100 transition-opacity" />
                    </div>
                  </div>
                )}
                <div className="p-4 pt-3">
                  {!imgUrl && (
                    <div className="flex items-center justify-between mb-2">
                      <span className={`steami-badge steami-badge-${fieldColor} text-[8px]`}>{art.field}</span>
                      <ShareMenu title={art.title} compact className="opacity-0 group-hover/card:opacity-100 transition-opacity" />
                    </div>
                  )}
                  <h3 className="font-serif text-sm font-bold mb-1.5 leading-snug text-foreground line-clamp-2">
                    {art.title}
                  </h3>
                  <p className="text-[11px] font-light text-muted-foreground leading-relaxed line-clamp-2">
                    {art.abstract}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="font-mono text-[9px] text-muted-foreground">{art.author}</span>
                    <span className="font-mono text-[9px] text-muted-foreground">{art.readTime}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
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

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ResearchPage() {
  const [articles,     setArticles]     = useState<Article[]>([]);
  const [fields,       setFields]       = useState<string[]>(FIELDS_FB);
  const [fieldIcons,   setFieldIcons]   = useState<Record<string,string>>(ICONS_FB);
  const [fieldColors,  setFieldColors]  = useState<Record<string,string>>(COLORS_FB);
  const [fieldImages,  setFieldImages]  = useState<Record<string,string>>({});  // NEW
  const [loading,      setLoading]      = useState(true);
  const [selectedArt,  setSelectedArt]  = useState<Article | null>(null);
  const [copied,       setCopied]       = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const diary           = useSteamiStore(s => s.diary);
  const recommendations = useSteamiStore(s => s.recommendations);

  useEffect(() => {
    getResearchArticles()
      .then(res => {
        setArticles(res.articles ?? []);
        if (res.fields?.length)   setFields(res.fields);
        if (res.field_icons)      setFieldIcons(res.field_icons);
        if (res.field_colors)     setFieldColors(res.field_colors);
        if (res.field_images)     setFieldImages(res.field_images);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Deep-link
  useDeepLink({
    onResearch: (id) => {
      const tryOpen = (attempts = 0) => {
        setArticles(prev => {
          const art = prev.find(a => a.id === id);
          if (art) {
            setSelectedArt(art);
            dashboard.event("research_article", art.id, art.title);
          }
          else if (attempts < 20) setTimeout(() => tryOpen(attempts + 1), 150);
          return prev;
        });
      };
      tryOpen();
    },
  });

  function openArticle(art: Article) {
    setSelectedArt(art);
    setDeepLinkParam("research", art.id);
    dashboard.event("research_article", art.id, art.title);
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
      <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
        Loading research articles…
      </div>
    </SteamiLayout>
  );

  return (
    <SteamiLayout>
      <motion.div className="mb-6" variants={fadeInUp} initial="hidden" animate="visible">
        <h1 className="steami-heading text-3xl md:text-4xl mb-3">📚 Research Articles</h1>
        <p className="text-[13px] font-light text-muted-foreground max-w-xl leading-relaxed">
          Deep research environment across {activeFields.length} scientific fields.
        </p>
      </motion.div>

      {activeFields.map(field => (
        <CategorySlider key={field} field={field}
          fieldIcon={fieldIcons[field] ?? "📄"}
          fieldColor={fieldColors[field] ?? "cyan"}
          fieldBgImage={resolveImageUrl(fieldImages[field])}
          articles={articles}
          onSelect={openArticle} />
      ))}

      {/* ── Article Modal ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedArt && (
          <motion.div variants={overlayVariants} initial="hidden" animate="visible" exit="exit"
            className="fixed inset-0 flex p-4"
            style={{ background: 'rgba(2,8,18,0.85)', backdropFilter: 'blur(8px)', zIndex: 150 }}
            onClick={closeArticle}>
            <motion.div variants={modalVariants} initial="hidden" animate="visible" exit="exit"
              className="flex flex-1 max-w-[1100px] mx-auto gap-4 max-h-[90vh]"
              onClick={e => e.stopPropagation()}>

              {/* Main content */}
              <div ref={contentRef} className="flex-1 overflow-y-auto rounded-xl"
                style={{
                  background: 'rgba(5,14,32,0.92)',
                  backdropFilter: 'blur(24px) saturate(160%)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  boxShadow: '0 25px 50px -12px rgba(0,0,0,0.6)',
                }}>
                <TextSelectionPopover containerRef={contentRef as React.RefObject<HTMLDivElement>}
                  source={selectedArt.title}
                  sourceType="article"
                  field={selectedArt.field}
                  popupId={selectedArt.id}
                  popupTitle={selectedArt.title} />

                {/* Image banner */}
                {resolveImageUrl(selectedArt.image) && (
                  <div className="relative h-44 overflow-hidden rounded-t-xl">
                    <img src={resolveImageUrl(selectedArt.image)} alt={selectedArt.title}
                      className="w-full h-full object-cover opacity-60" />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[rgba(5,14,32,1)]" />
                  </div>
                )}

                {/* Header */}
                <div className={[
                  "sticky top-0 z-10 px-7 py-4 flex items-center justify-between border-b border-foreground/5",
                  resolveImageUrl(selectedArt.image) ? "-mt-12" : "",
                ].join(" ")}
                  style={{ background: 'rgba(5,14,32,0.95)', backdropFilter: 'blur(20px)' }}>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`steami-badge steami-badge-${fieldColors[selectedArt.field] ?? "cyan"}`}>
                      {selectedArt.field}
                    </span>
                    <span className="font-mono text-[9px] text-muted-foreground">{selectedArt.readTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      onClick={handleCopyLink}
                      className="steami-btn py-1.5 px-2.5 text-[9px] flex items-center gap-1">
                      {copied ? <><Check className="w-3 h-3 text-green-400" /> Copied!</> : <><Link className="w-3 h-3" /> Copy Link</>}
                    </motion.button>
                    <ShareMenu title={selectedArt.title} compact />
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={closeArticle}
                      className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-steami-red transition-colors"
                      style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(10,25,55,0.4)' }}>
                      <X className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>

                {/* Article body */}
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
                    <span>·</span>
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

              {/* Right sidebar */}
              <motion.div className="w-72 hidden lg:flex flex-col gap-3 overflow-y-auto"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2, duration: 0.4 }}>
                <div className="rounded-xl overflow-hidden"
                  style={{ background: 'rgba(5,14,32,0.88)', border: '1px solid rgba(99,179,237,0.14)' }}>
                  {/* Field image banner in sidebar */}
                  {resolveImageUrl(fieldImages[selectedArt.field]) && (
                    <div className="relative h-20 overflow-hidden">
                      <img src={resolveImageUrl(fieldImages[selectedArt.field])} alt={selectedArt.field}
                        className="w-full h-full object-cover opacity-40" />
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[rgba(5,14,32,0.98)]" />
                      <div className="absolute bottom-2 left-3 font-mono text-[9px] text-steami-cyan tracking-wider uppercase">
                        {fieldIcons[selectedArt.field]} {selectedArt.field}
                      </div>
                    </div>
                  )}
                  <div className="p-4">
                    <div className="font-mono text-[10px] tracking-wider uppercase text-steami-cyan mb-3 flex items-center gap-2">
                      <Network className="w-3 h-3" /> KNOWLEDGE MAP
                    </div>
                    <KnowledgeGraph centerTopic={selectedArt.title} relatedTopics={selectedArt.relatedTopics}
                      field={selectedArt.field} compact />
                    <div className="mt-3 pt-3 border-t border-steami-cyan/10">
                      <div className="font-mono text-[9px] text-muted-foreground mb-2">RELATED ARTICLES</div>
                      {articles.filter(a => a.id !== selectedArt.id && a.field === selectedArt.field).slice(0, 2).map(a => {
                        const relImg = resolveImageUrl(a.image);
                        return (
                          <motion.button key={a.id} whileHover={{ x: 3, backgroundColor: 'rgba(99,179,237,0.08)' }}
                            onClick={() => openArticle(a)}
                            className="block w-full text-left p-2 rounded-md mb-1 transition-colors overflow-hidden">
                            {relImg && (
                              <div className="relative h-12 rounded overflow-hidden mb-1.5">
                                <img src={relImg} alt="" className="w-full h-full object-cover opacity-50" />
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[rgba(5,14,32,0.8)]" />
                              </div>
                            )}
                            <div className="font-serif text-[11px] font-bold text-foreground leading-tight">{a.title}</div>
                            <div className="font-mono text-[9px] text-muted-foreground mt-1">{a.author}</div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="rounded-xl p-4" style={{ background: 'rgba(5,14,32,0.88)', border: '1px solid rgba(232,184,75,0.14)' }}>
                  <div className="font-mono text-[10px] tracking-wider uppercase text-steami-gold mb-3 flex items-center gap-2">
                    <FileText className="w-3 h-3" /> RESEARCH DIARY
                  </div>
                  {diary.length === 0 ? (
                    <p className="font-mono text-[10px] text-muted-foreground">Select text to save notes here.</p>
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
                      <div className="text-[9px] font-light text-muted-foreground mt-1 leading-relaxed">
                        {rec.description.slice(0, 80)}...
                      </div>
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
