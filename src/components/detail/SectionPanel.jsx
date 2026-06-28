import React from 'react';

// A consistent white panel for every section on the detail page.
export default function SectionPanel({ title, subtitle, children, className = '', headerRight }) {
  return (
    <section className={`bg-white rounded-xl border border-gray-200 p-5 md:p-6 ${className}`}>
      {(title || headerRight) && (
        <header className="flex items-start justify-between gap-4 mb-4">
          <div>
            {title && (
              <h2 className="text-xs uppercase tracking-wide text-gray-500 font-semibold">
                {title}
              </h2>
            )}
            {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
          </div>
          {headerRight}
        </header>
      )}
      {children}
    </section>
  );
}
