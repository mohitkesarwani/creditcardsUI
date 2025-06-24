import React from 'react';
import Disclaimers from './Disclaimers';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-gray-100 text-sm py-8 mt-12">
      <div className="max-w-6xl mx-auto px-4 space-y-4 text-center">
        <nav className="flex flex-wrap gap-4 justify-center">
          <Link to="/how-we-make-money" className="underline text-blue-600">Important Information</Link>
          <Link to="/terms" className="underline text-blue-600">Terms &amp; Conditions</Link>
          <Link to="/faqs" className="underline text-blue-600">Help/FAQs</Link>
          <Link to="/privacy" className="underline text-blue-600">Privacy Policy</Link>
        </nav>
        <p className="text-xs text-gray-600">
          We provide general information only. Please consider your circumstances and the product disclosure statements.
        </p>
        <details className="border-t pt-2">
          <summary className="cursor-pointer font-semibold">Disclaimers &amp; Disclosures</summary>
          <Disclaimers className="mt-2 mx-auto" />
        </details>
      </div>
    </footer>
  );
}

export default Footer;
