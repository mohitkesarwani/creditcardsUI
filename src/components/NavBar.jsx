import React from 'react';
import { Link } from 'react-router-dom';
import AnimatedRadarLogo from './AnimatedRadarLogo';

function NavBar() {
  return (
    <header className="bg-navy text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2" aria-label="RewardRadar home">
          <AnimatedRadarLogo className="w-8 h-8 text-white" />
          <span className="text-xl font-bold">RewardRadar</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold">
          <Link to="/">Home</Link>
          <Link to="/credit-cards">Credit Cards</Link>
          <Link to="/home-loans">Home Loans</Link>
          <Link to="/deposits">Deposits</Link>
          <Link to="/faqs">FAQs</Link>
          <Link to="/contact">Contact Us</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/login" className="btn btn-outline text-sm">Log In</Link>
          <Link to="/signup" className="btn btn-pill text-sm">Sign Up</Link>
        </div>
      </div>
    </header>
  );
}

export default NavBar;
