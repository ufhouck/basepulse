'use client';

import { formatCompact, formatETH } from '@/lib/formatters';
import type { NFTStats } from '@/types/nft';

interface StatsOverviewProps {
  stats: NFTStats | null;
  loading: boolean;
}

// Minimal line-art icons
const IconMint = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 8v8m-4-4h8" />
  </svg>
);

const IconTransfer = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14m-4-4 4 4-4 4" />
  </svg>
);

const IconVolume = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2v20M17 5v14M7 7v10M22 10v4M2 10v4" />
  </svg>
);

export default function StatsOverview({ stats, loading }: StatsOverviewProps) {
  if (loading) {
    return (
      <div className="stats-bar">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="stat-chip">
            <div className="skeleton" style={{ height: 14, width: 14, borderRadius: '50%' }} />
            <div className="stat-chip__info">
              <div className="skeleton" style={{ height: 8, width: 40 }} />
              <div className="skeleton" style={{ height: 16, width: 60 }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const items = [
    {
      icon: <IconMint />,
      label: 'Mints',
      value: stats ? formatCompact(stats.totalMints24h) : '—',
    },
    {
      icon: <IconTransfer />,
      label: 'Transfers',
      value: stats ? formatCompact(stats.totalTransfers24h) : '—',
    },
    {
      icon: <IconVolume />,
      label: 'Volume',
      value: stats ? formatETH(stats.totalVolume24h) : '—',
    },
  ];

  return (
    <div className="stats-bar">
      {items.map((item, i) => (
        <div key={i} className="stat-chip">
          <div className="stat-chip__icon">{item.icon}</div>
          <div className="stat-chip__info">
            <span className="stat-chip__label">{item.label}</span>
            <span className="stat-chip__value">{item.value}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
