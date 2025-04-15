/**
 * Notifications API endpoint
 */
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getUserNotifications, markAllNotificationsAsRead } from '@/lib/notifications';

// GET /api/notifications - Get notifications for the current user
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

    // Get query parameters
    const searchParams = req.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Get notifications
    const notifications = await getUserNotifications(userId, limit, offset);

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Error getting notifications:', error);
    return NextResponse.json(
      { error: 'Failed to get notifications' },
      { status: 500 }
    );
  }
}

// PUT /api/notifications - Mark all notifications as read
export async function PUT() {
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

    // Mark all notifications as read
    await markAllNotificationsAsRead(userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark notifications as read' },
      { status: 500 }
    );
  }
}
