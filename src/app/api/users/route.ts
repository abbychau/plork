/**
 * Users API endpoint
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/users - Get all users
export async function GET(req: NextRequest) {
  try {
    // Get query parameters
    const searchParams = req.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Handle search differently based on whether we have a search term
    if (search) {
      // Use raw SQL for case-insensitive search in SQLite
      const users = await prisma.$queryRaw`
        SELECT
          id, username, displayName, profileImage, summary, actorUrl,
          (SELECT COUNT(*) FROM Follow WHERE followingId = User.id) as followersCount,
          (SELECT COUNT(*) FROM Follow WHERE followerId = User.id) as followingCount,
          (SELECT COUNT(*) FROM Post WHERE authorId = User.id) as postsCount,
          (SELECT COUNT(*) FROM Comment WHERE authorId = User.id) as repliesCount
        FROM User
        WHERE
          LOWER(username) LIKE ${'%' + search.toLowerCase() + '%'} OR
          LOWER(displayName) LIKE ${'%' + search.toLowerCase() + '%'}
        ORDER BY createdAt DESC
        LIMIT ${limit} OFFSET ${offset}
      `;

      // Convert BigInt values to numbers before returning
      const serializedUsers = (users as any[]).map(user => ({
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        summary: user.summary,
        profileImage: user.profileImage,
        actorUrl: user.actorUrl,
        followersCount: Number(user.followersCount),
        followingCount: Number(user.followingCount),
        postsCount: Number(user.postsCount),
        repliesCount: Number(user.repliesCount || 0)
      }));

      return NextResponse.json(serializedUsers);
    } else {
      // If no search term, use the regular Prisma query
      const users = await prisma.user.findMany({
        where: {},
        select: {
          id: true,
          username: true,
          displayName: true,
          summary: true,
          profileImage: true,
          actorUrl: true,
          _count: {
            select: {
              followers: true,
              following: true,
              posts: true,
              comments: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        skip: offset,
      });

      // Format the response
      const formattedUsers = users.map(user => ({
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        summary: user.summary,
        profileImage: user.profileImage,
        actorUrl: user.actorUrl,
        followersCount: user._count.followers,
        followingCount: user._count.following,
        postsCount: user._count.posts,
        repliesCount: user._count.comments,
      }));

      return NextResponse.json(formattedUsers);
    }
  } catch (error) {
    console.error('Error getting users:', error);
    return NextResponse.json(
      { error: 'Failed to get users' },
      { status: 500 }
    );
  }
}
