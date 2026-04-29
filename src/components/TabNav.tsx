'use client';

interface TabNavProps {
  activeTab: 'dashboard' | 'watchlist';
  onTabChange: (tab: 'dashboard' | 'watchlist') => void;
  watchlistCount: number;
}

const DashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </svg>
);

const StarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

export default function TabNav({ activeTab, onTabChange, watchlistCount }: TabNavProps) {
  return (
    <div className="tab-nav">
      <button
        className={`tab-nav__item${activeTab === 'dashboard' ? ' tab-nav__item--active' : ''}`}
        onClick={() => onTabChange('dashboard')}
      >
        <DashIcon /> Dashboard
      </button>
      <button
        className={`tab-nav__item${activeTab === 'watchlist' ? ' tab-nav__item--active' : ''}`}
        onClick={() => onTabChange('watchlist')}
      >
        <StarIcon /> Watchlist
        {watchlistCount > 0 && (
          <span className="tab-nav__badge">{watchlistCount}</span>
        )}
      </button>
    </div>
  );
}
