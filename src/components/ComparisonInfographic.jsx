import React from 'react';

// Simple infographic component for comparison tools
// Text is optimized for brevity and clarity. Modify arrays to customize wording.
function ComparisonInfographic() {
  const eligibility = [
    'Age 18+ and above',
    'Resident in your region',
    'Regular income source',
    'Valid email or ID',
  ];

  const benefits = [
    'No setup fees or hidden checks',
    'Streamlined side-by-side views',
    'Mobile friendly on any device',
    'Get results quickly',
  ];

  const quickSteps = [
    'Open the tool on phone or laptop',
    'Skip lengthy forms at first',
    'Review results within 24-48h',
  ];

  return (
    <div className="bg-light-bg text-gray-800 font-sans">
      {/* Header Section */}
      <header className="text-center py-10 px-4 bg-gradient-to-b from-white to-blue-50">
        <h1 className="text-4xl font-extrabold text-navy mb-2">
          Compare Smarter
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          Start in under 5 minutes
        </p>
        <div className="flex justify-center gap-4 mb-4">
          <button className="bg-accent text-white px-5 py-2 rounded-lg font-semibold">
            Start Comparison
          </button>
          <button className="bg-white border border-accent text-accent px-5 py-2 rounded-lg font-semibold">
            Help & Resources
          </button>
        </div>
        <nav className="text-sm text-gray-500 flex justify-center gap-6">
          <a href="#requirements" className="hover:text-accent">Requirements</a>
          <a href="#support" className="hover:text-accent">Support</a>
        </nav>
      </header>

      {/* Eligibility Section */}
      <section id="requirements" className="py-12 px-4 text-center">
        <h2 className="text-2xl font-bold mb-6">Who Can Use This</h2>
        <ul className="max-w-md mx-auto text-left space-y-2">
          {eligibility.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <svg className="w-5 h-5 text-green-600 mt-[2px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Main Visual Section */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-3xl mx-auto grid grid-cols-3 gap-8 items-center">
          <svg className="w-16 h-16 mx-auto text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="2" ry="2" />
            <line x1="2" y1="10" x2="22" y2="10" />
          </svg>
          <svg className="w-16 h-16 mx-auto text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <svg className="w-16 h-16 mx-auto text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3h18v18H3z" />
            <path d="M3 9h18" />
            <path d="M9 21V9" />
          </svg>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 px-4 bg-gray-50" id="benefits">
        <h2 className="text-2xl font-bold text-center mb-6">Why It’s Easier</h2>
        <ul className="max-w-xl mx-auto space-y-3">
          {benefits.map((b) => (
            <li key={b} className="flex items-start gap-2">
              <strong className="text-accent">•</strong>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* About Section */}
      <section className="py-12 px-4 text-center bg-white">
        <h2 className="text-2xl font-bold mb-4">About the Tool</h2>
        <p className="max-w-2xl mx-auto mb-6 text-gray-700">
          Quickly compare loans, plans, or services in one place. Adjust filters as you go and find your best match fast.
        </p>
        <button className="bg-accent text-white px-6 py-3 rounded-lg font-semibold">
          Begin Now
        </button>
      </section>

      {/* Quick Start Section */}
      <section className="py-12 px-4 bg-gray-50" id="support">
        <h2 className="text-2xl font-bold text-center mb-4">Get Started</h2>
        <p className="text-center text-gray-600 mb-6">Start in 5 minutes, results in 24–48 hours.</p>
        <div className="max-w-md mx-auto">
          <ul className="space-y-2 mb-6">
            {quickSteps.map((step) => (
              <li key={step} className="flex items-start gap-2">
                <svg className="w-5 h-5 text-green-600 mt-[2px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>{step}</span>
              </li>
            ))}
          </ul>
          <div className="flex justify-center">
            <svg className="w-24 h-24 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 5h18v14H3z" />
              <path d="M8 21h8" />
            </svg>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ComparisonInfographic;
