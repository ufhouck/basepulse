'use client';

import type { WatchlistItem } from '@/lib/watchlist';

interface WatchlistPreviewProps {
  items: WatchlistItem[];
  onViewAll: () => void;
}

const StarIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

export default function WatchlistPreview({ items, onViewAll }: WatchlistPreviewProps) {
  if (items.length === 0) return null;

  return (
    <div className="watchlist-preview">
      <div className="watchlist-preview__header">
        <span className="watchlist-preview__title">
          <StarIcon />
          Watching
        </span>
        <button
          onClick={onViewAll}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            fontSize: '0.6rem',
            fontWeight: 500,
            cursor: 'pointer',
            letterSpacing: '0.04em',
            padding: 0,
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          View all →
        </button>
      </div>
      <div className="watchlist-preview__scroll">
        {items.map((item) => (
          <div key={item.address} className="wl-mini" onClick={onViewAll}>
            {item.image ? (
              <img
                className="wl-mini__img"
                src={item.image}
                alt={item.name}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <div
                className="wl-mini__img"
                style={{
                  background: 'var(--bg-elevated)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.5rem',
                  color: 'var(--text-muted)',
                }}
              >
                ?
              </div>
            )}
            <span className="wl-mini__name">{item.name}</span>
            {item.floorPrice != null && item.floorPrice > 0 && (
              <span className="wl-mini__floor">
                {item.floorPrice < 0.001 ? '<0.001' : item.floorPrice.toFixed(3)}Ξ
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
