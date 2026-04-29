'use client';

import type { TopCollection } from '@/types/nft';
import { formatETH, formatPercentChange } from '@/lib/formatters';

interface TopCollectionsProps {
  collections: TopCollection[];
  loading: boolean;
}

const CollectionsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);

export default function TopCollections({ collections, loading }: TopCollectionsProps) {
  if (loading) {
    return (
      <div className="collections">
        <div className="section-header">
          <span className="section-header__title"><CollectionsIcon /> Collections</span>
        </div>
        <div className="collections__list">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="collection-row">
              <div className="skeleton" style={{ width: 18, height: 14 }} />
              <div className="skeleton" style={{ width: 32, height: 32, borderRadius: 6 }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton" style={{ height: 12, width: '60%', marginBottom: 4 }} />
                <div className="skeleton" style={{ height: 10, width: '35%' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (collections.length === 0) {
    return (
      <div className="collections">
        <div className="section-header">
          <span className="section-header__title"><CollectionsIcon /> Collections</span>
        </div>
        <div className="collections__list">
          <div className="empty-state">
            <div className="empty-state__text">No collection data available</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="collections">
      <div className="section-header">
        <span className="section-header__title"><CollectionsIcon /> Collections</span>
        <span className="section-header__badge">by volume</span>
      </div>
      <div className="collections__list">
        {collections.slice(0, 8).map((c, i) => {
          const rank = i + 1;
          const rankClass = rank <= 3 ? ` collection-row__rank--${rank}` : '';
          const changePositive = c.volumeChange24h >= 0;

          return (
            <div key={c.id} className="collection-row">
              <div className={`collection-row__rank${rankClass}`}>{rank}</div>
              {c.image ? (
                <img
                  src={c.image}
                  alt={c.name}
                  className="collection-row__image"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="collection-row__image" />
              )}
              <div className="collection-row__info">
                <div className="collection-row__name">{c.name}</div>
                <div className="collection-row__meta">
                  <span>Floor: {formatETH(c.floorPrice)}</span>
                  <span>·</span>
                  <span>{c.sales24h} sales</span>
                </div>
              </div>
              <div className="collection-row__volume">
                <div className="collection-row__volume-value">{formatETH(c.volume24h)}</div>
                <div
                  className="collection-row__volume-change"
                  style={{ color: changePositive ? 'var(--green)' : 'var(--red)' }}
                >
                  {formatPercentChange(c.volumeChange24h)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
