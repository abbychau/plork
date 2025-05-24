/**
 * User search API endpoint
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';

interface UserSearchResult {
  id: bigint;
  username: string;
  displayName: string;
  profileImage: string | null;
  followersCount: bigint;
  followingCount: bigint;
  postsCount: bigint;
}

// GET /api/users/search?q=xxx - Search for users by username or display name
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';

    if (!query.trim()) {
      return NextResponse.json({ users: [] });
    }

    // Search for users by username or display name
    // For SQLite, we need to use a raw query for case-insensitive search
    const users = await prisma.$queryRaw<UserSearchResult[]>`
      SELECT
        id, username, displayName, profileImage,
        (SELECT COUNT(*) FROM Follow WHERE followingId = User.id) as followersCount,
        (SELECT COUNT(*) FROM Follow WHERE followerId = User.id) as followingCount,
        (SELECT COUNT(*) FROM Post WHERE authorId = User.id) as postsCount
      FROM User
      WHERE
        LOWER(username) LIKE ${'%' + query.toLowerCase() + '%'} OR
        LOWER(displayName) LIKE ${'%' + query.toLowerCase() + '%'}
      LIMIT 10
    `;

    // Convert BigInt values to numbers before returning
    const serializedUsers = users.map(user => ({
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      profileImage: user.profileImage,
      followersCount: Number(user.followersCount),
      followingCount: Number(user.followingCount),
      postsCount: Number(user.postsCount)
    }));

    return NextResponse.json({ users: serializedUsers });
  } catch (error) {
    console.error('Error searching users:', error);
    return NextResponse.json(
      { error: 'Failed to search users' },
      { status: 500 }
    );
  }
}
