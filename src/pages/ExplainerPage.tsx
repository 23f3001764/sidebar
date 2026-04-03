import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SteamiLayout } from '@/components/SteamiLayout';
import { TextSelectionPopover } from '@/components/TextSelectionPopover';
import { KnowledgeGraph } from '@/components/KnowledgeGraph';
import { ShareMenu } from '@/components/ShareMenu';
import { explainers } from '@/data/explainers';
import { staggerContainer, cardVariants, cardHover, cardTap, overlayVariants, modalVariants, fadeInUp } from '@/lib/motion';
import { ChevronLeft, ChevronRight, Play, Pause, X, Lightbulb } from 'lucide-react';

export default function ExplainerPage() {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [slideIdx, setSlideIdx] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);

  const [carouselIdx, setCarouselIdx] = useState(0);
  const [carouselPaused, setCarouselPaused] = useState(false);
  const featuredCount = Math.min(explainers.length, 6);

  const selected = selectedIdx !== null ? explainers[selectedIdx] : null;

  useEffect(() => {
    if (!autoPlay || selectedIdx === null || !selected) return;
    const timer = setInterval(() => {
      setSlideIdx((p) => (p + 1) % selected.content.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [autoPlay, selectedIdx, selected]);

  useEffect(() => {
    if (carouselPaused) return;
    const timer = setInterval(() => {
      setCarouselIdx((p) => (p + 1) % featuredCount);
    }, 4000);
    return () => clearInterval(timer);
  }, [carouselPaused, featuredCount]);

  const openModal = useCallback((idx: number) => {
    setSelectedIdx(idx);
    setSlideIdx(0);
    setAutoPlay(true);
  }, []);

  const closeModal = () => {
    setSelectedIdx(null);
    setSlideIdx(0);
  };

  const badgeClass = (color: string) => `steami-badge steami-badge-${color}`;

  return (
    <SteamiLayout>
      <motion.div className="mb-8" variants={fadeInUp} initial="hidden" animate="visible">
        <h1 className="steami-heading text-3xl md:text-4xl mb-3">
          🧠 Intelligence Explainers
        </h1>
        <p className="text-[13px] font-light text-muted-foreground max-w-xl leading-relaxed">
          Interactive deep-dives into breakthrough science & technology. Select text to save to your Research Diary.
        </p>
      </motion.div>

      {/* Featured Single-Card Carousel */}
      <div className="mb-8">
        <div className="steami-section-label mb-4">◆ FEATURED EXPLAINERS</div>
        <div
          className="relative"
          onMouseEnter={() => setCarouselPaused(true)}
          onMouseLeave={() => setCarouselPaused(false)}
        >
          <div className="relative overflow-hidden" style={{ minHeight: 320 }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={carouselIdx}
                initial={{ opacity: 0, x: 80 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -80 }}
                transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
                className="w-full"
              >
                {(() => {
                  const exp = explainers[carouselIdx];
                  return (
                    <motion.div
                      whileHover={cardHover}
                      whileTap={cardTap}
                      className="glass-card relative p-8 cursor-pointer overflow-hidden"
                      onClick={() => openModal(carouselIdx)}
                    >
                      <motion.div
                        className="absolute top-0 left-0 right-0 h-[2px]"
                        style={{ background: 'hsl(var(--steami-gold))' }}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.5 }}
                      />
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex flex-wrap gap-2">
                          <span className={`${badgeClass(exp.badgeColor)} text-[9px]`}>{exp.field}</span>
                          <span className="steami-badge steami-badge-gold text-[9px]">FEATURED</span>
                        </div>
                        <ShareMenu title={exp.title} compact className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <h3 className="font-serif text-xl md:text-2xl font-bold mb-3 leading-snug text-foreground">{exp.title}</h3>
                      <p className="text-[13px] font-light text-muted-foreground leading-relaxed mb-6 max-w-2xl">{exp.subtitle}</p>
                      <div className="flex items-center justify-end">
                        <span className="font-mono text-[9px] text-steami-cyan tracking-wider uppercase">Click to read →</span>
                      </div>
                    </motion.div>
                  );
                })()}
              </motion.div>
            </AnimatePresence>
          </div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => { setCarouselIdx((p) => (p - 1 + featuredCount) % featuredCount); setCarouselPaused(true); }}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-steami-cyan transition-colors"
            style={{ background: 'rgba(3, 8, 20, 0.85)', border: '1px solid rgba(99,179,237,0.2)' }}
          >
            <ChevronLeft className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => { setCarouselIdx((p) => (p + 1) % featuredCount); setCarouselPaused(true); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-steami-cyan transition-colors"
            style={{ background: 'rgba(3, 8, 20, 0.85)', border: '1px solid rgba(99,179,237,0.2)' }}
          >
            <ChevronRight className="w-4 h-4" />
          </motion.button>

          <div className="flex justify-center gap-2 mt-4">
            {Array.from({ length: featuredCount }).map((_, i) => (
              <button
                key={i}
                onClick={() => { setCarouselIdx(i); setCarouselPaused(true); }}
                className="w-2 h-2 rounded-full transition-all duration-300"
                style={{
                  background: i === carouselIdx ? 'hsl(var(--steami-cyan))' : 'rgba(99,179,237,0.2)',
                  transform: i === carouselIdx ? 'scale(1.5)' : 'scale(1)',
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Grid of All Explainers */}
      <div className="steami-section-label mb-4">ALL EXPLAINERS</div>
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {explainers.map((exp, idx) => (
          <motion.div
            key={exp.id}
            custom={idx}
            variants={cardVariants}
            whileHover={cardHover}
            whileTap={cardTap}
            className="glass-card relative p-6 cursor-pointer overflow-hidden group"
            onClick={() => openModal(idx)}
          >
            <div className="flex items-start justify-between mb-3">
              <span className={`${badgeClass(exp.badgeColor)} text-[8px] inline-block`}>
                {exp.field}
              </span>
              <ShareMenu title={exp.title} compact className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <h3 className="font-serif text-sm font-bold mb-2 leading-snug text-foreground">{exp.title}</h3>
            <p className="text-[11px] font-light text-muted-foreground leading-relaxed line-clamp-2">{exp.subtitle}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Slideshow Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-[200] flex items-center justify-center p-5"
            style={{ background: 'rgba(2, 8, 18, 0.82)', backdropFilter: 'blur(8px)' }}
            onClick={closeModal}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="w-full max-w-[720px] max-h-[85vh] overflow-y-auto rounded-xl"
              style={{
                background: 'rgba(5, 14, 32, 0.92)',
                backdropFilter: 'blur(24px) saturate(160%)',
                border: '1px solid rgba(255, 255, 255, 0.07)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 40px rgba(99, 179, 237, 0.1)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 z-10 px-7 py-4 flex items-center justify-between border-b border-foreground/5"
                style={{ background: 'rgba(5, 14, 32, 0.95)', backdropFilter: 'blur(20px)' }}
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={badgeClass(selected.badgeColor)}>{selected.field}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShareMenu title={selected.title} compact />
                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => setAutoPlay(!autoPlay)}
                    className="steami-btn py-1.5 px-2.5 text-[9px]"
                  >
                    {autoPlay ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={closeModal}
                    className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-steami-red transition-colors"
                    style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(10,25,55,0.4)' }}
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>

              {/* Body */}
              <div ref={contentRef} className="p-7">
                <TextSelectionPopover
                  containerRef={contentRef as React.RefObject<HTMLDivElement>}
                  source={selected.title}
                  sourceType="explainer"
                  field={selected.field}
                />

                <div className="flex flex-col-reverse md:flex-row gap-6">
                  <div className="flex-1">
                    <h2 className="steami-heading text-2xl mb-5">{selected.title}</h2>

                    {/* Slide Progress */}
                    <div className="flex gap-1 mb-6">
                      {selected.content.map((_, i) => (
                        <motion.button
                          key={i}
                          onClick={() => { setSlideIdx(i); setAutoPlay(false); }}
                          className="h-1 flex-1 rounded-full"
                          animate={{
                            background: i === slideIdx
                              ? 'hsl(207 72% 65%)'
                              : i < slideIdx
                              ? 'rgba(99, 179, 237, 0.3)'
                              : 'rgba(255,255,255,0.08)',
                            scaleY: i === slideIdx ? 1.5 : 1,
                          }}
                          transition={{ duration: 0.3 }}
                          whileHover={{ scaleY: 2, background: 'rgba(99, 179, 237, 0.5)' }}
                        />
                      ))}
                    </div>

                    {/* Slide Content */}
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={slideIdx}
                        initial={{ opacity: 0, x: 30, filter: 'blur(4px)' }}
                        animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, x: -30, filter: 'blur(4px)' }}
                        transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                      >
                        <div className="text-sm font-light leading-relaxed text-muted-foreground mb-4 pl-5 border-l-2 border-steami-gold/50" style={{ fontStyle: 'italic', color: '#8aacca' }}>
                          <span className="font-mono text-[9px] text-steami-gold tracking-wider uppercase block mb-2">
                            SLIDE {slideIdx + 1} OF {selected.content.length}
                          </span>
                          {selected.content[slideIdx]}
                        </div>
                      </motion.div>
                    </AnimatePresence>

                    {/* Knowledge Graph */}
                    <div className="mt-6 mb-4">
                      <KnowledgeGraph
                        centerTopic={selected.title}
                        relatedTopics={selected.keyInsights.slice(0, 4)}
                        field={selected.field}
                      />
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center justify-between mt-6">
                      <motion.button
                        whileHover={{ scale: 1.05, x: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => { setSlideIdx(Math.max(0, slideIdx - 1)); setAutoPlay(false); }}
                        className="steami-btn py-2 px-4 text-[9px]"
                        disabled={slideIdx === 0}
                        style={{ opacity: slideIdx === 0 ? 0.3 : 1 }}
                      >
                        <ChevronLeft className="w-3 h-3" /> PREV
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05, x: 2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => { setSlideIdx(Math.min(selected.content.length - 1, slideIdx + 1)); setAutoPlay(false); }}
                        className="steami-btn py-2 px-4 text-[9px]"
                        disabled={slideIdx === selected.content.length - 1}
                        style={{ opacity: slideIdx === selected.content.length - 1 ? 0.3 : 1 }}
                      >
                        NEXT <ChevronRight className="w-3 h-3" />
                      </motion.button>
                    </div>
                  </div>

                  {/* Key Insights - top-right */}
                  <motion.div
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                    className="md:w-64 shrink-0 rounded-xl p-4"
                    style={{ background: 'rgba(6, 16, 38, 0.5)', border: '1px solid rgba(99, 179, 237, 0.14)' }}
                  >
                    <div className="font-mono text-[10px] tracking-wider uppercase text-steami-cyan mb-3 flex items-center gap-2">
                      <Lightbulb className="w-3 h-3" /> KEY INSIGHTS
                    </div>
                    {selected.keyInsights.map((insight, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.35 + i * 0.06 }}
                        className="flex items-start gap-2 py-1.5 border-b border-steami-cyan/5 last:border-0"
                      >
                        <span className="text-steami-cyan text-xs mt-0.5">◆</span>
                        <span className="font-mono text-[10px] text-muted-foreground leading-relaxed">{insight}</span>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </SteamiLayout>
  );
}