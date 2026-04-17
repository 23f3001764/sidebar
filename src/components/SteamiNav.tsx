import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeStore } from '@/stores/theme-store';
import { useAuthStore } from '@/stores/auth-store';
import { useState, useEffect, useCallback } from 'react';
import { Sun, Moon, LogIn, LogOut, ChevronDown, Shield, User } from 'lucide-react';
import { AuthModal } from '@/components/AuthModal';

export function SteamiNav() {
  const location = useLocation();
  const { theme, toggleTheme } = useThemeStore();
  const { user, isAuthenticated, logout, toggleSubscribe } = useAuthStore();
  const [subLoading, setSubLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const isLight = theme === 'light';

  const subscribed = user?.subscribe_email ?? false;
  const isAdmin = user?.role === 'admin';
  const isMod   = user?.role === 'mod' || isAdmin;

  const navLinks = [
    { path: '/', label: 'EXPLAINERS' },
    { path: '/research', label: 'RESEARCH' },
    { path: '/simulations', label: 'SIMULATIONS' },
    ...(isAuthenticated ? [{ path: '/dashboard', label: 'DASHBOARD' }] : []),
    ...(isAdmin ? [{ path: '/admin', label: 'ADMIN', icon: true }] : []),
    ...(isMod ? [{ path: '/api-tools', label: 'API TOOLS', icon: true }] : []),
  ];

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => { closeMenu(); setUserMenuOpen(false); }, [location.pathname, closeMenu]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeMenu(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen, closeMenu]);

  const handleAuthSuccess = () => {
    setAuthOpen(false);
  };

  /** PATCH /api/auth/subscribe/toggle */
  const handleSubscribe = async () => {
    if (!isAuthenticated) { setAuthOpen(true); return; }
    setSubLoading(true);
    try { await toggleSubscribe(); } finally { setSubLoading(false); }
  };

  const getInitials = (name: string) =>
    name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

  const btnStyle = {
    border: `1px solid ${isLight ? 'rgba(147,197,253,0.4)' : 'rgba(99,179,237,0.18)'}`,
    background: isLight ? 'rgba(255,255,255,0.6)' : 'rgba(10,25,55,0.4)',
    backdropFilter: 'blur(8px)',
  };

  const SubBtn = ({ mobile = false }) => (
    <motion.button
      whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
      onClick={handleSubscribe} disabled={subLoading}
      className={`${mobile ? 'w-full justify-center' : 'hidden md:inline-flex'} items-center gap-1.5 font-mono text-[10px] tracking-wider uppercase px-3 py-1.5 rounded-md transition-all disabled:opacity-60 flex ${subscribed ? 'text-steami-gold' : 'text-muted-foreground hover:text-steami-cyan'}`}
      style={{
        border: `1px solid ${subscribed ? 'rgba(232,184,75,0.35)' : isLight ? 'rgba(147,197,253,0.4)' : 'rgba(99,179,237,0.18)'}`,
        background: subscribed ? (isLight ? 'rgba(163,133,36,0.08)' : 'rgba(232,184,75,0.1)') : (isLight ? 'rgba(255,255,255,0.6)' : 'rgba(10,25,55,0.4)'),
        backdropFilter: 'blur(8px)',
      }}
    >
      {subLoading && <span className="w-3 h-3 rounded-full border border-current border-t-transparent animate-spin" />}
      {subscribed ? '✓ SUBSCRIBED' : '✦ SUBSCRIBE'}
    </motion.button>
  );

  return (
    <>
      <motion.nav
        initial={{ y: -48, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        className="fixed top-0 left-0 right-0 h-12 z-50 flex items-center px-5 md:px-7 gap-8"
        style={{
          background: isLight ? 'rgba(255,255,255,0.72)' : 'rgba(3,8,20,0.75)',
          backdropFilter: 'blur(20px) saturate(180%)',
          borderBottom: isLight ? '1px solid rgba(147,197,253,0.3)' : '1px solid rgba(255,255,255,0.06)',
          boxShadow: isLight ? '0 1px 24px rgba(147,197,253,0.15)' : '0 1px 32px rgba(0,0,0,0.4)',
        }}
      >
        <Link to="/" className="font-mono text-[13px] font-semibold tracking-wider">
          <motion.span className="text-steami-gold inline-block" whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }} transition={{ duration: 0.15 }}>
            STEAMI
          </motion.span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex gap-5 ml-3">
          {navLinks.map((link, i) => {
            const isActive = location.pathname === link.path;
            return (
              <motion.div key={link.path} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.06, duration: 0.35 }} className="relative">
                <Link to={link.path}
                  className={`nav-link-animated font-mono text-[10px] tracking-[0.12em] uppercase transition-colors flex items-center gap-1 ${isActive ? 'text-steami-cyan active' : 'text-muted-foreground hover:text-foreground'}`}>
                  {(link as any).icon && <Shield className="w-2.5 h-2.5 text-steami-gold" />}
                  {link.label}
                </Link>
              </motion.div>
            );
          })}
        </div>

        <div className="ml-auto flex items-center gap-3">
          {/* Theme toggle */}
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={toggleTheme}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors" style={btnStyle}>
            <AnimatePresence mode="wait">
              <motion.div key={theme} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                {isLight ? <Moon className="w-3.5 h-3.5 text-muted-foreground" /> : <Sun className="w-3.5 h-3.5 text-steami-gold" />}
              </motion.div>
            </AnimatePresence>
          </motion.button>

          {/* Subscribe button */}
          <SubBtn />

          {/* User menu */}
          <div className="hidden md:block relative">
            {isAuthenticated && user ? (
              <div className="relative">
                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 font-mono text-[10px] tracking-wider uppercase px-2.5 py-1.5 rounded-md transition-all text-foreground"
                  style={btnStyle}>
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold"
                    style={{ background: 'hsl(var(--steami-cyan))', color: 'hsl(var(--background))' }}>
                    {getInitials(user.full_name)}
                  </div>
                  {user.full_name.split(' ')[0]}
                  {isAdmin && <Shield className="w-2.5 h-2.5 text-steami-gold" />}
                  <ChevronDown className="w-3 h-3 text-muted-foreground" />
                </motion.button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 4, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.95 }} transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-52 rounded-xl overflow-hidden py-2"
                      style={{
                        background: isLight ? 'rgba(255,255,255,0.92)' : 'rgba(8,16,38,0.95)',
                        backdropFilter: 'blur(24px)',
                        border: `1px solid ${isLight ? 'rgba(147,197,253,0.3)' : 'rgba(111,168,255,0.15)'}`,
                        boxShadow: isLight ? '0 12px 40px rgba(147,197,253,0.2)' : '0 12px 40px rgba(0,0,0,0.5)',
                      }}
                    >
                      <div className="px-4 py-2 border-b" style={{ borderColor: isLight ? 'rgba(147,197,253,0.2)' : 'rgba(111,168,255,0.1)' }}>
                        <p className="font-mono text-[11px] text-foreground font-medium truncate">{user.full_name}</p>
                        <p className="font-mono text-[9px] text-muted-foreground truncate">{user.email}</p>
                        <span className="mt-1 inline-block px-1.5 py-0.5 rounded text-[8px] font-bold uppercase"
                          style={{ background: isAdmin ? 'rgba(232,184,75,0.15)' : 'rgba(99,179,237,0.1)', color: isAdmin ? 'hsl(var(--steami-gold))' : 'hsl(var(--steami-cyan))' }}>
                          {user.role}
                        </span>
                      </div>
                      {isAdmin && (
                        <Link to="/admin" onClick={() => setUserMenuOpen(false)}
                          className="w-full text-left px-4 py-2.5 flex items-center gap-2 font-mono text-[10px] tracking-wider uppercase text-steami-gold hover:bg-accent/10 transition-colors">
                          <Shield className="w-3.5 h-3.5" /> Admin Panel
                        </Link>
                      )}
                      <Link to="/dashboard" onClick={() => setUserMenuOpen(false)}
                        className="w-full text-left px-4 py-2.5 flex items-center gap-2 font-mono text-[10px] tracking-wider uppercase text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-colors block">
                        <User className="w-3.5 h-3.5" /> Dashboard
                      </Link>
                      <button onClick={() => { logout(); setUserMenuOpen(false); }}
                        className="w-full text-left px-4 py-2.5 flex items-center gap-2 font-mono text-[10px] tracking-wider uppercase text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-colors">
                        <LogOut className="w-3.5 h-3.5" /> Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                onClick={() => setAuthOpen(true)}
                className="flex items-center gap-1.5 font-mono text-[10px] tracking-wider uppercase px-3 py-1.5 rounded-md transition-all text-muted-foreground hover:text-steami-cyan"
                style={btnStyle}>
                <LogIn className="w-3.5 h-3.5" /> LOGIN
              </motion.button>
            )}
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setMenuOpen(v => !v)} className="md:hidden relative w-8 h-8 flex items-center justify-center focus:outline-none">
            <span className="sr-only">{menuOpen ? 'Close' : 'Menu'}</span>
            <span className="block absolute w-5" style={{ height: 14 }}>
              <span className="block absolute h-[2px] w-5 rounded-full bg-foreground transition-all duration-300" style={{ top: menuOpen ? 6 : 0, transform: menuOpen ? 'rotate(45deg)' : 'rotate(0)' }} />
              <span className="block absolute top-[6px] h-[2px] w-5 rounded-full bg-foreground transition-all duration-300" style={{ opacity: menuOpen ? 0 : 1 }} />
              <span className="block absolute h-[2px] w-5 rounded-full bg-foreground transition-all duration-300" style={{ top: menuOpen ? 6 : 12, transform: menuOpen ? 'rotate(-45deg)' : 'rotate(0)' }} />
            </span>
          </button>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div key="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }} className="fixed inset-0 z-[49]"
              style={{ background: isLight ? 'rgba(186,230,253,0.4)' : 'rgba(0,0,0,0.6)' }} onClick={closeMenu} />
            <motion.div key="panel" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className="fixed top-0 right-0 bottom-0 z-[51] w-[75vw] max-w-xs flex flex-col pt-16 px-6 pb-8"
              style={{
                background: isLight ? 'rgba(255,255,255,0.95)' : 'rgba(10,18,42,0.97)',
                backdropFilter: 'blur(24px) saturate(160%)',
                borderLeft: isLight ? '1px solid rgba(147,197,253,0.3)' : '1px solid rgba(111,168,255,0.1)',
                boxShadow: isLight ? '-8px 0 40px rgba(147,197,253,0.15)' : '-8px 0 40px rgba(0,0,0,0.5)',
              }}>
              <div className="flex flex-col gap-1">
                {navLinks.map((link, i) => {
                  const isActive = location.pathname === link.path;
                  return (
                    <motion.div key={link.path} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 + i * 0.06 }}>
                      <Link to={link.path} onClick={closeMenu}
                        className={`flex items-center gap-2 font-mono text-[13px] tracking-[0.14em] uppercase py-3 px-3 rounded-lg transition-colors ${isActive ? 'text-steami-cyan bg-accent/10' : 'text-foreground/70 hover:text-foreground hover:bg-accent/5'}`}>
                        {(link as any).icon && <Shield className="w-3.5 h-3.5 text-steami-gold" />}
                        {link.label}
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
              <div className="my-5 h-px bg-border/30" />
              <motion.div className="mt-auto flex flex-col gap-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                {isAuthenticated && user ? (
                  <button onClick={() => { logout(); closeMenu(); }}
                    className="w-full font-mono text-[11px] tracking-wider uppercase px-4 py-3 rounded-lg flex items-center justify-center gap-2 text-muted-foreground"
                    style={{ border: `1px solid ${isLight ? 'rgba(147,197,253,0.4)' : 'rgba(99,179,237,0.18)'}`, background: isLight ? 'rgba(224,242,254,0.5)' : 'rgba(10,25,55,0.4)' }}>
                    <LogOut className="w-3.5 h-3.5" /> SIGN OUT
                  </button>
                ) : (
                  <button onClick={() => { closeMenu(); setTimeout(() => setAuthOpen(true), 200); }}
                    className="w-full font-mono text-[11px] tracking-wider uppercase px-4 py-3 rounded-lg flex items-center justify-center gap-2 text-muted-foreground"
                    style={{ border: `1px solid ${isLight ? 'rgba(147,197,253,0.4)' : 'rgba(99,179,237,0.18)'}`, background: isLight ? 'rgba(224,242,254,0.5)' : 'rgba(10,25,55,0.4)' }}>
                    <LogIn className="w-3.5 h-3.5" /> LOGIN
                  </button>
                )}
                <button onClick={toggleTheme}
                  className="w-full font-mono text-[11px] tracking-wider uppercase px-4 py-3 rounded-lg flex items-center justify-center gap-2 text-muted-foreground"
                  style={{ border: `1px solid ${isLight ? 'rgba(147,197,253,0.4)' : 'rgba(99,179,237,0.18)'}`, background: isLight ? 'rgba(224,242,254,0.5)' : 'rgba(10,25,55,0.4)' }}>
                  {isLight ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
                  {isLight ? 'DARK MODE' : 'LIGHT MODE'}
                </button>
                <SubBtn mobile />
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} onSuccess={handleAuthSuccess} />
    </>
  );
}
