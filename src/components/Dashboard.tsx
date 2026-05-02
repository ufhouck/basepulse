'use client';

import { useState, useCallback, useRef } from 'react';
import { useFarcasterSDK } from '@/hooks/useFarcasterSDK';
import { useCollections } from '@/hooks/useCollections';
import { useWatchlist } from '@/hooks/useWatchlist';
import TabNav from './TabNav';
import TopCollections from './TopCollections';
import MyNFTs from './MyNFTs';
import SettingsPage from './SettingsPage';
import type { TopCollection } from '@/types/nft';

// SVG Icons
const PulseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12h4l3-9 4 18 3-9h6" />
  </svg>
);

const RefreshIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a9 9 0 1 1-3.1-6.8" />
    <path d="M21 3v6h-6" />
  </svg>
);

export default function Dashboard() {
  const { isReady, context, isInFrame } = useFarcasterSDK();
  const { collections, loading: collectionsLoading, refetch: refetchCollections } = useCollections();
  const { items: watchlistItems, add: addWatchlistItem, remove: removeWatchlistItem, check: checkWatchlistItem } = useWatchlist();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'mynfts' | 'settings'>('dashboard');
  const [pendingDetail, setPendingDetail] = useState<Record<string, unknown> | null>(null);

  const fid = context?.fid ?? null;
  const walletAddress = context?.walletAddress ?? null;

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetchCollections();
    setTimeout(() => setRefreshing(false), 600);
  }, [refetchCollections]);

  const handleShare = useCallback(async () => {
    try {
      const { sdk } = await import('@farcaster/miniapp-sdk');
      await sdk.actions.composeCast({
        text: 'Check out Base NFT activity on Base Pulse ⚡',
        embeds: ['https://basepulse-alpha.vercel.app'],
      });
    } catch (e) {
      console.log('Share not available outside Farcaster', e);
    }
  }, []);

  // When a top collection is clicked, switch to My NFTs and open detail
  const handleTopCollectionClick = useCallback((c: TopCollection) => {
    const floorNum = typeof c.floorPrice === 'string' ? parseFloat(c.floorPrice) || null : c.floorPrice;
    setPendingDetail({
      contractAddress: c.id,
      name: c.name,
      tokenType: 'ERC721',
      totalBalance: 0,
      image: c.image,
      floorPrice: floorNum,
      collectionSlug: null,
    });
    setActiveTab('mynfts');
  }, []);

  if (!isReady) {
    return (
      <div className="loading-screen">
        <div className="loading-screen__logo">
          <PulseIcon />
        </div>
        <div className="loading-spinner" />
        <div className="loading-screen__text">Connecting to Base...</div>
      </div>
    );
  }

  return (
    <div className="app">
      {/* Menu Bar Header */}
      <header className="header">
        <div className="header__brand">
          <div className="header__logo">
            <PulseIcon />
          </div>
          <div className="header__title">Base Pulse</div>
        </div>
        <div className="header__actions">
          <div className="header__live">
            <span className="header__live-dot" />
            Live
          </div>
          {activeTab === 'dashboard' && (
            <button
              className={`btn-bevel${refreshing ? ' btn-bevel--spinning' : ''}`}
              onClick={handleRefresh}
              disabled={refreshing}
              title="Refresh"
            >
              <RefreshIcon />
            </button>
          )}
        </div>
      </header>

      {/* Tab Navigation */}
      <TabNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        alertCount={watchlistItems.length}
      />

      {/* Tab Content */}
      {activeTab === 'dashboard' && (
        <div className="win">
          <div className="win__titlebar">
            <div className="win__title">🏆 Top Collections</div>
          </div>
          <div className="win__body">
            <TopCollections
              collections={collections}
              loading={collectionsLoading}
              onCollectionClick={handleTopCollectionClick}
            />
          </div>
        </div>
      )}

      {activeTab === 'mynfts' && (
        <MyNFTs
          walletAddress={walletAddress}
          isInFrame={isInFrame}
          fid={fid}
          sharedItems={watchlistItems}
          sharedAdd={addWatchlistItem}
          sharedRemove={removeWatchlistItem}
          sharedCheck={checkWatchlistItem}
          pendingDetail={pendingDetail}
          onDetailConsumed={() => setPendingDetail(null)}
        />
      )}

      {activeTab === 'settings' && (
        <SettingsPage
          fid={fid}
          username={context?.username}
          displayName={context?.displayName}
          pfpUrl={context?.pfpUrl}
          walletAddress={walletAddress}
          isInFrame={isInFrame}
          watchedItems={watchlistItems}
          onShare={handleShare}
        />
      )}

      <footer className="footer">
        <div className="footer__text">
          Base Pulse · Built on{' '}
          <a href="https://www.farcaster.xyz" target="_blank" rel="noopener noreferrer">Farcaster</a>
          {' · '}
          Powered by{' '}
          <a href="https://opensea.io" target="_blank" rel="noopener noreferrer">OpenSea</a>
        </div>
      </footer>
    </div>
  );
}
