'use client';

import type { ActivityItem } from '@/types/nft';
import { ACTIVITY_ICONS, ACTIVITY_LABELS } from '@/lib/constants';
import { formatAddress, formatTimeAgo } from '@/lib/formatters';

interface ActivityFeedProps {
  activity: ActivityItem[];
  loading: boolean;
}

export default function ActivityFeed({ activity, loading }: ActivityFeedProps) {
  if (loading) {
    return (
      <div className="activity-feed">
        <div className="section-title">
          <span className="section-title__text">⚡ Live Activity</span>
        </div>
        <div className="activity-list">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="activity-item">
              <div className="skeleton skeleton--circle" style={{ width: 28, height: 28 }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton skeleton--text" style={{ width: '75%' }} />
                <div className="skeleton skeleton--text" style={{ width: '50%', height: 10 }} />
              </div>
              <div>
                <div className="skeleton skeleton--text" style={{ width: 50, height: 12 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activity.length === 0) {
    return (
      <div className="activity-feed">
        <div className="section-title">
          <span className="section-title__text">⚡ Live Activity</span>
        </div>
        <div className="activity-list">
          <div className="empty-state">
            <div className="empty-state__icon">📡</div>
            <div className="empty-state__text">Waiting for activity...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="activity-feed">
      <div className="section-title">
        <span className="section-title__text">
          ⚡ Live Activity
          <span className="header__live-dot" style={{ marginLeft: 4 }} />
        </span>
        <span className="section-title__count">{activity.length}</span>
      </div>
      <div className="activity-list">
        {activity.map((item, i) => (
          <div
            key={`${item.txHash}-${i}`}
            className="activity-item"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className={`activity-item__type activity-item__type--${item.type}`}>
              {ACTIVITY_ICONS[item.type] || '⚪'}
            </div>
            <div className="activity-item__content">
              <div className="activity-item__title">
                <span className="badge badge--${item.type}" style={{ marginRight: 6 }}>
                  {ACTIVITY_LABELS[item.type]}
                </span>
                {item.collection}
              </div>
              <div className="activity-item__detail">
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
            <div className="activity-item__meta">
              {item.price && parseFloat(item.price) > 0 && (
                <div className="activity-item__price">
                  {parseFloat(item.price).toFixed(3)} Ξ
                </div>
              )}
              <div className="activity-item__time">
                {formatTimeAgo(item.timestamp)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
