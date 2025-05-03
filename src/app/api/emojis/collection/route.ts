'use server';

import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/api-auth';
import { prisma } from '@/lib/db';

export async function GET(req: Request) {
  const userId = await authenticateRequest(req as any);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const userEmojis = await prisma.userEmojiCollection.findMany({
      where: { userId },
      include: {
        customEmoji: {
          select: { 
            imageUrl: true, 
            name: true,
            creator: {
              select: {
                username: true
              }
            }
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Format the response to include the user's custom name and the image URL
    const formattedEmojis = userEmojis.map(item => ({
      name: item.name, // The user's custom name (e.g., 'my-cat')
      imageUrl: item.customEmoji.imageUrl,
      originalName: item.customEmoji.name, // The original name given by creator
      id: item.customEmojiId, // ID of the CustomEmoji itself
      creatorUsername: item.customEmoji.creator.username // Add creator's username
    }));

    return NextResponse.json(formattedEmojis);

  } catch (error) {
    console.error('Error fetching user emoji collection:', error);
    return NextResponse.json({ error: 'Failed to fetch emoji collection' }, { status: 500 });
  }
}