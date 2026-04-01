import { Link, useLocation } from 'react-router-dom';
import { useSteamiStore } from '@/stores/steami-store';

const navLinks = [
  { path: '/', label: 'EXPLAINERS' },
  { path: '/research', label: 'RESEARCH' },
  { path: '/simulations', label: 'SIMULATIONS' },
  { path: '/dashboard', label: 'DASHBOARD' },
];

export function SteamiNav() {
  const location = useLocation();
  const diaryCount = useSteamiStore((s) => s.diary.length);

  return (
    <nav className="fixed top-0 left-0 right-0 h-12 z-50 flex items-center px-7 gap-8"
      style={{
        background: 'rgba(3, 8, 20, 0.75)',
        backdropFilter: 'blur(20px) saturate(180%)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        boxShadow: '0 1px 32px rgba(0,0,0,0.4)',
      }}
    >
      <Link to="/" className="font-mono text-[13px] font-semibold tracking-wider">
        <span className="text-steami-gold">STEAMI</span>
      </Link>

      <div className="flex gap-5 ml-3">
        {navLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`font-mono text-[10px] tracking-[0.12em] uppercase transition-colors ${
              location.pathname === link.path
                ? 'text-steami-cyan'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>

      <div className="ml-auto flex items-center gap-3">
        {diaryCount > 0 && (
          <Link to="/dashboard" className="font-mono text-[9px] tracking-wider uppercase px-3 py-1.5 rounded steami-badge-gold">
            📝 {diaryCount} notes
          </Link>
        )}
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-steami-red" style={{ animation: 'blink 1.4s ease-in-out infinite' }} />
          <span className="font-mono text-[10px] text-steami-red tracking-wider">LIVE</span>
        </div>
        <button className="font-mono text-[10px] tracking-wider uppercase px-3 py-1.5 rounded-md text-muted-foreground transition-all hover:text-steami-cyan"
          style={{
            border: '1px solid rgba(99, 179, 237, 0.18)',
            background: 'rgba(10, 25, 55, 0.4)',
            backdropFilter: 'blur(8px)',
          }}
        >
          ⌘ CMD
        </button>
      </div>
    </nav>
  );
}
