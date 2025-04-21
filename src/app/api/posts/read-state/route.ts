/**
 * Update timeline read state API endpoint
 */
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';

// POST /api/posts/read-state - Update the read state for timeline
export async function POST(request: NextRequest) {
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

    try {
      // Update or create the read state for timeline
      const readState = await prisma.userReadState.upsert({
        where: {
          userId_authorUsername: {
            userId,
            authorUsername: 'timeline', // Special case for timeline
          },
        },
        update: {
          lastReadAt: new Date(),
        },
        create: {
          userId,
          authorUsername: 'timeline',
          lastReadAt: new Date(),
        },
      });

      return NextResponse.json({ success: true, readState });
    } catch (error) {
      console.log('UserReadState model may not be available yet');
      // If the model isn't available yet, just return success
      return NextResponse.json({ success: true, message: 'Read state tracking not available yet' });
    }
  } catch (error) {
    console.error('Error updating timeline read state:', error);
    return NextResponse.json(
      { error: 'Failed to update timeline read state' },
      { status: 500 }
    );
  }
}
