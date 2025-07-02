import React, { useRef, useEffect } from 'react';
import { Chart } from 'chart.js/auto';
import { formatMoney } from '../utils.js';

function RepaymentChart({ schedule }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) {
      chartRef.current.destroy();
    }
    if (!schedule || !schedule.length) return;
    const labels = [];
    const principal = [];
    const interest = [];
    schedule.forEach((s) => {
      labels.push(s.month);
      principal.push(s.principal);
      interest.push(s.interest);
    });
    chartRef.current = new Chart(canvasRef.current, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Principal',
            data: principal,
            borderColor: '#3b82f6',
            backgroundColor: 'transparent',
            pointRadius: 0,
            tension: 0.3,
          },
          {
            label: 'Interest',
            data: interest,
            borderColor: '#ef4444',
            backgroundColor: 'transparent',
            pointRadius: 0,
            tension: 0.3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            enabled: true,
            callbacks: {
              label: (ctx) => `${ctx.dataset.label}: ${formatMoney(ctx.parsed.y)}`,
            },
          },
        },
        scales: {
          x: { display: false },
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => formatMoney(value),
            },
          },
        },
      },
    });
    return () => chartRef.current && chartRef.current.destroy();
  }, [schedule]);

  if (!schedule || !schedule.length) return null;

  return (
    <div className="w-full" style={{ height: '200px' }}>
      <canvas ref={canvasRef} aria-label="Repayment chart" />
      <div className="text-xs flex gap-4 mt-2">
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 inline-block bg-blue-600" /> Principal
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 inline-block bg-red-600" /> Interest
        </div>
      </div>
    </div>
  );
}

export default RepaymentChart;
