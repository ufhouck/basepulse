'use client';

import { useState, useCallback } from 'react';
import { formatAddress } from '@/lib/formatters';
import type { WatchlistItem } from '@/lib/watchlist';

interface SettingsPageProps {
  fid: number | null;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
  walletAddress: string | null;
  isInFrame: boolean;
  notificationsEnabled: boolean;
  watchedItems: WatchlistItem[];
  onShare: () => void;
}

export default function SettingsPage({
  fid,
  username,
  displayName,
  pfpUrl,
  walletAddress,
  isInFrame,
  notificationsEnabled,
  watchedItems,
  onShare,
}: SettingsPageProps) {
  const [copied, setCopied] = useState(false);
  const [exportCopied, setExportCopied] = useState(false);

  const copyAddress = useCallback(() => {
    if (!walletAddress) return;
    navigator.clipboard.writeText(walletAddress).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => { /* ignore */ });
  }, [walletAddress]);

  const exportWatchlist = useCallback(() => {
    const data = watchedItems.map(item => ({
      name: item.name,
      address: item.address,
      tokenType: item.tokenType,
    }));
    const json = JSON.stringify(data, null, 2);
    navigator.clipboard.writeText(json).then(() => {
      setExportCopied(true);
      setTimeout(() => setExportCopied(false), 2000);
    }).catch(() => { /* ignore */ });
  }, [watchedItems]);

  return (
    <div className="settings-page">
      {/* Profile */}
      <div className="win">
        <div className="win__titlebar">
          <div className="win__title">👤 Profile</div>
        </div>
        <div className="win__body">
          <div className="settings-profile">
            <div className="settings-profile__avatar">
              {pfpUrl ? (
                <img src={pfpUrl} alt={displayName || 'Profile'} className="settings-profile__img" />
              ) : (
                <div className="settings-profile__img settings-profile__img--empty">?</div>
              )}
            </div>
            <div className="settings-profile__info">
              {displayName && (
                <div className="settings-profile__name">{displayName}</div>
              )}
              {username && (
                <div className="settings-profile__username">@{username}</div>
              )}
              {fid && (
                <div className="settings-profile__fid">FID: {fid}</div>
              )}
            </div>
          </div>

          {walletAddress && (
            <div className="settings-row" onClick={copyAddress} style={{ cursor: 'pointer' }}>
              <div className="settings-row__label">Wallet</div>
              <div className="settings-row__value settings-row__value--mono">
                {formatAddress(walletAddress)}
                <span className="settings-row__copy">{copied ? '✓' : '📋'}</span>
              </div>
            </div>
          )}

          {!isInFrame && (
            <div className="settings-row">
              <div className="settings-row__label">Status</div>
              <div className="settings-row__value settings-row__value--dim">
                Not connected — Open in Farcaster
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notifications */}
      <div className="win">
        <div className="win__titlebar">
          <div className="win__title">🔔 Notifications</div>
        </div>
        <div className="win__body">
          <div className="settings-row">
            <div className="settings-row__label">Active Alerts</div>
            <div className="settings-row__value">{watchedItems.length} collection(s)</div>
          </div>
          <div className="settings-row">
            <div className="settings-row__label">Push Notifications</div>
            <div className="settings-row__value">
              {!isInFrame
                ? '❌ Requires Farcaster'
                : notificationsEnabled
                  ? '✅ Enabled'
                  : '⚠️ Not enabled — re-add the app'}
            </div>
          </div>
          {watchedItems.length > 0 && (
            <div className="settings-row" onClick={exportWatchlist} style={{ cursor: 'pointer' }}>
              <div className="settings-row__label">Export Watchlist</div>
              <div className="settings-row__value settings-row__value--action">
                {exportCopied ? '✓ Copied!' : 'Copy as JSON'}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="win">
        <div className="win__titlebar">
          <div className="win__title">⚡ Actions</div>
        </div>
        <div className="win__body">
          <button className="settings-action" onClick={onShare}>
            📤 Share Base Pulse on Farcaster
          </button>
        </div>
      </div>

      {/* About */}
      <div className="win">
        <div className="win__titlebar">
          <div className="win__title">ℹ️ About</div>
        </div>
        <div className="win__body">
          <div className="settings-about">
            <div className="settings-about__name">Base Pulse</div>
            <div className="settings-about__version">v1.1.0</div>
            <div className="settings-about__desc">
              NFT activity tracker on Base chain.
              <br />
              Track your collections, set alerts, get notified.
            </div>
            <div className="settings-about__links">
              <a href="https://farcaster.xyz/ufhouck.eth" target="_blank" rel="noopener noreferrer">
                @ufhouck.eth
              </a>
              <span>·</span>
              <a href="https://www.farcaster.xyz" target="_blank" rel="noopener noreferrer">
                Farcaster
              </a>
              <span>·</span>
              <a href="https://opensea.io" target="_blank" rel="noopener noreferrer">
                OpenSea
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
