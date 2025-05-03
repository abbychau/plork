/**
 * Avatar upload endpoint
 */
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '@/lib/db';
import sharp from 'sharp';
import { uploadFile } from '@/lib/minio-client';

// PUT /api/users/avatar - Update user avatar
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

    // Get the user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Process the form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.' },
        { status: 400 }
      );
    }

    // Create a unique filename
    const fileExtension = file.type.split('/')[1] || 'jpg';
    const fileName = `${uuidv4()}.${fileExtension}`;
    const filePath = `avatars/${fileName}`;

    try {
      // Get file buffer
      const buffer = Buffer.from(await file.arrayBuffer());

      // Process the image with sharp
      // 1. Resize to a square (crop to aspect ratio)
      // 2. Resize to 300x300 pixels
      const processedImageBuffer = await sharp(buffer)
        .resize(300, 300, {
          fit: 'cover',    // This crops the image to maintain aspect ratio
          position: 'center' // Center the crop
        })
        .toBuffer();

      // Upload to MinIO
      const imageUrl = await uploadFile(processedImageBuffer, filePath);

      // Update the user's profile image
      await prisma.user.update({
        where: { id: userId },
        data: {
          profileImage: imageUrl,
        },
      });

      return NextResponse.json({
        message: 'Avatar updated successfully',
        profileImage: imageUrl,
      });
    } catch (error) {
      console.error('Error processing and saving file:', error);
      return NextResponse.json(
        { error: 'Failed to process and save file' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error updating avatar:', error);
    return NextResponse.json(
      { error: 'Failed to update avatar' },
      { status: 500 }
    );
  }
}
