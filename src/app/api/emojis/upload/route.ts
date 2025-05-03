'use server';

import { NextResponse, NextRequest } from 'next/server';
import { authenticateRequest } from '@/lib/api-auth';
import { prisma } from '@/lib/db';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';

// Ensure the upload directory exists
const EMOJI_UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'emojis');
const ensureUploadDirExists = async () => {
  try {
    await fs.access(EMOJI_UPLOAD_DIR);
  } catch (error) {
    // Directory does not exist, create it
    await fs.mkdir(EMOJI_UPLOAD_DIR, { recursive: true });
  }
};

// Simple local file storage function (replace with a proper storage solution)
async function uploadEmojiFile(buffer: Buffer, fileName: string): Promise<string> {
  await ensureUploadDirExists();
  const filePath = path.join(EMOJI_UPLOAD_DIR, fileName);
  await fs.writeFile(filePath, buffer);
  // Return the public URL path
  return `/uploads/emojis/${fileName}`;
}

export async function POST(req: Request) {
  const userId = await authenticateRequest(req as NextRequest);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const name = formData.get('name') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: 'Emoji name is required' }, { status: 400 });
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
        return NextResponse.json({ error: 'Emoji name can only contain letters, numbers, underscores, and hyphens' }, { status: 400 });
    }

    // --- Image Processing ---
    const allowedTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
        return NextResponse.json({ error: 'Invalid file type. Only PNG, JPG, GIF, WEBP allowed.' }, { status: 400 });
    }

    const imageBuffer = Buffer.from(await file.arrayBuffer());

    let processedImageBuffer: Buffer;
    try {
        const image = sharp(imageBuffer);
        const metadata = await image.metadata();

        if (!metadata.width || !metadata.height) {
            throw new Error('Could not read image dimensions');
        }

        // Find largest center square
        const size = Math.min(metadata.width, metadata.height);
        const top = Math.floor((metadata.height - size) / 2);
        const left = Math.floor((metadata.width - size) / 2);

        processedImageBuffer = await image
            .extract({ width: size, height: size, top: top, left: left })
            .resize(128, 128)
            .webp({ quality: 80 }) // Convert to webp for consistency and size
            .toBuffer();

    } catch (processingError) {
        console.error('Error processing image:', processingError);
        return NextResponse.json({ error: 'Failed to process image' }, { status: 500 });
    }

    const imageFileName = `emoji_${userId}_${name}_${Date.now()}.webp`;

    // --- File Upload ---
    const imageUrl = await uploadEmojiFile(processedImageBuffer, imageFileName);

    // --- Database Operations ---
    // Check if user already has an emoji with this name in their collection
    const existingCollectionEntry = await prisma.userEmojiCollection.findUnique({
        where: { userId_name: { userId: userId, name } },
    });

    if (existingCollectionEntry) {
        return NextResponse.json({ error: `You already have an emoji named ':${name}:'` }, { status: 409 });
    }

    // Create the CustomEmoji and add it to the user's collection in a transaction
    const newEmoji = await prisma.$transaction(async (tx) => {
        const createdEmoji = await tx.customEmoji.create({
            data: {
                name: name, // Store the original name used during creation
                imageUrl: imageUrl,
                creatorId: userId,
            },
        });

        await tx.userEmojiCollection.create({
            data: {
                userId: userId,
                customEmojiId: createdEmoji.id,
                name: name, // User's name for the emoji in their collection
            },
        });

        return createdEmoji;
    });

    return NextResponse.json({ id: newEmoji.id, name: name, imageUrl: newEmoji.imageUrl }, { status: 201 });

  } catch (error) {
    console.error('Error uploading custom emoji:', error);
    return NextResponse.json({ error: 'Failed to upload emoji' }, { status: 500 });
  }
}