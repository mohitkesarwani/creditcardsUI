import React from 'react';
import { Link } from 'react-router-dom';
import LeadCaptureForm from '../components/LeadCaptureForm.jsx';

function ContactPage() {
  return (
    <div className="p-4 max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Contact Us</h1>
      <p className="mb-4">Get in touch via email at contact@example.com or leave your details below and we'll connect you with a broker.</p>
      <LeadCaptureForm sourcePage="contact" />
      <Link to="/" className="text-blue-600 underline block mt-4">Back to home</Link>
    </div>
  );
}

export default ContactPage;
