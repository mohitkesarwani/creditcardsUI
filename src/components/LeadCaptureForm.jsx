import React, { useState } from 'react';
import supabase from '../supabaseClient.js';

function LeadCaptureForm({ productType = 'credit', sourcePage = '' }) {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('leads').insert({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        product_type: productType,
        source_page: sourcePage,
      });
      if (error) throw error;
      if (window.gtag) {
        window.gtag('event', 'lead_submitted', {
          product_type: productType,
          source_page: sourcePage,
        });
      }
      setSubmitted(true);
    } catch (err) {
      console.error('Lead submission failed', err);
    }
  };

  if (submitted) {
    return <p className="py-4">Thanks! We'll be in touch soon.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2 max-w-sm">
      <input
        type="text"
        name="name"
        placeholder="Name"
        value={formData.name}
        onChange={handleChange}
        className="border p-2 w-full"
        required
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        className="border p-2 w-full"
        required
      />
      <input
        type="tel"
        name="phone"
        placeholder="Phone"
        value={formData.phone}
        onChange={handleChange}
        className="border p-2 w-full"
      />
      <button type="submit" className="btn btn-primary w-full">
        Get Advice
      </button>
    </form>
  );
}

export default LeadCaptureForm;
