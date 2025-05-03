'use server';

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/db';

interface AddEmojiRequest {
  customEmojiId: string;
  name: string;
}

export async function POST(req: NextRequest) {
  const authError = await requireAuth(req);
  if (authError) {
    return authError;
  }

  try {
    const { customEmojiId, name }: AddEmojiRequest = await req.json();
    const userId = req.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ error: 'User ID not found' }, { status: 401 });
    }

    if (!customEmojiId) {
      return NextResponse.json({ error: 'Missing customEmojiId' }, { status: 400 });
    }
    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: 'Emoji name is required' }, { status: 400 });
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
        return NextResponse.json({ error: 'Emoji name can only contain letters, numbers, underscores, and hyphens' }, { status: 400 });
    }

    // 1. Check if the custom emoji exists
    const customEmoji = await prisma.customEmoji.findUnique({
      where: { id: customEmojiId },
    });

    if (!customEmoji) {
      return NextResponse.json({ error: 'Custom emoji not found' }, { status: 404 });
    }

    // 2. Check if the user already has this emoji in their collection (by customEmojiId)
    const existingById = await prisma.userEmojiCollection.findUnique({
        where: { userId_customEmojiId: { userId, customEmojiId } },
    });

    if (existingById) {
        return NextResponse.json({ error: 'You already have this emoji in your collection' }, { status: 409 });
    }

    // 3. Check if the user already has an emoji with the desired name
    const existingByName = await prisma.userEmojiCollection.findUnique({
        where: { userId_name: { userId, name } },
    });

    if (existingByName) {
        return NextResponse.json({ error: `You already have an emoji named ':${name}:'` }, { status: 409 });
    }

    // 4. Add the emoji to the user's collection
    const addedEmoji = await prisma.userEmojiCollection.create({
      data: {
        userId,
        customEmojiId: customEmojiId,
        name: name,
      },
      include: {
        customEmoji: {
            select: { imageUrl: true, name: true } // Include original details for response
        }
      }
    });

    // Format response similar to the collection GET route
    const formattedResponse = {
        name: addedEmoji.name,
        imageUrl: addedEmoji.customEmoji.imageUrl,
        originalName: addedEmoji.customEmoji.name,
        id: addedEmoji.customEmojiId
    };

    return NextResponse.json(formattedResponse, { status: 201 });

  } catch (error) {
    console.error('Error adding emoji to collection:', error);
    // Handle potential database constraint errors more specifically if needed
    if (error instanceof Error && 'code' in error && error.code === 'P2002') { // Prisma unique constraint violation
        return NextResponse.json({ error: 'An emoji with this name or ID already exists in your collection.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to add emoji to collection' }, { status: 500 });
  }
}