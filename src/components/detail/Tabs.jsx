import React, { useState, useCallback, useId } from 'react';
import { motion } from 'framer-motion';

// Headless tabs — no library. Used as the right-hand pane on both detail
// pages to keep all the long-form data accessible from a single screen.
//
// 2026: the active-tab underline animates between positions using
// framer-motion `layoutId` (Material 3 sliding indicator). Each Tabs
// instance has a unique scope via `useId` so multiple strips on one page
// don't share the indicator.
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
  const layoutId = useId();

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
        className="flex items-end border-b border-hairline-subtle overflow-x-auto"
      >
        {tabs.map((t) => {
          const selected = t.id === activeId;
          return (
            <button
              key={t.id}
              role="tab"
              type="button"
              aria-selected={selected}
              data-active={selected}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActiveId(t.id)}
              className={
                'relative px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors duration-200 ' +
                (selected ? 'text-brand-700' : 'text-ink-500 hover:text-ink-800')
              }
            >
              {t.label}
              {t.badge !== undefined && t.badge !== null && (
                <span
                  className={
                    'ml-2 text-[10px] tabular-nums rounded-full px-1.5 py-0.5 ' +
                    (selected ? 'bg-brand-100 text-brand-700' : 'bg-ink-100 text-ink-500')
                  }
                >
                  {t.badge}
                </span>
              )}
              {/* Sliding underline — framer-motion animates this element's
                  position between tabs via the shared layoutId. */}
              {selected && (
                <motion.span
                  layoutId={`tab-underline-${layoutId}`}
                  className="absolute left-0 right-0 -bottom-px h-0.5 bg-brand-600 rounded-full"
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                />
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
