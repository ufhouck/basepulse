'use client';

import type { ActivityItem } from '@/types/nft';
import { ACTIVITY_LABELS } from '@/lib/constants';
import { formatAddress, formatTimeAgo } from '@/lib/formatters';

interface ActivityFeedProps {
  activity: ActivityItem[];
  loading: boolean;
}

const ActivityIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
);

export default function ActivityFeed({ activity, loading }: ActivityFeedProps) {
  if (loading) {
    return (
      <div className="activity">
        <div className="section-header">
          <span className="section-header__title"><ActivityIcon /> Activity</span>
        </div>
        <div className="activity__list">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="activity-row">
              <div className="skeleton" style={{ width: 6, height: 6, borderRadius: '50%' }} />
              <div className="skeleton" style={{ width: 50, height: 10 }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton" style={{ height: 12, width: '65%', marginBottom: 3 }} />
                <div className="skeleton" style={{ height: 9, width: '45%' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activity.length === 0) {
    return (
      <div className="activity">
        <div className="section-header">
          <span className="section-header__title"><ActivityIcon /> Activity</span>
        </div>
        <div className="activity__list">
          <div className="empty-state">
            <div className="empty-state__text">Waiting for activity...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="activity">
      <div className="section-header">
        <span className="section-header__title">
          <ActivityIcon /> Activity
          <span className="header__live-dot" style={{ marginLeft: 2 }} />
        </span>
        <span className="section-header__badge">{activity.length}</span>
      </div>
      <div className="activity__list">
        {activity.map((item, i) => (
          <div
            key={`${item.txHash}-${i}`}
            className="activity-row"
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <div className={`activity-row__dot activity-row__dot--${item.type}`} />
            <div className={`activity-row__type activity-row__type--${item.type}`}>
              {ACTIVITY_LABELS[item.type] || item.type}
            </div>
            <div className="activity-row__content">
              <div className="activity-row__collection">{item.collection}</div>
              <div className="activity-row__detail">
                {item.type === 'transfer' || item.type === 'sale' ? (
                  <>
                    {formatAddress(item.from)} → {formatAddress(item.to)}
                  </>
                ) : (
                  <>
                    → {formatAddress(item.to)}
                    {item.tokenId && ` #${item.tokenId}`}
                  </>
                )}
              </div>
            </div>
            <div className="activity-row__meta">
              {item.price && parseFloat(item.price) > 0 && (
                <div className="activity-row__price">
                  {parseFloat(item.price).toFixed(3)} Ξ
                </div>
              )}
              <div className="activity-row__time">
                {formatTimeAgo(item.timestamp)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
