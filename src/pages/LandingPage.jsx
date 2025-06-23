import React from 'react';
import { Link } from 'react-router-dom';

function LandingPage() {
  return (
    <div>
      <section className="text-white bg-gradient-to-r from-brand-start to-brand-end px-4 py-16 flex flex-col items-center">
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
      </section>

      <section id="features" className="py-16 px-4 text-center">
        <h2 className="text-3xl font-bold mb-8">Why RewardRadar?</h2>
        <div className="max-w-3xl mx-auto grid gap-4 md:grid-cols-2">
          <div className="p-4 border rounded shadow">Scan & Compare in Seconds</div>
          <div className="p-4 border rounded shadow">Filter by What You Value (Rewards, Flight Points, Cashback)</div>
          <div className="p-4 border rounded shadow">Side-by-Side Comparison Up to 4 Cards</div>
          <div className="p-4 border rounded shadow">No Sponsored Results — Just the Best for You</div>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;
