import React from 'react';

function RangeSlider({
  min = 0,
  max = 100,
  step = 0.01,
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
    asPercent ? `${(v * 100).toFixed(2)}%` : `${v.toFixed(2)}%`;

  return (
    <label className="block text-sm" role="group" aria-label="value range selector">
      <div className="flex items-center gap-2 mt-1">
        <span className="text-xs font-medium w-12 text-left">{format(minVal)}</span>
        <div className="relative w-full range-slider h-[6px]">
          <div className="absolute w-full h-[6px] bg-[#cfd8dc] rounded-full top-1/2 transform -translate-y-1/2" />
          <div
            className="absolute h-[6px] bg-primary-blue rounded-full top-1/2 transform -translate-y-1/2"
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
          className="thumb absolute w-full h-[6px] bg-transparent pointer-events-none appearance-none focus:outline-none focus:ring-2 focus:ring-primary-blue"
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
          className="thumb absolute w-full h-[6px] bg-transparent pointer-events-none appearance-none focus:outline-none focus:ring-2 focus:ring-primary-blue"
          aria-valuetext={format(maxVal)}
          style={{ zIndex: 4 }}
        />
        </div>
        <span className="text-xs font-medium w-12 text-right">{format(maxVal)}</span>
      </div>
    </label>
  );
}

export default RangeSlider;
