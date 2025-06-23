import React from 'react';
import { Link } from 'react-router-dom';

function LandingPage() {
  return (
    <div className="flex items-center justify-center text-center p-8">
      <div className="max-w-2xl">
        <h1 className="text-3xl md:text-5xl font-bold mb-4">
          Compare Australian Credit Cards
        </h1>
        <p className="mb-6 text-lg">
          Find the right card for you by browsing and comparing the latest offers.
        </p>
        <Link
          to="/cards"
          className="px-6 py-3 bg-blue-600 text-white rounded shadow"
        >
          Browse Cards
        </Link>
      </div>
    </div>
  );
}

export default LandingPage;
