import React from 'react';

// Reusable KPI grid — 4 little stat tiles. Used in Card and CompareTable.
// `cells` is an array of { label, value, isBest? }.
function CardKpis({ cells, className = '' }) {
  return (
    <div className={`grid grid-cols-2 sm:grid-cols-4 gap-2 ${className}`}>
      {cells.map((c) => (
        <div
          key={c.label}
          className={`kpi-tile ${c.isBest ? 'kpi-tile--best' : ''}`}
          title={c.tooltip || ''}
        >
          <span className="kpi-tile__label">{c.label}</span>
          <span className="kpi-tile__value">{c.value ?? '—'}</span>
        </div>
      ))}
    </div>
  );
}

export default CardKpis;
