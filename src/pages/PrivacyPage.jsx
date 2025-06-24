import React from 'react';
import { Link } from 'react-router-dom';

function PrivacyPage() {
  return (
    <div className="p-4 max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Privacy Policy</h1>
      <p>Details about how we handle your data will be available soon.</p>
      <Link to="/" className="text-blue-600 underline">Back to home</Link>
    </div>
  );
}

export default PrivacyPage;
