import React from 'react';
import { Link } from 'react-router-dom';

function HowWeMakeMoneyPage() {
  return (
    <div className="p-4 max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">How we make money</h1>
      <p>
        RewardRadar may receive a commission when you apply for credit cards through our links. These commissions help us maintain the site and continue providing free comparisons.
      </p>
      <p>
        We strive to keep our comparisons independent and based on publicly available data. Our editorial content is not influenced by any financial institution.
      </p>
      <Link to="/" className="text-blue-600 underline">
        Back to home
      </Link>
    </div>
  );
}

export default HowWeMakeMoneyPage;
