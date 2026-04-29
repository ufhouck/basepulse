'use client';

import type { VolumeDataPoint } from '@/types/nft';

interface VolumeChartProps {
  data: VolumeDataPoint[];
  loading: boolean;
}

export default function VolumeChart({ data, loading }: VolumeChartProps) {
  if (loading) {
    return (
      <div className="volume-chart">
        <div className="section-title">
          <span className="section-title__text">📈 Volume Trend</span>
          <span className="section-title__count">7d</span>
        </div>
        <div className="volume-chart__container">
          <div className="skeleton" style={{ height: 140, width: '100%' }} />
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return null;
  }

  const maxVolume = Math.max(...data.map(d => d.volume), 1);
  const width = 400;
  const height = 140;
  const padding = { top: 10, right: 10, bottom: 5, left: 10 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Generate smooth curve points
  const points = data.map((d, i) => ({
    x: padding.left + (i / (data.length - 1)) * chartWidth,
    y: padding.top + chartHeight - (d.volume / maxVolume) * chartHeight,
  }));

  // Build SVG path with smooth curves
  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpx = (prev.x + curr.x) / 2;
    pathD += ` C ${cpx} ${prev.y}, ${cpx} ${curr.y}, ${curr.x} ${curr.y}`;
  }

  // Area fill path
  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding.bottom} L ${points[0].x} ${height - padding.bottom} Z`;

  return (
    <div className="volume-chart">
      <div className="section-title">
        <span className="section-title__text">📈 Volume Trend</span>
        <span className="section-title__count">7d</span>
      </div>
      <div className="volume-chart__container">
        <svg className="volume-chart__svg" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
          <defs>
            <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0052FF" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#0052FF" stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#0052FF" />
              <stop offset="50%" stopColor="#3b7dff" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0.25, 0.5, 0.75].map(ratio => (
            <line
              key={ratio}
              x1={padding.left}
              y1={padding.top + chartHeight * (1 - ratio)}
              x2={width - padding.right}
              y2={padding.top + chartHeight * (1 - ratio)}
              stroke="rgba(255,255,255,0.04)"
              strokeDasharray="4 4"
            />
          ))}

          {/* Area fill */}
          <path d={areaD} fill="url(#volumeGradient)" />

          {/* Line */}
          <path
            d={pathD}
            fill="none"
            stroke="url(#lineGradient)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {points.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="4" fill="var(--bg-primary)" stroke="url(#lineGradient)" strokeWidth="2" />
              <circle cx={p.x} cy={p.y} r="2" fill="#3b7dff" />
            </g>
          ))}
        </svg>

        <div className="volume-chart__labels">
          {data.map((d, i) => (
            <span key={i}>
              {new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' })}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
