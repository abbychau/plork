/**
 * Push subscription management API
 */
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { 
  savePushSubscription, 
  getUserPushSubscriptions, 
  removePushSubscription,
  getVapidPublicKey 
} from '@/lib/web-push';

// GET /api/push/subscriptions - Get user's push subscriptions
export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;

    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const subscriptions = await getUserPushSubscriptions(userId);

    return NextResponse.json({ subscriptions });
  } catch (error) {
    console.error('Error getting push subscriptions:', error);
    return NextResponse.json(
      { error: 'Failed to get push subscriptions' },
      { status: 500 }
    );
  }
}

// POST /api/push/subscriptions - Save a new push subscription
export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;

    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { subscription } = await req.json();

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return NextResponse.json(
        { error: 'Invalid subscription data' },
        { status: 400 }
      );
    }

    const userAgent = req.headers.get('user-agent') || undefined;

    const savedSubscription = await savePushSubscription(
      userId,
      subscription,
      userAgent
    );

    return NextResponse.json({ 
      success: true, 
      subscription: savedSubscription 
    });
  } catch (error) {
    console.error('Error saving push subscription:', error);
    return NextResponse.json(
      { error: 'Failed to save push subscription' },
      { status: 500 }
    );
  }
}

// DELETE /api/push/subscriptions - Remove a push subscription
export async function DELETE(req: NextRequest) {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;

    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { endpoint } = await req.json();

    if (!endpoint) {
      return NextResponse.json(
        { error: 'Endpoint is required' },
        { status: 400 }
      );
    }

    await removePushSubscription(userId, endpoint);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing push subscription:', error);
    return NextResponse.json(
      { error: 'Failed to remove push subscription' },
      { status: 500 }
    );
  }
}
