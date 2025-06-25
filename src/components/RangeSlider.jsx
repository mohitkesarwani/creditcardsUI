import React, { useState } from 'react';

function RangeSlider({
  min = 0,
  max = 100,
  step = 0.005,
  value = [min, max],
  onChange,
  asPercent = false,
}) {
  const [minVal, maxVal] = value;
  const [activeThumb, setActiveThumb] = useState(null);

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
    <div className="relative w-full range-slider h-6" role="group" aria-label="value range selector">
      <div className="absolute w-full h-1 bg-gray-200 rounded top-1/2 transform -translate-y-1/2" />
      <div
        className="absolute h-1 bg-brand-start rounded top-1/2 transform -translate-y-1/2"
        style={{ left: `${left}%`, right: `${right}%` }}
      />
      <div className="absolute -top-6 left-0 w-full" aria-hidden="true">
        <span
          className={`tooltip ${activeThumb === 'min' ? 'opacity-100' : 'opacity-0 md:opacity-100'}`}
          style={{ left: `${left}%` }}
        >
          {format(minVal)}
        </span>
        <span
          className={`tooltip ${activeThumb === 'max' ? 'opacity-100' : 'opacity-0 md:opacity-100'}`}
          style={{ left: `${100 - right}%` }}
        >
          {format(maxVal)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={minVal}
        onChange={handleMin}
        onMouseDown={() => setActiveThumb('min')}
        onTouchStart={() => setActiveThumb('min')}
        onMouseUp={() => setActiveThumb(null)}
        onTouchEnd={() => setActiveThumb(null)}
        onBlur={() => setActiveThumb(null)}
        aria-label="Minimum interest rate"
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
        onMouseDown={() => setActiveThumb('max')}
        onTouchStart={() => setActiveThumb('max')}
        onMouseUp={() => setActiveThumb(null)}
        onTouchEnd={() => setActiveThumb(null)}
        onBlur={() => setActiveThumb(null)}
        aria-label="Maximum interest rate"
        className="thumb absolute w-full h-1 bg-transparent pointer-events-none appearance-none"
        style={{ zIndex: 4 }}
      />
    </div>
  );
}

export default RangeSlider;
