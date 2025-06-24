import React from 'react';

function RangeSlider({ min = 0, max = 100, step = 1, value = [min, max], onChange }) {
  const [minVal, maxVal] = value;

  const handleMin = (e) => {
    const val = Math.min(Number(e.target.value), maxVal);
    onChange([val, maxVal]);
  };

  const handleMax = (e) => {
    const val = Math.max(Number(e.target.value), minVal);
    onChange([minVal, val]);
  };

  const range = max - min;
  const left = ((minVal - min) / range) * 100;
  const right = 100 - ((maxVal - min) / range) * 100;

  return (
    <div className="relative w-full range-slider h-6">
      <div className="absolute w-full h-1 bg-gray-200 rounded top-1/2 transform -translate-y-1/2" />
      <div
        className="absolute h-1 bg-brand-start rounded top-1/2 transform -translate-y-1/2"
        style={{ left: `${left}%`, right: `${right}%` }}
      />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={minVal}
        onChange={handleMin}
        className="thumb absolute w-full h-1 bg-transparent pointer-events-none appearance-none"
        style={{ zIndex: minVal > max - 100 ? 5 : 3 }}
      />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={maxVal}
        onChange={handleMax}
        className="thumb absolute w-full h-1 bg-transparent pointer-events-none appearance-none"
        style={{ zIndex: 4 }}
      />
    </div>
  );
}

export default RangeSlider;
