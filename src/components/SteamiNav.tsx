import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSteamiStore } from '@/stores/steami-store';
import { useState } from 'react';

const navLinks = [
  { path: '/', label: 'EXPLAINERS' },
  { path: '/research', label: 'RESEARCH' },
  { path: '/simulations', label: 'SIMULATIONS' },
  { path: '/dashboard', label: 'DASHBOARD' },
];

export function SteamiNav() {
  const location = useLocation();
  const diaryCount = useSteamiStore((s) => s.diary.length);
  const [subscribed, setSubscribed] = useState(false);

  return (
    <motion.nav
      initial={{ y: -48, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      className="fixed top-0 left-0 right-0 h-12 z-50 flex items-center px-7 gap-8"
      style={{
        background: 'rgba(3, 8, 20, 0.75)',
        backdropFilter: 'blur(20px) saturate(180%)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        boxShadow: '0 1px 32px rgba(0,0,0,0.4)',
      }}
    >
      <Link to="/" className="font-mono text-[13px] font-semibold tracking-wider group">
        <motion.span
          className="text-steami-gold inline-block"
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.15 }}
        >
          STEAMI
        </motion.span>
      </Link>

      <div className="flex gap-5 ml-3">
        {navLinks.map((link, i) => {
          const isActive = location.pathname === link.path;
          return (
            <motion.div
              key={link.path}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.06, duration: 0.35 }}
              className="relative"
            >
              <Link
                to={link.path}
                className={`nav-link-animated font-mono text-[10px] tracking-[0.12em] uppercase transition-colors ${
                  isActive ? 'text-steami-cyan active' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {link.label}
              </Link>
            </motion.div>
          );
        })}
      </div>

      <div className="ml-auto flex items-center gap-3">
        {diaryCount > 0 && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <Link to="/dashboard" className="font-mono text-[9px] tracking-wider uppercase px-3 py-1.5 rounded steami-badge-gold">
              📝 {diaryCount} notes
            </Link>
          </motion.div>
        )}
        <motion.button
          whileHover={{ scale: 1.04, borderColor: subscribed ? 'rgba(232, 184, 75, 0.6)' : 'rgba(99, 179, 237, 0.4)' }}
          whileTap={{ scale: 0.96 }}
          onClick={() => setSubscribed(!subscribed)}
          className={`font-mono text-[10px] tracking-wider uppercase px-3 py-1.5 rounded-md transition-all ${
            subscribed ? 'text-steami-gold' : 'text-muted-foreground hover:text-steami-cyan'
          }`}
          style={{
            border: `1px solid ${subscribed ? 'rgba(232, 184, 75, 0.35)' : 'rgba(99, 179, 237, 0.18)'}`,
            background: subscribed ? 'rgba(232, 184, 75, 0.1)' : 'rgba(10, 25, 55, 0.4)',
            backdropFilter: 'blur(8px)',
          }}
        >
          {subscribed ? '✓ SUBSCRIBED' : '✦ SUBSCRIBE'}
        </motion.button>
      </div>
    </motion.nav>
  );
}