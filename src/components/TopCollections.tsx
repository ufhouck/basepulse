'use client';

import type { TopCollection } from '@/types/nft';
import { formatETH } from '@/lib/formatters';

interface TopCollectionsProps {
  collections: TopCollection[];
  loading: boolean;
  onCollectionClick?: (c: TopCollection) => void;
}

export default function TopCollections({ collections, loading, onCollectionClick }: TopCollectionsProps) {
  if (loading) {
    return (
      <div className="collections__list">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="collection-row">
            <div className="skeleton" style={{ width: 18, height: 14 }} />
            <div className="skeleton" style={{ width: 32, height: 32, borderRadius: 4 }} />
            <div style={{ flex: 1 }}>
              <div className="skeleton" style={{ height: 12, width: '60%', marginBottom: 4 }} />
              <div className="skeleton" style={{ height: 10, width: '35%' }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (collections.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state__text">No collection data available</div>
      </div>
    );
  }

  return (
    <div className="collections__list">
      {collections.slice(0, 8).map((c, i) => {
        const rank = i + 1;
        const rankClass = rank <= 3 ? ` collection-row__rank--${rank}` : '';

        return (
          <div
            key={c.id}
            className="collection-row"
            onClick={() => onCollectionClick?.(c)}
            style={{ cursor: onCollectionClick ? 'pointer' : undefined }}
          >
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
            </div>
          </div>
        );
      })}
    </div>
  );
}
