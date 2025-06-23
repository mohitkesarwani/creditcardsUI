import React from 'react';
import { Link } from 'react-router-dom';
import HeroAnimation from '../components/HeroAnimation';
import AnimatedBackground from '../components/AnimatedBackground';

function LandingPage() {
  return (
    <div>
      <section className="relative text-white bg-gradient-to-r from-brand-start to-brand-end px-4 py-16 flex flex-col items-center overflow-hidden">
        <AnimatedBackground />
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
            <div className="feature-inner">
              <div className="icon-wrap">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <p className="text-left font-semibold">Scan &amp; Compare in Seconds</p>
            </div>
          </div>

          <div className="feature-box">
            <div className="feature-inner">
              <div className="icon-wrap">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="4" y1="21" x2="4" y2="14" />
                  <line x1="4" y1="10" x2="4" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12" y2="3" />
                  <line x1="20" y1="21" x2="20" y2="16" />
                  <line x1="20" y1="12" x2="20" y2="3" />
                  <line x1="1" y1="14" x2="7" y2="14" />
                  <line x1="9" y1="8" x2="15" y2="8" />
                  <line x1="17" y1="16" x2="23" y2="16" />
                </svg>
              </div>
              <p className="text-left font-semibold">Filter by What You Value</p>
            </div>
          </div>

          <div className="feature-box">
            <div className="feature-inner">
              <div className="icon-wrap">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 9h4M8 13h8M5 17h14" />
                </svg>
              </div>
              <p className="text-left font-semibold">Side-by-Side Comparison</p>
            </div>
          </div>

          <div className="feature-box">
            <div className="feature-inner">
              <div className="icon-wrap">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-3.5L6 21l1.5-7.5L2 9h7l3-7z" />
                </svg>
              </div>
              <p className="text-left font-semibold">No Sponsored Results</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;
