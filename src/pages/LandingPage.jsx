import React from 'react';
import { Link } from 'react-router-dom';
import HeroAnimation from '../components/HeroAnimation';

function LandingPage() {
  return (
    <div>
      <section className="relative text-white bg-gradient-to-r from-brand-start to-brand-end px-4 py-16 flex flex-col items-center overflow-hidden">
        <div className="max-w-3xl text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Track the Best Credit Card Rewards Instantly
          </h1>
          <p className="mb-8 text-lg md:text-xl">
            Use RewardRadar to compare, filter and apply for the credit cards that give you more.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/cards" className="px-6 py-3 bg-white text-brand-start font-semibold rounded shadow">
              Compare Now
            </Link>
            <a href="#features" className="px-6 py-3 bg-white/20 text-white font-semibold rounded border border-white">
              Explore Rewards
            </a>
          </div>
        </div>
        <div className="relative mt-12 w-64 h-64">
          <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-pulse" />
          <div className="absolute inset-6 rounded-full border border-white/30" />
          <div className="absolute inset-12 rounded-full border border-white/30" />
          <Link to="/cards" className="absolute bg-white text-brand-start text-xs font-semibold px-2 py-1 rounded-full top-4 left-1/2 -translate-x-1/2">
            Travel
          </Link>
          <Link to="/cards" className="absolute bg-white text-brand-start text-xs font-semibold px-2 py-1 rounded-full top-1/2 right-4 -translate-y-1/2">
            Cashback
          </Link>
          <Link to="/cards" className="absolute bg-white text-brand-start text-xs font-semibold px-2 py-1 rounded-full bottom-4 left-1/2 -translate-x-1/2">
            Balance Transfer
          </Link>
          <Link to="/cards" className="absolute bg-white text-brand-start text-xs font-semibold px-2 py-1 rounded-full top-1/2 left-4 -translate-y-1/2">
            Business
          </Link>
        </div>
        <HeroAnimation />
      </section>

      <section id="features" className="py-16 px-4 text-center">
        <h2 className="text-3xl font-bold mb-8">Why RewardRadar?</h2>
        <div className="max-w-3xl mx-auto grid gap-6 md:grid-cols-2">
          <div className="feature-box">
            <div className="p-3 rounded-full bg-gradient-to-r from-brand-start to-brand-end text-white shadow">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <rect x="2" y="6" width="20" height="12" rx="2" ry="2" />
                <path d="M2 10h20" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
            <p className="text-left font-semibold">Scan &amp; Compare in Seconds</p>
          </div>

          <div className="feature-box">
            <div className="p-3 rounded-full bg-gradient-to-r from-brand-start to-brand-end text-white shadow">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="21" x2="20" y2="21" />
                <line x1="10" y1="3" x2="14" y2="3" />
                <line x1="12" y1="3" x2="12" y2="17" />
              </svg>
            </div>
            <p className="text-left font-semibold">Filter by What You Value</p>
          </div>

          <div className="feature-box">
            <div className="p-3 rounded-full bg-gradient-to-r from-brand-start to-brand-end text-white shadow">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <rect x="4" y="3" width="4" height="18" />
                <rect x="10" y="9" width="4" height="12" />
                <rect x="16" y="13" width="4" height="8" />
              </svg>
            </div>
            <p className="text-left font-semibold">Side-by-Side Comparison</p>
          </div>

          <div className="feature-box">
            <div className="p-3 rounded-full bg-gradient-to-r from-brand-start to-brand-end text-white shadow">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l7 4v6c0 5-3.5 9.74-7 10-3.5-.26-7-5-7-10V6l7-4z" />
              </svg>
            </div>
            <p className="text-left font-semibold">No Sponsored Results</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;
