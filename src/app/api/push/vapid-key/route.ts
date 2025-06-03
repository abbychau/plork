/**
 * VAPID public key API endpoint
 */
import { NextResponse } from 'next/server';
import { getVapidPublicKey } from '@/lib/web-push';

// GET /api/push/vapid-key - Get VAPID public key for client-side subscription
export async function GET() {
  try {
    console.log('VAPID key request received');
    const publicKey = getVapidPublicKey();

    if (!publicKey) {
      console.error('VAPID public key not found in environment');
      return NextResponse.json(
        { error: 'VAPID keys not configured' },
        { status: 503 }
      );
    }

    console.log('VAPID public key retrieved successfully');
    return NextResponse.json({ publicKey });
  } catch (error) {
    console.error('Error getting VAPID public key:', error);
    return NextResponse.json(
      { error: 'Failed to get VAPID public key' },
      { status: 500 }
    );
  }
}
