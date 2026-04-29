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
