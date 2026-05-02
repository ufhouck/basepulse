import { kv } from '@vercel/kv';

// Types
export interface NotificationToken {
  token: string;
  url: string;
  fid: number;
  enabledAt: number;
}

export interface UserWatchConfig {
  fid: number;
  contracts: string[]; // contract addresses being watched
  notifyEnabled: boolean;
}

// ─── Notification Token Management ───

export async function saveNotificationToken(
  fid: number,
  token: string,
  url: string
): Promise<void> {
  const data: NotificationToken = {
    token,
    url,
    fid,
    enabledAt: Date.now(),
  };
  await kv.set(`notif:${fid}`, JSON.stringify(data));
  // Also add to the set of all FIDs with notifications
  await kv.sadd('notif:fids', fid);
}

export async function removeNotificationToken(fid: number): Promise<void> {
  await kv.del(`notif:${fid}`);
  await kv.srem('notif:fids', fid);
}

export async function getNotificationToken(
  fid: number
): Promise<NotificationToken | null> {
  const data = await kv.get<string>(`notif:${fid}`);
  if (!data) return null;
  return typeof data === 'string' ? JSON.parse(data) : data;
}

export async function getAllNotificationFids(): Promise<number[]> {
  const fids = await kv.smembers('notif:fids');
  return fids.map(Number);
}

// ─── Send Notification ───

export async function sendNotification(
  fid: number,
  notification: {
    title: string;
    body: string;
    targetUrl: string;
    notificationId: string;
  }
): Promise<boolean> {
  const tokenData = await getNotificationToken(fid);
  if (!tokenData) return false;

  try {
    const response = await fetch(tokenData.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        notificationId: notification.notificationId,
        title: notification.title,
        body: notification.body,
        targetUrl: notification.targetUrl,
        tokens: [tokenData.token],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`Notification failed for FID ${fid}:`, errorData);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`Failed to send notification to FID ${fid}:`, error);
    return false;
  }
}

// ─── User Watch Config ───

export async function saveUserWatchConfig(
  fid: number,
  contracts: string[]
): Promise<void> {
  await kv.set(
    `watch:${fid}`,
    JSON.stringify({ fid, contracts, notifyEnabled: true })
  );
  // Index: for each contract, track which FIDs are watching it
  for (const contract of contracts) {
    await kv.sadd(`watchers:${contract.toLowerCase()}`, fid);
  }
}

export async function getUserWatchConfig(
  fid: number
): Promise<UserWatchConfig | null> {
  const data = await kv.get<string>(`watch:${fid}`);
  if (!data) return null;
  return typeof data === 'string' ? JSON.parse(data) : data;
}

export async function getWatchersForContract(
  contractAddress: string
): Promise<number[]> {
  const fids = await kv.smembers(
    `watchers:${contractAddress.toLowerCase()}`
  );
  return fids.map(Number);
}

// ─── Alchemy Webhook NFT Filter Management ───

const ALCHEMY_NOTIFY_URL = 'https://dashboard.alchemy.com/api/update-webhook-nft-filters';

function getAlchemyAuthToken(): string {
  return process.env.ALCHEMY_AUTH_TOKEN || '';
}

function getAlchemyWebhookId(): string {
  return process.env.ALCHEMY_WEBHOOK_ID || '';
}

/**
 * Add contract addresses to the Alchemy NFT Activity webhook filter.
 * Only contracts in the filter will trigger webhook events.
 */
export async function addWebhookFilters(contractAddresses: string[]): Promise<boolean> {
  const authToken = getAlchemyAuthToken();
  const webhookId = getAlchemyWebhookId();
  if (!authToken || !webhookId || contractAddresses.length === 0) return false;

  try {
    const filters = contractAddresses.map(addr => ({
      contract_address: addr.toLowerCase(),
    }));

    const res = await fetch(ALCHEMY_NOTIFY_URL, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-Alchemy-Token': authToken,
      },
      body: JSON.stringify({
        webhook_id: webhookId,
        nft_filters_to_add: filters,
        nft_filters_to_remove: [],
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Alchemy add filters error (${res.status}):`, errorText);
      return false;
    }

    console.log(`Alchemy: added ${contractAddresses.length} filter(s)`);
    return true;
  } catch (error) {
    console.error('Alchemy add filters failed:', error);
    return false;
  }
}

/**
 * Remove contract addresses from the Alchemy NFT Activity webhook filter.
 */
export async function removeWebhookFilters(contractAddresses: string[]): Promise<boolean> {
  const authToken = getAlchemyAuthToken();
  const webhookId = getAlchemyWebhookId();
  if (!authToken || !webhookId || contractAddresses.length === 0) return false;

  try {
    const filters = contractAddresses.map(addr => ({
      contract_address: addr.toLowerCase(),
    }));

    const res = await fetch(ALCHEMY_NOTIFY_URL, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-Alchemy-Token': authToken,
      },
      body: JSON.stringify({
        webhook_id: webhookId,
        nft_filters_to_add: [],
        nft_filters_to_remove: filters,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Alchemy remove filters error (${res.status}):`, errorText);
      return false;
    }

    console.log(`Alchemy: removed ${contractAddresses.length} filter(s)`);
    return true;
  } catch (error) {
    console.error('Alchemy remove filters failed:', error);
    return false;
  }
}
