import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import AnimatedRadarLogo from './AnimatedRadarLogo';
import useDarkMode from '../hooks/useDarkMode';
import { useAuth } from '../hooks/useAuth.jsx';

const NAV_LINKS = [
  { to: '/',              label: 'Home', end: true },
  { to: '/credit-cards',  label: 'Credit Cards' },
  { to: '/home-loans',    label: 'Home Loans' },
  { to: '/deposits',      label: 'Deposits' },
  { to: '/faqs',          label: 'FAQs' },
  { to: '/contact',       label: 'Contact' },
];

function SunIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 3a1 1 0 01.993.883L13 4v1a1 1 0 01-1.993.117L11 5V4a1 1 0 011-1zM4.22 5.22a1 1 0 011.497 1.32l-.083.094L4.94 7.313a1 1 0 01-1.498-1.32l.083-.094zM3 11a1 1 0 01.117 1.993L3 13H2a1 1 0 01-.117-1.993L2 11h1zm8-7a1 1 0 01.993.883L12 5v1a1 1 0 01-1.993.117L10 6V5a1 1 0 011-1zm9.78 1.22a1 1 0 01.094 1.32l-.083.094-1.414 1.415a1 1 0 01-1.497-1.32l.083-.094 1.415-1.415a1 1 0 011.402 0zM21 11a1 1 0 01.117 1.993L21 13h-1a1 1 0 01-.117-1.993L20 11h1zm-8 8a1 1 0 01.993.883L14 20v1a1 1 0 01-1.993.117L12 21v-1a1 1 0 011-1zm-9.78-1.22a1 1 0 011.32-.083l.094.083 1.414 1.415a1 1 0 01-1.32 1.497l-.094-.083L3.22 17.78a1 1 0 010-1.402zm16.56 0a1 1 0 011.32-.083l.094.083a1 1 0 010 1.497l-1.415 1.415a1 1 0 01-1.497-1.32l.083-.094 1.415-1.415zM11 21a1 1 0 01.117 1.993L11 23H10a1 1 0 01-.117-1.993L10 21h1zm1-6a4 4 0 100-8 4 4 0 000 8z" />
    </svg>
  );
}
function MoonIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.293 13.293A8 8 0 0110.707 6.707a8 8 0 106.586 6.586z" />
    </svg>
  );
}

function NavBar() {
  const [dark, setDark] = useDarkMode();
  const { authed, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Close mobile drawer on navigation
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  // Trap body scroll while drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [mobileOpen]);

  const desktopLink = ({ isActive }) =>
    'relative py-1 px-0.5 transition-colors duration-200 min-h-[44px] inline-flex items-center ' +
    (isActive ? 'text-white' : 'text-ink-300 hover:text-white');

  return (
    <>
      <header className="sticky top-0 z-40 glass-dark border-b border-white/10 text-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-2 group shrink-0" aria-label="RewardRadar home">
            <AnimatedRadarLogo className="w-8 h-8 text-brand-400 group-hover:text-brand-300 transition-colors" />
            <span className="text-xl font-bold tracking-tight text-white">RewardRadar</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-7 text-[14px] font-medium">
            {NAV_LINKS.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} className={desktopLink}>
                {({ isActive }) => (
                  <>
                    {l.label}
                    {isActive && <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-brand-400 rounded-full" />}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setDark(!dark)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white focus:outline-none transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {dark ? <SunIcon /> : <MoonIcon />}
            </button>
            {/* Login is intentionally hidden from the public nav — the site is
                anonymous-by-design ("no sign-up" marketing wedge). The /login
                route is still accessible by direct URL for future admin use.
                We only surface a Log Out button if a session is active. */}
            {authed && (
              <button onClick={logout} className="hidden md:inline-flex btn btn-outline text-sm">Log Out</button>
            )}
            {/* Hamburger — mobile only */}
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              aria-expanded={mobileOpen}
              className="md:hidden p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <line x1="3" y1="6"  x2="21" y2="6"  strokeLinecap="round" />
                <line x1="3" y1="12" x2="21" y2="12" strokeLinecap="round" />
                <line x1="3" y1="18" x2="21" y2="18" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden animate-fade-in" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-[88%] max-w-sm bg-ink-950 text-white shadow-lift-lg flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <span className="text-sm uppercase tracking-[0.16em] text-ink-400 font-semibold">Menu</span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="p-2 rounded-lg hover:bg-white/10 text-white min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto py-2">
              {NAV_LINKS.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.end}
                  className={({ isActive }) =>
                    'flex items-center px-5 py-3 text-base font-medium border-l-2 transition-colors ' +
                    (isActive
                      ? 'text-brand-300 border-brand-400 bg-white/5'
                      : 'text-ink-200 border-transparent hover:bg-white/5 hover:text-white')
                  }
                >
                  {l.label}
                </NavLink>
              ))}
            </nav>
            {authed && (
              <div className="border-t border-white/10 p-4">
                <button
                  onClick={() => { logout(); setMobileOpen(false); }}
                  className="btn btn-outline w-full text-sm bg-transparent border-white/30 text-white hover:bg-white/10"
                >
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default NavBar;
