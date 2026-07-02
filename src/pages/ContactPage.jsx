import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../hooks/useToast.tsx';

// Placeholder contact details — to be replaced when the support inbox + phone
// are stood up. Form submissions log to the console for now and surface a
// success toast so the page is usable.

const TOPICS = [
  { value: 'general',   label: 'General enquiry' },
  { value: 'data',      label: 'Product / data issue' },
  { value: 'bug',       label: 'Bug or website problem' },
  { value: 'feedback',  label: 'Feature feedback' },
  { value: 'media',     label: 'Media / partnerships' },
];

function ContactPage() {
  const toast = useToast();
  const [form, setForm] = useState({ name: '', email: '', topic: 'general', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const update = (k) => (e) => setForm((s) => ({ ...s, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast?.addToast?.('error', 'Please fill in name, email and message.');
      return;
    }
    setSubmitting(true);
    // Placeholder: log + simulate a network round-trip.
    // eslint-disable-next-line no-console
    console.info('[ContactPage] submission', form);
    await new Promise((r) => setTimeout(r, 600));
    toast?.addToast?.('success', "Thanks — we'll be in touch within 2 business days.");
    setForm({ name: '', email: '', topic: 'general', message: '' });
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen" style={{ background: 'rgb(var(--surface-subtle))' }}>
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-10 md:py-14">
        {/* Hero */}
        <header className="mb-8 md:mb-10">
          <p className="text-xs uppercase tracking-[0.16em] text-brand-700 font-bold mb-2">Get in touch</p>
          <h1 className="text-display-sm md:text-display font-bold text-ink-900 tracking-tighter-2 mb-3">
            Contact us
          </h1>
          <p className="text-lg text-ink-600 leading-relaxed max-w-2xl">
            Question we didn't cover in the <Link to="/faqs" className="text-brand-700 hover:underline">FAQ</Link>?
            Spot a product that's missing or a number that looks off? Drop us a line.
          </p>
        </header>

        <div className="grid md:grid-cols-[1fr_320px] gap-6 md:gap-8">
          {/* Form */}
          <form onSubmit={submit} className="surface p-5 md:p-7 space-y-4" noValidate>
            <h2 className="text-lg font-semibold text-ink-900">Send a message</h2>

            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="block text-xs uppercase tracking-wide text-ink-500 font-semibold mb-1">Name</span>
                <input
                  type="text"
                  value={form.name}
                  onChange={update('name')}
                  required
                  placeholder="Jane Citizen"
                  className="w-full text-sm"
                />
              </label>
              <label className="block">
                <span className="block text-xs uppercase tracking-wide text-ink-500 font-semibold mb-1">Email</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={update('email')}
                  required
                  placeholder="you@example.com"
                  className="w-full text-sm"
                />
              </label>
            </div>

            <label className="block">
              <span className="block text-xs uppercase tracking-wide text-ink-500 font-semibold mb-1">Topic</span>
              <select value={form.topic} onChange={update('topic')} className="w-full text-sm">
                {TOPICS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </label>

            <label className="block">
              <span className="block text-xs uppercase tracking-wide text-ink-500 font-semibold mb-1">Message</span>
              <textarea
                value={form.message}
                onChange={update('message')}
                required
                rows={6}
                placeholder="What can we help with? Include the product name and issuer if it's data-related."
                className="w-full text-sm resize-y"
              />
            </label>

            <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
              <p className="text-[11px] text-ink-500 leading-snug">
                By submitting you agree to our{' '}
                <Link to="/privacy" className="text-brand-700 hover:underline">privacy policy</Link>.
                We don't sell your data.
              </p>
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary disabled:opacity-60 disabled:cursor-not-allowed shrink-0"
              >
                {submitting ? 'Sending…' : 'Send message'}
              </button>
            </div>
          </form>

          {/* Sidebar */}
          <aside className="space-y-4">
            <div className="surface p-5">
              <h3 className="text-sm font-semibold text-ink-900 mb-3">Other ways to reach us</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 20 20" className="w-4 h-4" fill="currentColor"><path d="M2.94 4.21A2 2 0 0 1 4.83 3h10.34a2 2 0 0 1 1.89 1.21l-7.06 4.41-7.06-4.41Zm14.06 1.93-6.4 4a1.5 1.5 0 0 1-1.6 0l-6.4-4V15a2 2 0 0 0 2 2h10.4a2 2 0 0 0 2-2V6.14Z"/></svg>
                  </span>
                  <div>
                    <p className="text-ink-500 text-xs uppercase tracking-wide font-semibold">Email</p>
                    <a href="mailto:hello@rewardradar.com.au" className="text-ink-900 font-medium hover:text-brand-700">
                      hello@rewardradar.com.au
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 20 20" className="w-4 h-4" fill="currentColor"><path d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-12.25a.75.75 0 0 0-1.5 0v4.5c0 .2.08.39.22.53l3 3a.75.75 0 1 0 1.06-1.06l-2.78-2.78V5.75Z"/></svg>
                  </span>
                  <div>
                    <p className="text-ink-500 text-xs uppercase tracking-wide font-semibold">Response time</p>
                    <p className="text-ink-900 font-medium">Within 2 business days</p>
                    <p className="text-xs text-ink-500 mt-0.5">Mon–Fri, 9am–5pm AEST</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 20 20" className="w-4 h-4" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm0-3.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM9 6.75A.75.75 0 0 1 9.75 6h.5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5Z" clipRule="evenodd"/></svg>
                  </span>
                  <div>
                    <p className="text-ink-500 text-xs uppercase tracking-wide font-semibold">We can't help with</p>
                    <p className="text-ink-700 text-xs leading-snug mt-0.5">
                      Personal financial advice, application approvals, account servicing (call the issuer directly).
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="surface p-5">
              <h3 className="text-sm font-semibold text-ink-900 mb-2">Postal address</h3>
              <address className="not-italic text-sm text-ink-700 leading-relaxed">
                RewardRadar Pty Ltd<br />
                Level 5, 1 Example Street<br />
                Sydney NSW 2000<br />
                Australia
              </address>
              <p className="text-[11px] text-ink-500 mt-2">ABN registration pending.</p>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-brand-50 to-brand-100 border border-brand-200 p-5">
              <h3 className="text-sm font-semibold text-ink-900 mb-2">Check the FAQ first</h3>
              <p className="text-sm text-ink-700 mb-3 leading-relaxed">
                Most enquiries are answered in our FAQ — searchable and grouped by topic.
              </p>
              <Link to="/faqs" className="text-sm font-semibold text-brand-700 hover:text-brand-800 inline-flex items-center gap-1">
                Browse FAQ →
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default ContactPage;
