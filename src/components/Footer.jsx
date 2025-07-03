import React from 'react';
import Disclaimers from './Disclaimers';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-10 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
        <div>
          <Link to="/" className="flex items-center justify-center md:justify-start gap-2 mb-2">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="10" />
            </svg>
            <span className="font-bold">RewardRadar</span>
          </Link>
          <p className="text-sm">ABN 12 345 678 910</p>
        </div>
        <nav className="flex flex-col gap-2">
          <Link to="/credit-cards" className="hover:underline">Credit Cards</Link>
          <Link to="/home-loans" className="hover:underline">Home Loans</Link>
          <Link to="/deposits" className="hover:underline">Deposits</Link>
          <Link to="/privacy" className="hover:underline">Privacy Policy</Link>
        </nav>
        <div className="flex flex-col gap-1">
          <a href="mailto:support@rewardradar.com" className="hover:underline">support@rewardradar.com</a>
          <span>Live chat 9am-5pm AEST</span>
        </div>
      </div>
      <div className="max-w-6xl mx-auto mt-6 text-xs opacity-80">
        <details className="border-t border-white/20 pt-2">
          <summary className="cursor-pointer font-semibold">Disclaimers &amp; Disclosures</summary>
          <Disclaimers className="mt-2 mx-auto" />
        </details>
      </div>
    </footer>
  );
}

export default Footer;
