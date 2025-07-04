import React from 'react';

function RangeSlider({
  min = 0,
  max = 100,
  step = 0.005,
  value = [min, max],
  onChange,
  asPercent = false,
}) {
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
  const format = (v) =>
    asPercent ? `${(v * 100).toFixed(3)}%` : `${v.toFixed(3)}%`;

  return (
    <div className="flex items-center gap-2 mt-1" role="group" aria-label="value range selector">
      <span className="text-xs font-medium w-14 text-left">{format(minVal)}</span>
      <div className="relative w-full range-slider h-2">
        <div className="absolute w-full h-2 bg-gray-200 rounded-full top-1/2 transform -translate-y-1/2" />
        <div
          className="absolute h-2 bg-accent rounded-full top-1/2 transform -translate-y-1/2"
          style={{ left: `${left}%`, right: `${right}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={minVal}
          onChange={handleMin}
          onMouseDown={(e) => e.target.focus()}
          onTouchStart={(e) => e.target.focus()}
          aria-label="Minimum value"
          className="thumb absolute w-full h-2 bg-transparent pointer-events-none appearance-none focus:outline-none focus:ring-2 focus:ring-accent"
          aria-valuetext={format(minVal)}
          style={{ zIndex: minVal > max - 100 ? 5 : 3 }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={maxVal}
          onChange={handleMax}
          onMouseDown={(e) => e.target.focus()}
          onTouchStart={(e) => e.target.focus()}
          aria-label="Maximum value"
          className="thumb absolute w-full h-2 bg-transparent pointer-events-none appearance-none focus:outline-none focus:ring-2 focus:ring-accent"
          aria-valuetext={format(maxVal)}
          style={{ zIndex: 4 }}
        />
      </div>
      <span className="text-xs font-medium w-14 text-right">{format(maxVal)}</span>
    </div>
  );
}

export default RangeSlider;
