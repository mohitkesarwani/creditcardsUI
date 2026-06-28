import React, { useState, useCallback } from 'react';

// Headless tabs — no library. Used as the right-hand pane on both detail
// pages to keep all the long-form data accessible from a single screen.
//
// Usage:
//   <Tabs
//     tabs={[
//       { id: 'rates',  label: 'Rates',    badge: 5,   render: () => <RatesBreakdown ... /> },
//       { id: 'fees',   label: 'Fees',                render: () => <FeesBreakdown ... /> },
//     ]}
//     defaultId="rates"
//   />

export default function Tabs({ tabs, defaultId, className = '' }) {
  const [activeId, setActiveId] = useState(defaultId || tabs[0]?.id);

  const onKey = useCallback(
    (e) => {
      const i = tabs.findIndex((t) => t.id === activeId);
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        setActiveId(tabs[(i + 1) % tabs.length].id);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setActiveId(tabs[(i - 1 + tabs.length) % tabs.length].id);
      }
    },
    [activeId, tabs],
  );

  const active = tabs.find((t) => t.id === activeId);

  return (
    <div className={`flex flex-col h-full min-h-0 ${className}`}>
      <div
        role="tablist"
        aria-orientation="horizontal"
        onKeyDown={onKey}
        className="flex gap-1 border-b border-gray-200 overflow-x-auto"
      >
        {tabs.map((t) => {
          const selected = t.id === activeId;
          return (
            <button
              key={t.id}
              role="tab"
              type="button"
              aria-selected={selected}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActiveId(t.id)}
              className={
                'relative px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors -mb-px ' +
                (selected
                  ? 'text-blue-700 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-800 border-b-2 border-transparent')
              }
            >
              {t.label}
              {t.badge !== undefined && t.badge !== null && (
                <span
                  className={
                    'ml-2 text-[10px] tabular-nums rounded-full px-1.5 py-0.5 ' +
                    (selected ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500')
                  }
                >
                  {t.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        aria-labelledby={`tab-${activeId}`}
        className="flex-1 min-h-0 overflow-y-auto pt-4"
      >
        {active?.render?.()}
      </div>
    </div>
  );
}
