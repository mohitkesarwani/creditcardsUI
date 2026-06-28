import React, { useState } from 'react';

// Like SectionPanel, but content is collapsed behind a toggle by default.
// Use when the infographic above already shows the headline numbers and the
// long-form table / list is for users who specifically want to drill in.

export default function CollapsibleSection({
  title,
  subtitle,
  children,
  defaultOpen = false,
  hint,
  className = '',
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className={`bg-white rounded-xl border border-gray-200 ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-start justify-between gap-4 p-5 md:p-6 text-left hover:bg-gray-50/50 transition-colors"
      >
        <div className="min-w-0">
          <h2 className="text-xs uppercase tracking-wide text-gray-500 font-semibold">{title}</h2>
          {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
          {hint && !open && (
            <p className="text-xs text-blue-600 mt-1">{hint}</p>
          )}
        </div>
        <span
          aria-hidden="true"
          className={`shrink-0 mt-0.5 inline-flex items-center justify-center w-7 h-7 rounded-full text-gray-500 bg-gray-100 transition-transform ${open ? 'rotate-45' : ''}`}
        >
          +
        </span>
      </button>
      {open && (
        <div className="px-5 md:px-6 pb-5 md:pb-6 -mt-2">
          {children}
        </div>
      )}
    </section>
  );
}
