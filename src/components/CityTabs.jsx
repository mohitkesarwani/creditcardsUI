import React from 'react';

function CityTabs({ tabs = [], selected, onSelect }) {
  return (
    <div className="flex gap-2 overflow-x-auto py-2">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onSelect(tab)}
          className={`pill-tab ${
            selected === tab ? 'pill-tab-selected' : 'pill-tab-unselected'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

export default CityTabs;
