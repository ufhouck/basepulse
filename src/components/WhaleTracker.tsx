'use client';

import type { WhaleTransaction } from '@/types/nft';
import { formatAddress, formatTimeAgo } from '@/lib/formatters';

interface WhaleTrackerProps {
  whales: WhaleTransaction[];
  loading: boolean;
}

const ACTION_LABELS: Record<string, string> = {
  buy: 'bought',
  sell: 'sold',
  mint: 'minted',
};

export default function WhaleTracker({ whales, loading }: WhaleTrackerProps) {
  if (loading) {
    return (
      <div className="whale-tracker">
        <div className="section-title">
          <span className="section-title__text">🐋 Whale Activity</span>
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="whale-item">
            <div className="skeleton skeleton--circle" style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)' }} />
            <div style={{ flex: 1 }}>
              <div className="skeleton skeleton--text" style={{ width: '60%' }} />
              <div className="skeleton skeleton--text" style={{ width: '80%', height: 10 }} />
            </div>
            <div className="skeleton skeleton--text" style={{ width: 60, height: 16 }} />
          </div>
        ))}
      </div>
    );
  }

  if (whales.length === 0) {
    return (
      <div className="whale-tracker">
        <div className="section-title">
          <span className="section-title__text">🐋 Whale Activity</span>
        </div>
        <div className="card">
          <div className="empty-state">
            <div className="empty-state__icon">🌊</div>
            <div className="empty-state__text">No whale activity detected</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="whale-tracker">
      <div className="section-title">
        <span className="section-title__text">🐋 Whale Activity</span>
        <span className="section-title__count">{`≥1 ETH`}</span>
      </div>
      {whales.slice(0, 5).map((whale, i) => (
        <div key={`${whale.wallet}-${i}`} className="whale-item">
          <div className="whale-item__icon">🐋</div>
          <div className="whale-item__info">
            <div className="whale-item__wallet">
              {formatAddress(whale.wallet)}
            </div>
            <div className="whale-item__action">
              {ACTION_LABELS[whale.action] || whale.action}{' '}
              <strong>
                {whale.quantity}x {whale.collection}
              </strong>
              {' · '}
              {formatTimeAgo(whale.timestamp)}
            </div>
          </div>
          <div className="whale-item__value">
            {parseFloat(whale.totalValue).toFixed(2)} Ξ
          </div>
        </div>
      ))}
    </div>
  );
}
