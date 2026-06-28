import React from 'react';
import { Link } from 'react-router-dom';
import Hero3D from '../components/landing/Hero3D.jsx';
import HowItWorks from '../components/landing/HowItWorks.jsx';
import WhyUs from '../components/landing/WhyUs.jsx';
import TrustSignals from '../components/landing/TrustSignals.jsx';
import FAQ from '../components/landing/FAQ.jsx';

function LandingPage() {
  return (
    <div>
      <Hero3D />
      <TrustSignals />
      <HowItWorks />
      <WhyUs />
      <FAQ />

      {/* Final CTA */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-[#1e2a5a] to-[#1556f0] text-white">
        <div className="max-w-3xl mx-auto px-4 md:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to compare?
          </h2>
          <p className="text-white/80 mb-8">
            Filter, shortlist and compare in under two minutes.
          </p>
          <Link
            to="/credit-cards"
            className="inline-block btn btn-primary text-base px-8 py-3 rounded-xl shadow-lg hover:scale-[1.02] transition-transform"
          >
            Browse credit cards →
          </Link>
          <p className="text-xs text-white/60 mt-6 max-w-md mx-auto">
            Information on this site is general only and does not consider your personal circumstances. Always read the issuer's PDS before applying.
          </p>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;
