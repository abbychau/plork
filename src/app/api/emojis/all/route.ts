'use server';

import { NextResponse, NextRequest } from 'next/server';
import { authenticateRequest } from '@/lib/api-auth';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const userId = await authenticateRequest(req);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const allEmojis = await prisma.customEmoji.findMany({
      include: {
        creator: {
          select: {
            username: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Format the response
    const formattedEmojis = allEmojis.map(emoji => ({
      id: emoji.id,
      name: emoji.name,
      imageUrl: emoji.imageUrl,
      originalName: emoji.name,
      creatorUsername: emoji.creator.username
    }));

    return NextResponse.json(formattedEmojis);
  } catch (error) {
    console.error('Error fetching all emojis:', error);
    return NextResponse.json({ error: 'Failed to fetch emojis' }, { status: 500 });
  }
} 