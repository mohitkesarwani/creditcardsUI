import React from 'react';
import { Link } from 'react-router-dom';

function Header() {
  return (
    <header className="flex items-center justify-between p-4 bg-white shadow">
      <Link to="/" className="flex items-center gap-2">
        <img src="/radar.svg" alt="RewardRadar logo" className="w-8 h-8" />
        <span className="text-xl font-bold text-brand-end">RewardRadar</span>
      </Link>
      <nav className="flex gap-4">
        <Link to="/cards" className="text-brand-start font-semibold">
          Browse Cards
        </Link>
        <Link to="/home-loans" className="text-brand-start font-semibold">
          Compare Home Loans
        </Link>
        <Link to="/deposits" className="text-brand-start font-semibold">
          Compare Deposits
        </Link>
      </nav>
    </header>
  );
}

export default Header;
