'use client';

import { useState } from 'react';
import { useContractSearch, type ContractResult } from '@/hooks/useWatchlist';
import { formatAddress } from '@/lib/formatters';
import type { WatchlistItem } from '@/lib/watchlist';

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
  </svg>
);

const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14m-7-7h14" />
  </svg>
);

const TrashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

interface WatchlistPageProps {
  sharedItems: WatchlistItem[];
  sharedAdd: (item: WatchlistItem) => boolean;
  sharedRemove: (address: string) => void;
  sharedCheck: (address: string) => boolean;
}

export default function WatchlistPage({ sharedItems, sharedAdd, sharedRemove, sharedCheck }: WatchlistPageProps) {
  const { result, loading, error, search, clear } = useContractSearch();
  const [input, setInput] = useState('');

  const handleSearch = () => {
    const addr = input.trim();
    if (/^0x[a-fA-F0-9]{40}$/.test(addr)) {
      search(addr);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleAdd = (r: ContractResult) => {
    const item: WatchlistItem = {
      address: r.address,
      name: r.name,
      image: r.image,
      tokenType: r.tokenType,
      floorPrice: r.floorPrice,
      collectionSlug: r.collectionSlug,
      addedAt: Date.now(),
    };
    sharedAdd(item);
  };

  return (
    <div className="watchlist-page">
      {/* Search Section */}
      <div className="search-section">
        <div className="section-header">
          <span className="section-header__title"><SearchIcon /> Search Contract</span>
        </div>
        <div className="search-box">
          <input
            type="text"
            className="search-box__input"
            placeholder="Enter Base NFT contract address (0x...)"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck={false}
          />
          <button
            className="search-box__btn"
            onClick={handleSearch}
            disabled={loading || !/^0x[a-fA-F0-9]{40}$/.test(input.trim())}
          >
            {loading ? <div className="loading-spinner" style={{ width: 14, height: 14 }} /> : <SearchIcon />}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="search-error">{error}</div>
        )}

        {/* Result Card */}
        {result && (
          <div className="contract-card">
            <div className="contract-card__header">
              {result.image ? (
                <img src={result.image} alt={result.name} className="contract-card__image" />
              ) : (
                <div className="contract-card__image contract-card__image--empty" />
              )}
              <div className="contract-card__info">
                <div className="contract-card__name">{result.name}</div>
                <div className="contract-card__address">{formatAddress(result.address)}</div>
                <div className="contract-card__meta">
                  <span className="contract-card__tag">{result.tokenType}</span>
                  {result.floorPrice !== null && (
                    <span>Floor: {result.floorPrice.toFixed(4)} ETH</span>
                  )}
                </div>
              </div>
              <button
                className={`contract-card__add${sharedCheck(result.address) ? ' contract-card__add--added' : ''}`}
                onClick={() => handleAdd(result)}
                disabled={sharedCheck(result.address)}
                title={sharedCheck(result.address) ? 'Already in watchlist' : 'Add to watchlist'}
              >
                {sharedCheck(result.address) ? <CheckIcon /> : <PlusIcon />}
              </button>
            </div>

            {result.description && (
              <div className="contract-card__desc">{result.description}</div>
            )}

            {/* NFT Previews */}
            {result.nfts && result.nfts.length > 0 && (
              <div className="contract-card__nfts">
                {result.nfts.map((nft, i) => (
                  nft.image && (
                    <img
                      key={i}
                      src={nft.image}
                      alt={nft.name || `#${nft.tokenId}`}
                      className="contract-card__nft-thumb"
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  )
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Watchlist */}
      <div className="watchlist-section">
        <div className="section-header">
          <span className="section-header__title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            Watchlist
          </span>
          <span className="section-header__badge">{sharedItems.length} / 10</span>
        </div>

        {sharedItems.length === 0 ? (
          <div className="watchlist-empty">
            <div className="empty-state">
              <div className="empty-state__text">Search and add contracts to your watchlist</div>
            </div>
          </div>
        ) : (
          <div className="watchlist-list">
            {sharedItems.map(item => (
              <div key={item.address} className="watchlist-item">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="watchlist-item__image" />
                ) : (
                  <div className="watchlist-item__image watchlist-item__image--empty" />
                )}
                <div className="watchlist-item__info">
                  <div className="watchlist-item__name">{item.name}</div>
                  <div className="watchlist-item__meta">
                    <span>{formatAddress(item.address)}</span>
                    <span>·</span>
                    <span>{item.tokenType}</span>
                    {item.floorPrice !== null && (
                      <>
                        <span>·</span>
                        <span>{item.floorPrice.toFixed(4)} ETH</span>
                      </>
                    )}
                  </div>
                </div>
                <button
                  className="watchlist-item__remove"
                  onClick={() => sharedRemove(item.address)}
                  title="Remove from watchlist"
                >
                  <TrashIcon />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
