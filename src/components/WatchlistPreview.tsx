'use client';

import { formatAddress } from '@/lib/formatters';
import type { WatchlistItem } from '@/lib/watchlist';

interface WatchlistPreviewProps {
  items: WatchlistItem[];
  onViewAll: () => void;
}

export default function WatchlistPreview({ items, onViewAll }: WatchlistPreviewProps) {
  if (items.length === 0) return null;

  return (
    <div className="watchlist-preview">
      <div className="watchlist-preview__scroll">
        {items.slice(0, 4).map(item => (
          <div key={item.address} className="wl-card" onClick={onViewAll}>
            {item.image ? (
              <img src={item.image} alt={item.name} className="wl-card__img" />
            ) : (
              <div className="wl-card__img wl-card__img--empty">?</div>
            )}
            <div className="wl-card__body">
              <div className="wl-card__name">{item.name}</div>
              <div className="wl-card__details">
                <span className="wl-card__type">{item.tokenType}</span>
                {item.floorPrice !== null && (
                  <span className="wl-card__floor">{item.floorPrice.toFixed(4)} ETH</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {items.length > 4 && (
        <button className="btn-bevel" onClick={onViewAll} style={{ width: '100%', marginTop: 8 }}>
          View All ({items.length})
        </button>
      )}
    </div>
  );
}
