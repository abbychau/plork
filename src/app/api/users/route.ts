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
    
    // Build the where clause
    const where = search
      ? {
          OR: [
            { username: { contains: search } },
            { displayName: { contains: search } },
          ],
        }
      : {};
    
    // Get users
    const users = await prisma.user.findMany({
      where,
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
    }));
    
    return NextResponse.json(formattedUsers);
  } catch (error) {
    console.error('Error getting users:', error);
    return NextResponse.json(
      { error: 'Failed to get users' },
      { status: 500 }
    );
  }
}
