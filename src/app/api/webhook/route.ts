import { NextResponse } from 'next/server';
import {
  saveNotificationToken,
  removeNotificationToken,
} from '@/lib/notifications';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { header, payload, signature } = body;

    if (!header || !payload || !signature) {
      return NextResponse.json(
        { error: 'Invalid webhook format' },
        { status: 400 }
      );
    }

    // Decode the payload to get the event data
    let eventData: {
      event: string;
      notificationDetails?: { url: string; token: string };
    };

    try {
      // The payload is base64url encoded JSON
      const payloadStr = Buffer.from(payload, 'base64url').toString('utf-8');
      eventData = JSON.parse(payloadStr);
    } catch {
      // Try parsing body directly if it has event field
      if (body.event) {
        eventData = body;
      } else {
        return NextResponse.json(
          { error: 'Invalid payload' },
          { status: 400 }
        );
      }
    }

    // Decode header to get FID
    let fid: number | undefined;
    try {
      const headerStr = Buffer.from(header, 'base64url').toString('utf-8');
      const headerData = JSON.parse(headerStr);
      fid = headerData.fid;
    } catch {
      // FID extraction failed
    }

    console.log(`Webhook event: ${eventData.event}, FID: ${fid}`);

    switch (eventData.event) {
      case 'miniapp_added':
      case 'notifications_enabled':
        if (fid && eventData.notificationDetails) {
          await saveNotificationToken(
            fid,
            eventData.notificationDetails.token,
            eventData.notificationDetails.url
          );
          console.log(`Saved notification token for FID ${fid}`);
        }
        break;

      case 'miniapp_removed':
      case 'notifications_disabled':
        if (fid) {
          await removeNotificationToken(fid);
          console.log(`Removed notification token for FID ${fid}`);
        }
        break;

      default:
        console.log(`Unknown webhook event: ${eventData.event}`);
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
