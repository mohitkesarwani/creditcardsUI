import React from 'react';
import { Link } from 'react-router-dom';

function ContactPage() {
  return (
    <div className="p-4 max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Contact Us</h1>
      <p>Get in touch via email at contact@example.com.</p>
      <Link to="/" className="text-blue-600 underline">Back to home</Link>
    </div>
  );
}

export default ContactPage;
