import React, { useRef, useState, useEffect } from 'react';

function buildPath(data, key, width, height, max) {
  if (!data.length) return '';
  const step = width / (data.length - 1);
  return data
    .map((d, i) => {
      const x = i * step;
      const y = height - (d[key] / max) * height;
      return `${i === 0 ? 'M' : 'L'}${x},${y}`;
    })
    .join(' ');
}

function RepaymentChart({ schedule }) {
  const ref = useRef(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const handle = () => setWidth(ref.current ? ref.current.clientWidth : 0);
    handle();
    window.addEventListener('resize', handle);
    return () => window.removeEventListener('resize', handle);
  }, []);

  if (!schedule || !schedule.length) return null;
  let cumP = 0;
  let cumI = 0;
  const data = schedule.map((s) => {
    cumP += s.principal;
    cumI += s.interest;
    return { month: s.month, principal: cumP, interest: cumI };
  });
  const height = 200;
  const maxY = data[data.length - 1].principal + data[data.length - 1].interest;
  const principalPath = buildPath(data, 'principal', width, height, maxY);
  const interestPath = buildPath(data, 'interest', width, height, maxY);

  return (
    <div ref={ref} className="w-full">
      <svg width={width} height={height} className="overflow-visible">
        <path d={principalPath} fill="none" stroke="#2563eb" strokeWidth="2" />
        <path d={interestPath} fill="none" stroke="#ef4444" strokeWidth="2" />
      </svg>
      <div className="text-xs flex gap-4 mt-2">
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 inline-block bg-blue-600" /> Principal
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 inline-block bg-red-500" /> Interest
        </div>
      </div>
    </div>
  );
}

export default RepaymentChart;
