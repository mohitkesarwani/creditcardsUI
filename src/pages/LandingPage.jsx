import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import HeroInfographic from '../components/HeroInfographic';
import HowItWorksSection from '../components/HowItWorksSection';
import BenefitsSection from '../components/BenefitsSection';
// Landing page hero focuses on clear messaging without busy animation

function LandingPage() {
  return (
    <div>
      <section className="bg-gray-50 px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto">
          <motion.h1
            className="text-5xl md:text-7xl font-bold mb-4 text-gray-900"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Smarter Financial Decisions Start Here.
          </motion.h1>
          <p className="mb-8 text-lg text-gray-700">
            Compare credit cards, home loans, and deposits in one simple dashboard—tailored to your goals.
          </p>
          <HeroInfographic />
          <a
            href="#how-it-works"
            className="inline-flex items-center gap-2 text-brand-start font-semibold group mt-6"
          >
            <span className="transition-transform duration-300 ease-in-out group-hover:translate-x-2">
              See How It Works
            </span>
            <svg
              className="w-6 h-6 opacity-80 transition-transform duration-300 ease-in-out group-hover:opacity-100 group-hover:scale-110"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </a>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
            <Link to="/credit-cards" className="btn btn-primary">Compare Credit Cards</Link>
            <Link to="/home-loans" className="btn btn-secondary">Compare Home Loans</Link>
            <Link to="/deposits" className="btn btn-secondary">Compare Deposit Accounts</Link>
          </div>
          <div className="mt-6 text-xs text-gray-500">
            Information is general only. Compare options based on your needs. We don’t promote sponsored products.
          </div>
        </div>
      </section>
      <HowItWorksSection />
      <BenefitsSection />

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
              <p className="text-left font-semibold">Quickly compare options</p>
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
              <p className="text-left font-semibold">Filter by what matters to you</p>
            </div>
          </div>

          <div className="feature-box">
            <div className="feature-inner">
              <div className="icon-wrap">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 9h4M8 13h8M5 17h14" />
                </svg>
              </div>
              <p className="text-left font-semibold">Side-by-side comparison</p>
            </div>
          </div>

          <div className="feature-box">
            <div className="feature-inner">
              <div className="icon-wrap">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-3.5L6 21l1.5-7.5L2 9h7l3-7z" />
                </svg>
              </div>
              <p className="text-left font-semibold">Independent information</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;
