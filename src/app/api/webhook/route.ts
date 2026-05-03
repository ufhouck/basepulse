import { NextResponse } from 'next/server';
import { parseWebhookEvent, verifyAppKeyWithNeynar } from '@farcaster/miniapp-node';
import {
  saveNotificationToken,
  removeNotificationToken,
} from '@/lib/notifications';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    console.log('Webhook received:', JSON.stringify(body).slice(0, 200));

    // Parse and verify the webhook event using the official SDK
    let data;
    try {
      data = await parseWebhookEvent(body, verifyAppKeyWithNeynar);
    } catch (e: unknown) {
      const error = e as Error;
      console.error('Webhook verification failed:', error.name, error.message);
      // Return 200 to avoid retries for invalid events
      return NextResponse.json(
        { error: 'Verification failed', detail: error.name },
        { status: 200 }
      );
    }

    const { fid, event } = data;
    console.log(`Webhook verified: event=${event.event}, FID=${fid}`);

    switch (event.event) {
      case 'miniapp_added':
        if (event.notificationDetails) {
          await saveNotificationToken(
            fid,
            event.notificationDetails.token,
            event.notificationDetails.url
          );
          console.log(`Saved notification token for FID ${fid}`);
        } else {
          console.log(`FID ${fid} added app but no notification details (notifications not granted)`);
        }
        break;

      case 'notifications_enabled':
        await saveNotificationToken(
          fid,
          event.notificationDetails.token,
          event.notificationDetails.url
        );
        console.log(`Notifications enabled for FID ${fid}`);
        break;

      case 'miniapp_removed':
        await removeNotificationToken(fid);
        console.log(`Removed notification token for FID ${fid} (app removed)`);
        break;

      case 'notifications_disabled':
        await removeNotificationToken(fid);
        console.log(`Notifications disabled for FID ${fid}`);
        break;

      default:
        console.log(`Unknown webhook event: ${(event as { event: string }).event}`);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
