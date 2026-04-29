'use client';

import { formatCompact, formatETH, formatPercentChange } from '@/lib/formatters';
import type { NFTStats } from '@/types/nft';

interface StatsOverviewProps {
  stats: NFTStats | null;
  loading: boolean;
}

export default function StatsOverview({ stats, loading }: StatsOverviewProps) {
  if (loading) {
    return (
      <div className="stats-grid">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="stat-card">
            <div className="skeleton skeleton--text" style={{ width: '60%' }} />
            <div className="skeleton skeleton--heading" style={{ width: '80%' }} />
          </div>
        ))}
      </div>
    );
  }

  const items = [
    {
      label: '🟢 Mints',
      value: stats ? formatCompact(stats.totalMints24h) : '—',
      sublabel: '24h',
    },
    {
      label: '🔵 Transfers',
      value: stats ? formatCompact(stats.totalTransfers24h) : '—',
      sublabel: '24h',
    },
    {
      label: '💰 Volume',
      value: stats ? formatETH(stats.totalVolume24h) : '—',
      sublabel: '24h',
    },
    {
      label: '📊 Floor Δ',
      value: stats ? formatPercentChange(stats.avgFloorChange24h) : '—',
      sublabel: 'avg',
      isChange: true,
      changePositive: stats ? stats.avgFloorChange24h >= 0 : true,
    },
  ];

  return (
    <div className="stats-grid">
      {items.map((item, i) => (
        <div key={i} className="stat-card">
          <div className="stat-card__label">{item.label}</div>
          <div className="stat-card__value">
            {item.isChange ? (
              <span
                className={
                  item.changePositive
                    ? 'stat-card__change--positive'
                    : 'stat-card__change--negative'
                }
              >
                {item.value}
              </span>
            ) : (
              item.value
            )}
          </div>
          <div className="stat-card__change" style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>
            {item.sublabel}
          </div>
        </div>
      ))}
    </div>
  );
}
