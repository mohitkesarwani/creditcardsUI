import React, { useMemo, useState } from 'react';

// Mortgage-specific filter sidebar. Mirrors FiltersPanel for credit cards
// but with home-loan dimensions: rate type, loan purpose, then three
// tag-based sections (Best for / Type / Perks).

const PURPOSE_OPTIONS = [
  { key: 'any',   label: 'Any' },
  { key: 'owner', label: 'Owner-occupied' },
  { key: 'invest', label: 'Investment' },
];

const RATE_OPTIONS = [
  { key: 'any',      label: 'Any' },
  { key: 'variable', label: 'Variable' },
  { key: 'fixed',    label: 'Fixed' },
];

function Section({ title, children, action }) {
  return (
    <section className="pb-5 border-b border-gray-100 last:border-0">
      <header className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">{title}</h3>
        {action}
      </header>
      {children}
    </section>
  );
}

function TagSection({ title, tags, active, counts, onToggle, emptyHint }) {
  return (
    <Section title={title}>
      <div className="flex flex-wrap gap-1.5">
        {tags.length === 0 && emptyHint && (
          <p className="text-xs text-gray-400">{emptyHint}</p>
        )}
        {tags.map((t) => {
          const isActive = active.includes(t.label);
          const count = counts[t.label] ?? 0;
          return (
            <button
              key={t.id}
              type="button"
              className="filter-chip"
              data-active={isActive}
              onClick={() => onToggle(t.label)}
            >
              {t.label}
              <span className="text-xs opacity-70 tabular-nums">({count})</span>
            </button>
          );
        })}
      </div>
    </Section>
  );
}

function IssuerList({ banks, counts, selected, onToggle }) {
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const selSet = new Set(selected);
    const sel = banks.filter((b) => selSet.has(b));
    const unsel = banks.filter((b) => !selSet.has(b));
    const matching = q ? unsel.filter((b) => b.toLowerCase().includes(q)) : unsel;
    return { sel, matching };
  }, [banks, query, selected]);

  if (!banks.length) {
    return <p className="text-xs text-gray-400">No issuers in current results.</p>;
  }

  const row = (b) => {
    const checked = selected.includes(b);
    const count = counts[b] ?? 0;
    return (
      <label key={b} className="flex items-center justify-between text-sm py-1 cursor-pointer hover:bg-gray-50 px-1 -mx-1 rounded">
        <span className="flex items-center gap-2 truncate min-w-0">
          <input
            type="checkbox"
            checked={checked}
            onChange={() => onToggle(b)}
            className="accent-blue-600 shrink-0"
          />
          <span className="truncate" title={b}>{b}</span>
        </span>
        <span className="text-xs text-gray-400 tabular-nums shrink-0 pl-2">{count}</span>
      </label>
    );
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          type="text"
          placeholder={`Search ${banks.length} issuers…`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full text-sm pl-8 pr-7 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
        />
        <svg className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
             fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m21 21-4.35-4.35M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16z" />
        </svg>
        {query && (
          <button type="button" onClick={() => setQuery('')}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100">
            ×
          </button>
        )}
      </div>
      <div className="max-h-60 overflow-y-auto pr-1">
        {filtered.sel.length > 0 && (
          <>
            {filtered.sel.map(row)}
            <hr className="my-1.5 border-gray-100" />
          </>
        )}
        {filtered.matching.map(row)}
        {!filtered.matching.length && !filtered.sel.length && (
          <p className="text-xs text-gray-400 py-2">No issuers match "{query}".</p>
        )}
      </div>
    </div>
  );
}

export default function MortgageFiltersPanel({
  filters, setFilters,
  availableBanks,
  availableTagObjects = [],
  countsForBanks,
  countsForRateType,
  countsForPurpose,
  countsForTags = {},
  activeFilterCount,
  onClear,
}) {
  const update = (patch) => setFilters((prev) => ({ ...prev, ...patch }));
  const toggleTag = (label) => {
    const cur = filters.tags || [];
    const next = cur.includes(label) ? cur.filter((x) => x !== label) : [...cur, label];
    update({ tags: next });
  };
  const toggleBank = (b) => {
    const banks = filters.banks.includes(b)
      ? filters.banks.filter((x) => x !== b)
      : [...filters.banks, b];
    update({ banks });
  };

  // Filter visible tags per category (drop zero-counts unless currently active)
  const tagsFor = (cat) =>
    availableTagObjects
      .filter((t) => t.category === cat)
      .filter((t) => (countsForTags[t.label] ?? 0) > 0 || (filters.tags || []).includes(t.label))
      .sort((a, b) => (a.priority ?? 9) - (b.priority ?? 9));

  return (
    <aside className="bg-white rounded-xl border border-gray-200 p-5 space-y-5 text-gray-800">
      <header className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Filters</h2>
        {activeFilterCount > 0 && (
          <button onClick={onClear} className="text-xs text-blue-600 hover:underline">
            Clear all
          </button>
        )}
      </header>

      <Section title="Rate type">
        <div className="space-y-1.5">
          {RATE_OPTIONS.map((r) => {
            const count = countsForRateType[r.key] ?? 0;
            const disabled = r.key !== 'any' && count === 0 && filters.rateType !== r.key;
            return (
              <label key={r.key} className={`flex items-center justify-between text-sm py-1 cursor-pointer ${disabled ? 'opacity-40' : ''}`}>
                <span className="flex items-center gap-2">
                  <input type="radio" name="rateType" value={r.key}
                    checked={filters.rateType === r.key} disabled={disabled}
                    onChange={() => update({ rateType: r.key })} className="accent-blue-600" />
                  {r.label}
                </span>
                <span className="text-xs text-gray-400 tabular-nums">{count}</span>
              </label>
            );
          })}
        </div>
      </Section>

      <Section title="Loan purpose">
        <div className="space-y-1.5">
          {PURPOSE_OPTIONS.map((p) => {
            const count = countsForPurpose[p.key] ?? 0;
            const disabled = p.key !== 'any' && count === 0 && filters.purpose !== p.key;
            return (
              <label key={p.key} className={`flex items-center justify-between text-sm py-1 cursor-pointer ${disabled ? 'opacity-40' : ''}`}>
                <span className="flex items-center gap-2">
                  <input type="radio" name="purpose" value={p.key}
                    checked={filters.purpose === p.key} disabled={disabled}
                    onChange={() => update({ purpose: p.key })} className="accent-blue-600" />
                  {p.label}
                </span>
                <span className="text-xs text-gray-400 tabular-nums">{count}</span>
              </label>
            );
          })}
        </div>
      </Section>

      <TagSection
        title="Best for"
        tags={tagsFor('best-for')}
        active={filters.tags || []}
        counts={countsForTags}
        onToggle={toggleTag}
        emptyHint="No borrower-situation tags in current results."
      />
      <TagSection
        title="Loan type"
        tags={tagsFor('type')}
        active={filters.tags || []}
        counts={countsForTags}
        onToggle={toggleTag}
        emptyHint="No type tags in current results."
      />
      <TagSection
        title="Perks"
        tags={tagsFor('perk')}
        active={filters.tags || []}
        counts={countsForTags}
        onToggle={toggleTag}
        emptyHint=""
      />

      <Section title="Issuer">
        <IssuerList
          banks={availableBanks}
          counts={countsForBanks}
          selected={filters.banks}
          onToggle={toggleBank}
        />
      </Section>
    </aside>
  );
}
