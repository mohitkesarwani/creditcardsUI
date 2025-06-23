import React from 'react';
import { Link } from 'react-router-dom';

function HomeLoansPage() {
  return (
    <div className="p-4 max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Home Loans</h1>
      <p>
        Compare the latest home loan offers. This section is coming soon.
      </p>
      <Link to="/" className="text-blue-600 underline">
        Back to home
      </Link>
    </div>
  );
}

export default HomeLoansPage;
