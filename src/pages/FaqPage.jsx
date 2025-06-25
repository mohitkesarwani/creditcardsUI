import React from 'react';
import { Link } from 'react-router-dom';
import SectionHeader from '../components/SectionHeader';
import FAQAccordion from '../components/FAQAccordion';

function FaqPage() {
  const items = [
    {
      question: 'How does this service work?',
      answer: 'We aggregate financial products so you can easily compare options.',
    },
    {
      question: 'Is the information independent?',
      answer: 'Yes, our comparisons are based on publicly available data.',
    },
  ];
  return (
    <div className="p-4 max-w-2xl mx-auto space-y-4">
      <SectionHeader title="FAQs" />
      <FAQAccordion items={items} />
      <Link to="/" className="text-blue-600 underline">Back to home</Link>
    </div>
  );
}

export default FaqPage;
