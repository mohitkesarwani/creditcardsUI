import React from 'react';
import { Link } from 'react-router-dom';

function FaqPage() {
  return (
    <div className="p-4 max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">FAQs</h1>
      <p>Common questions about our service will appear here.</p>
      <Link to="/" className="text-blue-600 underline">Back to home</Link>
    </div>
  );
}

export default FaqPage;
