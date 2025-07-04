import React from 'react';
import Disclaimers from './Disclaimers';
import { Link } from 'react-router-dom';
import { LinkedinIcon, XIcon, YoutubeIcon, InstagramIcon } from './BrandIcons';

function Footer() {
  return (
    <footer className="app-footer font-sans">
      <div className="max-w-6xl mx-auto grid gap-8 md:grid-cols-3">
        <div>
          <Link to="/" className="font-bold text-xl text-white">RewardRadar</Link>
          <p className="text-sm mt-1">ABN 12 345 678 910</p>
        </div>
        <div className="flex justify-between">
          <div>
            <h4 className="font-semibold uppercase text-sm mb-2">Quick Links</h4>
            <nav className="space-y-1 text-sm">
              <Link to="/credit-cards" className="hover:underline">Credit Cards</Link>
              <Link to="/home-loans" className="hover:underline">Home Loans</Link>
              <Link to="/deposits" className="hover:underline">Deposits</Link>
            </nav>
          </div>
          <div>
            <h4 className="font-semibold uppercase text-sm mb-2">Policies &amp; Terms</h4>
            <nav className="space-y-1 text-sm">
              <Link to="/privacy" className="hover:underline">Privacy Policy</Link>
              <Link to="/terms" className="hover:underline">Terms of Use</Link>
              <a href="mailto:support@rewardradar.com" className="hover:underline">Contact Us</a>
            </nav>
          </div>
          <div>
            <h4 className="font-semibold uppercase text-sm mb-2">Social</h4>
            <div className="flex gap-4 mt-1">
              <a href="https://www.linkedin.com" aria-label="LinkedIn" className="hover:opacity-80">
                <LinkedinIcon className="w-5 h-5" />
              </a>
              <a href="https://x.com" aria-label="X" className="hover:opacity-80">
                <XIcon className="w-5 h-5" />
              </a>
              <a href="https://www.youtube.com" aria-label="YouTube" className="hover:opacity-80">
                <YoutubeIcon className="w-5 h-5" />
              </a>
              <a href="https://www.instagram.com" aria-label="Instagram" className="hover:opacity-80">
                <InstagramIcon className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
        <div className="text-xs opacity-80 md:col-span-3">
          <details className="border-t border-white/20 pt-2 mt-6">
            <summary className="cursor-pointer font-semibold">Disclaimers &amp; Disclosures</summary>
            <Disclaimers className="mt-2" />
          </details>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
