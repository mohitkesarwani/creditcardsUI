import React from 'react';
import Disclaimers from './Disclaimers';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="p-4 bg-gray-100 text-sm">
      <div className="max-w-4xl mx-auto space-y-4">
        <div>
          <Link to="/how-we-make-money" className="text-blue-600 underline">
            How we make money
          </Link>
        </div>
        <details className="border-t pt-2">
          <summary className="cursor-pointer font-semibold">Disclaimers &amp; Disclosures</summary>
          <Disclaimers className="mt-2" />
        </details>
      </div>
    </footer>
  );
}

export default Footer;
