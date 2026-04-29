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

const DiamondIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.7 10.3a2.41 2.41 0 0 0 0 3.41l7.59 7.59a2.41 2.41 0 0 0 3.41 0l7.59-7.59a2.41 2.41 0 0 0 0-3.41l-7.59-7.59a2.41 2.41 0 0 0-3.41 0z" />
  </svg>
);

const WhaleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.7 10.3a2.41 2.41 0 0 0 0 3.41l7.59 7.59a2.41 2.41 0 0 0 3.41 0l7.59-7.59a2.41 2.41 0 0 0 0-3.41l-7.59-7.59a2.41 2.41 0 0 0-3.41 0z" />
  </svg>
);

export default function WhaleTracker({ whales, loading }: WhaleTrackerProps) {
  if (loading) {
    return (
      <div className="whales">
        <div className="section-header">
          <span className="section-header__title"><DiamondIcon /> High Value</span>
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="whale-row">
            <div className="skeleton" style={{ width: 32, height: 32, borderRadius: 6 }} />
            <div style={{ flex: 1 }}>
              <div className="skeleton" style={{ height: 12, width: '50%', marginBottom: 4 }} />
              <div className="skeleton" style={{ height: 10, width: '70%' }} />
            </div>
            <div className="skeleton" style={{ width: 50, height: 14 }} />
          </div>
        ))}
      </div>
    );
  }

  if (whales.length === 0) {
    return (
      <div className="whales">
        <div className="section-header">
          <span className="section-header__title"><DiamondIcon /> High Value</span>
        </div>
        <div className="whale-row" style={{ justifyContent: 'center' }}>
          <div className="empty-state" style={{ padding: '24px 16px' }}>
            <div className="empty-state__text">No high-value activity detected</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="whales">
      <div className="section-header">
        <span className="section-header__title"><DiamondIcon /> High Value</span>
        <span className="section-header__badge">≥0.5 ETH</span>
      </div>
      {whales.slice(0, 5).map((whale, i) => (
        <div key={`${whale.wallet}-${i}`} className="whale-row">
          <div className="whale-row__icon">
            <WhaleIcon />
          </div>
          <div className="whale-row__info">
            <div className="whale-row__wallet">
              {formatAddress(whale.wallet)}
            </div>
            <div className="whale-row__action">
              {ACTION_LABELS[whale.action] || whale.action}{' '}
              <strong>
                {whale.quantity}x {whale.collection}
              </strong>
              {' · '}
              {formatTimeAgo(whale.timestamp)}
            </div>
          </div>
          <div className="whale-row__value">
            {parseFloat(whale.totalValue).toFixed(2)} Ξ
          </div>
        </div>
      ))}
    </div>
  );
}
