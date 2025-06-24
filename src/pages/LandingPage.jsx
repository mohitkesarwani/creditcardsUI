import React from 'react';
import { Link } from 'react-router-dom';
// Landing page hero focuses on clear messaging without busy animation

function LandingPage() {
  return (
    <div>
      <section className="bg-gray-50 px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900">
            Compare and Choose the Right Financial Products for You
          </h1>
          <p className="mb-8 text-lg text-gray-700">
            Find and compare credit cards, home loans, and deposit accounts based on your needs.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/credit-cards" className="btn btn-primary">Explore Credit Cards</Link>
            <Link to="/home-loans" className="btn btn-secondary">Compare Home Loans</Link>
            <Link to="/deposits" className="btn btn-secondary">Find Deposit Accounts</Link>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            <div className="p-6 bg-white rounded-lg shadow hover:shadow-md transition">
              <h3 className="font-bold mb-2 flex items-center gap-2">
                <span role="img" aria-label="Airplane">✈️</span> Travel
              </h3>
              <p className="text-sm text-gray-600">Reward programs and points</p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow hover:shadow-md transition">
              <h3 className="font-bold mb-2 flex items-center gap-2">
                <span role="img" aria-label="Cash">💰</span> Cashback
              </h3>
              <p className="text-sm text-gray-600">Get value back on spending</p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow hover:shadow-md transition">
              <h3 className="font-bold mb-2 flex items-center gap-2">
                <span role="img" aria-label="Home">🏠</span> Home Loans
              </h3>
              <p className="text-sm text-gray-600">Fixed and variable rate options</p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow hover:shadow-md transition">
              <h3 className="font-bold mb-2 flex items-center gap-2">
                <span role="img" aria-label="Savings">💼</span> Deposits
              </h3>
              <p className="text-sm text-gray-600">High-interest savings and term deposits</p>
            </div>
          </div>
        </div>
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
