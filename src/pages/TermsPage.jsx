import React from 'react';
import { Link } from 'react-router-dom';

function TermsPage() {
  return (
    <div className="p-4 max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Terms &amp; Conditions</h1>
      <p>Our terms and conditions will be published here.</p>
      <Link to="/" className="text-blue-600 underline">Back to home</Link>
    </div>
  );
}

export default TermsPage;
