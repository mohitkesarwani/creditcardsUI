import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import AnimatedRadarLogo from './AnimatedRadarLogo';
import useDarkMode from '../hooks/useDarkMode';
import { useAuth } from '../hooks/useAuth.jsx';

function NavBar() {
  const [dark, setDark] = useDarkMode();
  const { authed, logout } = useAuth();

  return (
    <header className="bg-black text-white shadow">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-[14px] flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2" aria-label="RewardRadar home">
          <AnimatedRadarLogo className="w-8 h-8 text-accent" />
          <span className="text-xl font-bold">RewardRadar</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-[15px] font-medium">
          <NavLink to="/" className={({isActive}) => isActive ? 'border-b-2 border-secondary pb-1' : 'hover:underline'}>Home</NavLink>
          <NavLink to="/credit-cards" className={({isActive}) => isActive ? 'border-b-2 border-secondary pb-1' : 'hover:underline'}>Credit Cards</NavLink>
          <NavLink to="/home-loans" className={({isActive}) => isActive ? 'border-b-2 border-secondary pb-1' : 'hover:underline'}>Home Loans</NavLink>
          <NavLink to="/deposits" className={({isActive}) => isActive ? 'border-b-2 border-secondary pb-1' : 'hover:underline'}>Deposits</NavLink>
          <NavLink to="/faqs" className={({isActive}) => isActive ? 'border-b-2 border-secondary pb-1' : 'hover:underline'}>FAQs</NavLink>
          <NavLink to="/contact" className={({isActive}) => isActive ? 'border-b-2 border-secondary pb-1' : 'hover:underline'}>Contact Us</NavLink>
        </nav>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDark(!dark)}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 focus:outline-none"
            aria-label="Toggle dark mode"
          >
            {dark ? (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3a1 1 0 01.993.883L13 4v1a1 1 0 01-1.993.117L11 5V4a1 1 0 011-1zM4.22 5.22a1 1 0 011.497 1.32l-.083.094L4.94 7.313a1 1 0 01-1.498-1.32l.083-.094zM3 11a1 1 0 01.117 1.993L3 13H2a1 1 0 01-.117-1.993L2 11h1zm8-7a1 1 0 01.993.883L12 5v1a1 1 0 01-1.993.117L10 6V5a1 1 0 011-1zm9.78 1.22a1 1 0 01.094 1.32l-.083.094-1.414 1.415a1 1 0 01-1.497-1.32l.083-.094 1.415-1.415a1 1 0 011.402 0zM21 11a1 1 0 01.117 1.993L21 13h-1a1 1 0 01-.117-1.993L20 11h1zm-8 8a1 1 0 01.993.883L14 20v1a1 1 0 01-1.993.117L12 21v-1a1 1 0 011-1zm-9.78-1.22a1 1 0 011.32-.083l.094.083 1.414 1.415a1 1 0 01-1.32 1.497l-.094-.083L3.22 17.78a1 1 0 010-1.402zm16.56 0a1 1 0 011.32-.083l.094.083a1 1 0 010 1.497l-1.415 1.415a1 1 0 01-1.497-1.32l.083-.094 1.415-1.415zM11 21a1 1 0 01.117 1.993L11 23H10a1 1 0 01-.117-1.993L10 21h1zm1-6a4 4 0 100-8 4 4 0 000 8z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.293 13.293A8 8 0 0110.707 6.707a8 8 0 106.586 6.586z" />
              </svg>
            )}
          </button>
          {authed ? (
            <button onClick={logout} className="btn btn-outline text-sm">
              Log Out
            </button>
          ) : (
            <Link to="/login" className="btn btn-outline text-sm">Log In</Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default NavBar;
