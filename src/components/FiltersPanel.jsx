import React, { useMemo, useState } from 'react';

// Reusable filter sidebar designed like Kayak / Skyscanner:
//   - Annual-fee bucket (radio)
//   - Feature multi-select chips
//   - Issuer / bank multi-select (search + checklist)
// Every option shows a live match count so users can see what each toggle does.
//
// Props:
//   filters: { feeBucket: string, features: string[], banks: string[] }
//   setFilters(next)
//   cards: full card array (used for counts)
//   filteredCards: cards already matching everything else (used for counts on a single dimension)
//   availableTags / availableBanks: master lists
//   countsForBuckets, countsForTags, countsForBanks: precomputed counts

const FEE_BUCKETS = [
  { key: 'any',    label: 'Any',                   match: () => true },
  { key: 'free',   label: 'No annual fee',         match: (fee) => fee === null || fee === 0 },
  { key: 'lt100',  label: 'Under $100',            match: (fee) => fee !== null && fee > 0 && fee < 100 },
  { key: 'lt250',  label: '$100 – $250',           match: (fee) => fee !== null && fee >= 100 && fee < 250 },
  { key: 'gt250',  label: '$250 +',                match: (fee) => fee !== null && fee >= 250 },
];

// Issuer list: search box at top, selected issuers pinned at the top of the
// list so they stay visible no matter what the search filter does.
function IssuerList({ banks, counts, selected, onToggle }) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const selectedSet = new Set(selected);
    const selectedRows = banks.filter((b) => selectedSet.has(b));
    const unselected = banks.filter((b) => !selectedSet.has(b));
    const matching = q
      ? unselected.filter((b) => b.toLowerCase().includes(q))
      : unselected;
    return { selectedRows, matching, totalMatching: matching.length };
  }, [banks, query, selected]);

  if (!banks.length) {
    return <p className="text-xs text-gray-400">No issuers in current results.</p>;
  }

  const row = (b) => {
    const checked = selected.includes(b);
    const count = counts[b] ?? 0;
    return (
      <label
        key={b}
        className="flex items-center justify-between text-sm py-1 cursor-pointer hover:bg-gray-50 px-1 -mx-1 rounded"
      >
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
          aria-label="Search issuers"
        />
        <svg
          className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m21 21-4.35-4.35M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16z" />
        </svg>
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label="Clear search"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100"
          >
            ×
          </button>
        )}
      </div>

      <div className="max-h-60 overflow-y-auto pr-1">
        {filtered.selectedRows.length > 0 && (
          <>
            {filtered.selectedRows.map(row)}
            <hr className="my-1.5 border-gray-100" />
          </>
        )}
        {filtered.matching.map(row)}
        {!filtered.totalMatching && !filtered.selectedRows.length && (
          <p className="text-xs text-gray-400 py-2">
            No issuers match “{query}”.
          </p>
        )}
      </div>
    </div>
  );
}

// Grouped chip section used for the new spending / type / perk filters.
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

function FiltersPanel({
  filters,
  setFilters,
  availableTags,            // legacy: flat string list
  availableTagObjects = [], // new: [{ id, label, category, priority }] from extractCardTags
  availableBanks,
  countsForBuckets,
  countsForTags,
  countsForBanks,
  onClear,
  activeFilterCount,
}) {
  const update = (patch) => setFilters((prev) => ({ ...prev, ...patch }));

  const toggleInArray = (key, value) => {
    const current = filters[key] || [];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    update({ [key]: next });
  };

  // Split available tags into spending-category vs card-type. Perks stay in
  // the legacy "Features" chip block so we don't blow the sidebar height.
  const spendingTags = useMemo(
    () =>
      availableTagObjects
        .filter((t) => t.category === 'spending')
        .filter((t) => (countsForTags[t.label] ?? 0) > 0 || filters.features.includes(t.label))
        .sort((a, b) => (a.priority ?? 9) - (b.priority ?? 9)),
    [availableTagObjects, countsForTags, filters.features],
  );
  const typeTags = useMemo(
    () =>
      availableTagObjects
        .filter((t) => t.category === 'type')
        .filter((t) => (countsForTags[t.label] ?? 0) > 0 || filters.features.includes(t.label))
        .sort((a, b) => (a.priority ?? 9) - (b.priority ?? 9)),
    [availableTagObjects, countsForTags, filters.features],
  );
  const perkTags = useMemo(
    () =>
      availableTagObjects
        .filter((t) => t.category === 'perk')
        .filter((t) => (countsForTags[t.label] ?? 0) > 0 || filters.features.includes(t.label))
        .sort((a, b) => (a.priority ?? 9) - (b.priority ?? 9)),
    [availableTagObjects, countsForTags, filters.features],
  );

  // Fallback when no tag objects passed (mortgage page etc.) — keep old chip grid.
  const visibleTags = useMemo(
    () => (availableTags || []).filter((t) => (countsForTags[t] ?? 0) > 0 || filters.features.includes(t)),
    [availableTags, countsForTags, filters.features],
  );

  return (
    <aside className="surface p-5 space-y-5">
      <header className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Filters</h2>
        {activeFilterCount > 0 && (
          <button onClick={onClear} className="text-xs text-blue-600 hover:underline">
            Clear all
          </button>
        )}
      </header>

      <Section title="Annual fee">
        <div className="space-y-1.5">
          {FEE_BUCKETS.map((b) => {
            const count = countsForBuckets[b.key] ?? 0;
            const checked = (filters.feeBucket || 'any') === b.key;
            const disabled = b.key !== 'any' && count === 0 && !checked;
            return (
              <label
                key={b.key}
                className={`flex items-center justify-between text-sm py-1 cursor-pointer ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                <span className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="feeBucket"
                    value={b.key}
                    checked={checked}
                    disabled={disabled}
                    onChange={() => update({ feeBucket: b.key })}
                    className="accent-blue-600"
                  />
                  {b.label}
                </span>
                <span className="text-xs text-gray-400 tabular-nums">{count}</span>
              </label>
            );
          })}
        </div>
      </Section>

      {availableTagObjects.length > 0 ? (
        <>
          <TagSection
            title="Tagged for"
            tags={spendingTags}
            active={filters.features}
            counts={countsForTags}
            onToggle={(label) => toggleInArray('features', label)}
            emptyHint="No spending-category tags in results."
          />
          <TagSection
            title="Card type"
            tags={typeTags}
            active={filters.features}
            counts={countsForTags}
            onToggle={(label) => toggleInArray('features', label)}
            emptyHint="No card-type tags in results."
          />
          {perkTags.length > 0 && (
            <TagSection
              title="Perks"
              tags={perkTags}
              active={filters.features}
              counts={countsForTags}
              onToggle={(label) => toggleInArray('features', label)}
              emptyHint=""
            />
          )}
        </>
      ) : (
        <Section title="Card features">
          <div className="flex flex-wrap gap-1.5">
            {visibleTags.length === 0 && (
              <p className="text-xs text-gray-400">No tagged features in results.</p>
            )}
            {visibleTags.map((tag) => {
              const active = filters.features.includes(tag);
              const count = countsForTags[tag] ?? 0;
              return (
                <button
                  key={tag}
                  type="button"
                  className="filter-chip"
                  data-active={active}
                  onClick={() => toggleInArray('features', tag)}
                >
                  {tag}
                  <span className="text-xs opacity-70 tabular-nums">({count})</span>
                </button>
              );
            })}
          </div>
        </Section>
      )}

      <Section title="Issuer">
        <IssuerList
          banks={availableBanks}
          counts={countsForBanks}
          selected={filters.banks}
          onToggle={(b) => toggleInArray('banks', b)}
        />
      </Section>
    </aside>
  );
}

export { FEE_BUCKETS };
export default FiltersPanel;
