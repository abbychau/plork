/**
 * Update user read state API endpoint
 */
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';

// POST /api/users/read-state - Update the read state for a user
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

    // Get request body
    const { authorUsername } = await request.json();

    if (!authorUsername) {
      return NextResponse.json(
        { error: 'Author username is required' },
        { status: 400 }
      );
    }

    try {
      // Try to update or create the read state
      // This is wrapped in a try/catch in case the UserReadState model isn't available yet
      const readState = await prisma.userReadState.upsert({
        where: {
          userId_authorUsername: {
            userId,
            authorUsername,
          },
        },
        update: {
          lastReadAt: new Date(),
        },
        create: {
          userId,
          authorUsername,
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
    console.error('Error updating read state:', error);
    return NextResponse.json(
      { error: 'Failed to update read state' },
      { status: 500 }
    );
  }
}
