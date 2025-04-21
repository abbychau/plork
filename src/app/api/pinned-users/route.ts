/**
 * Pinned Users API endpoint
 */
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma, userService } from '@/lib/db';

// GET /api/pinned-users - Get pinned users for the current user
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

    // Get pinned users
    const pinnedUsers = await prisma.pinnedUser.findMany({
      where: {
        userId,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // Get user details for each pinned user
    const pinnedUserDetails = await Promise.all(
      pinnedUsers.map(async (pinnedUser) => {
        const user = await userService.getUserById(pinnedUser.pinnedUserId);
        return user ? {
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          profileImage: user.profileImage,
          timestamp: pinnedUser.updatedAt.getTime(),
        } : null;
      })
    );

    // Filter out null values (in case a user was deleted)
    const validPinnedUsers = pinnedUserDetails.filter(Boolean);

    return NextResponse.json(validPinnedUsers);
  } catch (error) {
    console.error('Error getting pinned users:', error);
    return NextResponse.json(
      { error: 'Failed to get pinned users' },
      { status: 500 }
    );
  }
}

// POST /api/pinned-users - Pin a user
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

    // Get username from request body
    const { username } = await req.json();

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    // Find the target user
    const targetUser = await userService.getUserByUsername(username);

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if already pinned
    const existingPin = await prisma.pinnedUser.findUnique({
      where: {
        userId_pinnedUserId: {
          userId,
          pinnedUserId: targetUser.id,
        },
      },
    });

    if (existingPin) {
      // Update the timestamp to move this user to the top
      await prisma.pinnedUser.update({
        where: {
          id: existingPin.id,
        },
        data: {
          updatedAt: new Date(),
        },
      });

      return NextResponse.json({
        message: `User ${username} is already pinned`,
        user: {
          id: targetUser.id,
          username: targetUser.username,
          displayName: targetUser.displayName,
          profileImage: targetUser.profileImage,
        },
      });
    }

    // Count existing pins
    const pinnedCount = await prisma.pinnedUser.count({
      where: {
        userId,
      },
    });

    // If at max capacity (5), remove the oldest pin
    if (pinnedCount >= 5) {
      const oldestPin = await prisma.pinnedUser.findFirst({
        where: {
          userId,
        },
        orderBy: {
          updatedAt: 'asc',
        },
      });

      if (oldestPin) {
        await prisma.pinnedUser.delete({
          where: {
            id: oldestPin.id,
          },
        });
      }
    }

    // Create the pin
    await prisma.pinnedUser.create({
      data: {
        userId,
        pinnedUserId: targetUser.id,
      },
    });

    return NextResponse.json({
      message: `User ${username} has been pinned`,
      user: {
        id: targetUser.id,
        username: targetUser.username,
        displayName: targetUser.displayName,
        profileImage: targetUser.profileImage,
      },
    });
  } catch (error) {
    console.error('Error pinning user:', error);
    return NextResponse.json(
      { error: 'Failed to pin user' },
      { status: 500 }
    );
  }
}

// DELETE /api/pinned-users?username=xxx - Unpin a user
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

    // Get username from query parameters
    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    // Find the target user
    const targetUser = await userService.getUserByUsername(username);

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Delete the pin
    await prisma.pinnedUser.deleteMany({
      where: {
        userId,
        pinnedUserId: targetUser.id,
      },
    });

    return NextResponse.json({
      message: `User ${username} has been unpinned`,
    });
  } catch (error) {
    console.error('Error unpinning user:', error);
    return NextResponse.json(
      { error: 'Failed to unpin user' },
      { status: 500 }
    );
  }
}
