import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Twitter, Linkedin, Facebook, Link2, Check } from 'lucide-react';

interface ShareMenuProps {
  title: string;
  text?: string;
  url?: string;
  className?: string;
  compact?: boolean;
}

export function ShareMenu({ title, text, url, className = '', compact = false }: ShareMenuProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const shareUrl = url || window.location.href;
  const shareText = text || title;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const socials = [
    {
      label: 'Twitter',
      icon: Twitter,
      color: 'text-steami-cyan',
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
    },
    {
      label: 'LinkedIn',
      icon: Linkedin,
      color: 'text-steami-cyan',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    },
    {
      label: 'Facebook',
      icon: Facebook,
      color: 'text-steami-cyan',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    },
  ];

  return (
    <div ref={menuRef} className={`relative ${className}`}>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className={`flex items-center justify-center rounded-md transition-colors text-muted-foreground hover:text-steami-cyan ${
          compact ? 'w-7 h-7' : 'w-8 h-8'
        }`}
        style={{
          background: 'rgba(10, 18, 42, 0.6)',
          border: '1px solid rgba(111, 168, 255, 0.12)',
        }}
        aria-label="Share"
      >
        <Share2 className={compact ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -4 }}
            transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
            className="absolute right-0 top-full mt-2 z-50 rounded-xl p-2 min-w-[160px]"
            style={{
              background: 'rgba(10, 18, 42, 0.95)',
              backdropFilter: 'blur(20px) saturate(150%)',
              border: '1px solid rgba(111, 168, 255, 0.14)',
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5), 0 0 1px rgba(111, 168, 255, 0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="font-mono text-[8px] tracking-wider uppercase text-muted-foreground px-2 py-1.5 mb-1">
              SHARE
            </div>
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg font-mono text-[10px] text-muted-foreground hover:text-steami-cyan transition-colors"
                style={{ background: 'transparent' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(111, 168, 255, 0.08)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                onClick={() => setOpen(false)}
              >
                <s.icon className="w-3.5 h-3.5" />
                {s.label}
              </a>
            ))}
            <div className="h-px my-1" style={{ background: 'rgba(111, 168, 255, 0.08)' }} />
            <button
              onClick={copyLink}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg font-mono text-[10px] w-full transition-colors"
              style={{
                color: copied ? 'hsl(var(--steami-gold))' : 'hsl(var(--muted-foreground))',
                background: 'transparent',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(111, 168, 255, 0.08)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Link2 className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}