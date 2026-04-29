'use client';

import type { TopCollection } from '@/types/nft';
import { formatETH, formatPercentChange } from '@/lib/formatters';

interface TopCollectionsProps {
  collections: TopCollection[];
  loading: boolean;
}

export default function TopCollections({ collections, loading }: TopCollectionsProps) {
  if (loading) {
    return (
      <div className="collections">
        <div className="section-title">
          <span className="section-title__text">🏆 Top Collections</span>
        </div>
        <div className="card">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="collection-item">
              <div className="skeleton skeleton--circle" />
              <div style={{ flex: 1 }}>
                <div className="skeleton skeleton--text" style={{ width: '70%' }} />
                <div className="skeleton skeleton--text" style={{ width: '40%', height: 10 }} />
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
        <div className="section-title">
          <span className="section-title__text">🏆 Top Collections</span>
        </div>
        <div className="card">
          <div className="empty-state">
            <div className="empty-state__icon">📭</div>
            <div className="empty-state__text">No collection data available</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="collections">
      <div className="section-title">
        <span className="section-title__text">🏆 Top Collections</span>
        <span className="section-title__count">by volume</span>
      </div>
      <div className="card" style={{ padding: 'var(--space-sm) 0' }}>
        {collections.slice(0, 8).map((c, i) => {
          const rank = i + 1;
          const rankClass = rank <= 3 ? ` collection-item__rank--${rank}` : '';
          const changePositive = c.volumeChange24h >= 0;

          return (
            <div key={c.id} className="collection-item">
              <div className={`collection-item__rank${rankClass}`}>
                {rank}
              </div>
              {c.image ? (
                <img
                  src={c.image}
                  alt={c.name}
                  className="collection-item__image"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="collection-item__image" />
              )}
              <div className="collection-item__info">
                <div className="collection-item__name">{c.name}</div>
                <div className="collection-item__meta">
                  <span>Floor: {formatETH(c.floorPrice)}</span>
                  <span>•</span>
                  <span>{c.sales24h} sales</span>
                </div>
              </div>
              <div className="collection-item__volume">
                <div className="collection-item__volume-value">
                  {formatETH(c.volume24h)}
                </div>
                <div
                  className="collection-item__volume-change"
                  style={{ color: changePositive ? 'var(--success)' : 'var(--danger)' }}
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
