import React from 'react';
import Disclaimers from './Disclaimers';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="app-footer">
      <div className="max-w-6xl mx-auto px-4 text-center md:text-left">
        <nav className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
          <Link to="/how-we-make-money" className="hover:underline hover:text-accent">Important Information</Link>
          <Link to="/terms" className="hover:underline hover:text-accent">Terms &amp; Conditions</Link>
          <Link to="/faqs" className="hover:underline hover:text-accent">Help/FAQs</Link>
          <Link to="/privacy" className="hover:underline hover:text-accent">Privacy Policy</Link>
        </nav>
        <p className="text-xs opacity-80 mb-4">
          We provide general information only. Please consider your circumstances and the product disclosure statements.
        </p>
        <details className="border-t border-white/20 pt-2">
          <summary className="cursor-pointer font-semibold">Disclaimers &amp; Disclosures</summary>
          <Disclaimers className="mt-2 mx-auto" />
        </details>
      </div>
    </footer>
  );
}

export default Footer;
