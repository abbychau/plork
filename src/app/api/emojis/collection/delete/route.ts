'use server';

import { NextResponse, NextRequest } from 'next/server';
import { authenticateRequest } from '@/lib/api-auth';
import { prisma } from '@/lib/db';

export async function DELETE(req: NextRequest) {
  const userId = await authenticateRequest(req);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const customEmojiId = searchParams.get('customEmojiId');

    if (!customEmojiId) {
      return NextResponse.json({ error: 'Missing customEmojiId' }, { status: 400 });
    }

    // Delete the emoji from the user's collection
    await prisma.userEmojiCollection.delete({
      where: {
        userId_customEmojiId: {
          userId,
          customEmojiId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting emoji from collection:', error);
    return NextResponse.json({ error: 'Failed to delete emoji from collection' }, { status: 500 });
  }
} 