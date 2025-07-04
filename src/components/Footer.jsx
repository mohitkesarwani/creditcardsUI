import React from 'react';
import Disclaimers from './Disclaimers';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-black text-white px-6 py-10">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
        <div>
          <Link to="/" className="flex items-center justify-center md:justify-start gap-2 mb-2 hover:underline">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="10" />
            </svg>
            <span className="font-bold">RewardRadar</span>
          </Link>
          <p className="text-sm">ABN 12 345 678 910</p>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Quick Links</h4>
          <nav className="flex flex-col gap-1 text-sm">
            <Link to="/credit-cards" className="hover:underline">Credit Cards</Link>
            <Link to="/home-loans" className="hover:underline">Home Loans</Link>
            <Link to="/deposits" className="hover:underline">Deposits</Link>
          </nav>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Policies &amp; Terms</h4>
          <nav className="flex flex-col gap-1 text-sm">
            <Link to="/privacy" className="hover:underline">Privacy Policy</Link>
            <Link to="/terms" className="hover:underline">Terms of Use</Link>
            <Link to="/how-we-make-money" className="hover:underline">How We Make Money</Link>
          </nav>
        </div>
        <div className="md:col-span-3 flex justify-center md:justify-between items-center mt-4">
          <div className="flex gap-4 text-xl">
            <a href="#" aria-label="X" className="hover:underline">X</a>
            <a href="#" aria-label="Facebook" className="hover:underline">FB</a>
            <a href="#" aria-label="LinkedIn" className="hover:underline">in</a>
            <a href="#" aria-label="Instagram" className="hover:underline">IG</a>
          </div>
        </div>
      </div>
      <p className="mt-6 text-xs text-center opacity-80">We acknowledge the Traditional Owners of the land and pay our respects to Elders past and present.</p>
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
