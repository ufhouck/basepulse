'use client';

import { useEffect, useState, useCallback } from 'react';
import sdk from '@farcaster/miniapp-sdk';

interface FarcasterContext {
  fid?: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
  walletAddress?: string;
}

export function useFarcasterSDK() {
  const [isReady, setIsReady] = useState(false);
  const [context, setContext] = useState<FarcasterContext | null>(null);
  const [isInFrame, setIsInFrame] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  // Save notification token to our backend
  const saveToken = useCallback(async (fid: number, token: string, url: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fid, token, url }),
      });
      setNotificationsEnabled(true);
      console.log('Notification token saved for FID', fid);
    } catch (e) {
      console.error('Failed to save notification token:', e);
    }
  }, []);

  // Check if token exists in KV (fallback when context doesn't have it)
  const checkTokenInKV = useCallback(async (fid: number) => {
    try {
      const res = await fetch(`/api/notifications?fid=${fid}`);
      const data = await res.json();
      if (data.hasToken) {
        setNotificationsEnabled(true);
        return true;
      }
    } catch { /* silent */ }
    return false;
  }, []);

  useEffect(() => {
    async function init() {
      try {
        const ctx = await sdk.context;
        if (ctx?.user) {
          let walletAddress: string | undefined;

          try {
            const provider = sdk.wallet.ethProvider;
            if (provider) {
              const accounts = await provider.request({ method: 'eth_requestAccounts' }) as string[];
              if (accounts && accounts.length > 0) {
                walletAddress = accounts[0];
              }
            }
          } catch (e) {
            console.log('Wallet provider not available:', e);
          }

          setContext({
            fid: ctx.user.fid,
            username: ctx.user.username,
            displayName: ctx.user.displayName,
            pfpUrl: ctx.user.pfpUrl,
            walletAddress,
          });
          setIsInFrame(true);

          const client = ctx.client;
          let tokenSaved = false;

          console.log('SDK context client:', JSON.stringify({
            added: client?.added,
            hasNotifDetails: !!client?.notificationDetails,
            notifToken: client?.notificationDetails?.token?.slice(0, 8),
          }));

          // 1) Try to get token from context
          if (client?.notificationDetails?.token && client?.notificationDetails?.url) {
            console.log('Path 1: Got notification details from context');
            await saveToken(
              ctx.user.fid,
              client.notificationDetails.token,
              client.notificationDetails.url
            );
            tokenSaved = true;
          }

          // 2) If app not added, prompt to add
          if (!client?.added && !tokenSaved) {
            console.log('Path 2: App not added, calling addMiniApp()');
            try {
              const notifResult = await sdk.actions.addMiniApp();
              console.log('addMiniApp result:', JSON.stringify(notifResult));
              const details = notifResult?.notificationDetails;
              if (details?.token && details?.url) {
                await saveToken(ctx.user.fid, details.token, details.url);
                tokenSaved = true;
              }
            } catch (e) {
              console.log('addMiniApp was denied or errored:', e);
            }
          }

          // 3) Fallback: check KV if we still don't have confirmation
          if (!tokenSaved) {
            console.log('Path 3: Checking KV for existing token...');
            try {
              const res = await fetch(`/api/notifications?fid=${ctx.user.fid}`);
              const data = await res.json();
              console.log('KV check result:', JSON.stringify(data));
              if (data.hasToken) {
                setNotificationsEnabled(true);
                console.log('Path 3: Token found in KV ✓');
              } else {
                console.log('Path 3: No token in KV');
              }
            } catch (e) {
              console.error('Path 3: KV check failed:', e);
            }
          }
        }
      } catch {
        setIsInFrame(false);
      }

      try {
        await sdk.actions.ready();
      } catch { /* ignore */ }

      setIsReady(true);
    }

    init();
  }, [saveToken, checkTokenInKV]);

  const close = useCallback(() => {
    try { sdk.actions.close(); } catch { /* */ }
  }, []);

  const openUrl = useCallback((url: string) => {
    try { sdk.actions.openUrl(url); } catch { window.open(url, '_blank'); }
  }, []);

  return { isReady, context, isInFrame, notificationsEnabled, close, openUrl };
}

