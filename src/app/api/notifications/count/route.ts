/**
 * Notification count API endpoint
 */
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getUnreadNotificationCount } from '@/lib/notifications';

// GET /api/notifications/count - Get unread notification count for the current user
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

    // Get unread notification count
    const count = await getUnreadNotificationCount(userId);

    return NextResponse.json({ count });
  } catch (error) {
    console.error('Error getting notification count:', error);
    return NextResponse.json(
      { error: 'Failed to get notification count' },
      { status: 500 }
    );
  }
}
