/**
 * Image upload API endpoint
 */
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { userService } from '@/lib/db';
import crypto from 'crypto';
import sharp from 'sharp';
import { uploadFile } from '@/lib/minio-client';

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

    // Verify user exists
    const user = await userService.getUserById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      );
    }

    // Parse the form data
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.' },
        { status: 400 }
      );
    }

    // Generate a unique filename
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const randomName = crypto.randomBytes(16).toString('hex');
    const fileName = `${randomName}.${fileExtension}`;
    const filePath = `uploads/${fileName}`;

    // Get the file data as a buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // Process the image with sharp
    // Resize only if dimensions exceed limits, maintaining aspect ratio
    const processedImageBuffer = await sharp(fileBuffer)
      .resize(1200, 1200, {
        fit: 'inside',    // This maintains aspect ratio and fits within the bounds
        withoutEnlargement: true // Don't enlarge if image is smaller than bounds
      })
      .toBuffer();

    // Upload to MinIO
    const fileUrl = await uploadFile(processedImageBuffer, filePath, true);

    return NextResponse.json({ url: fileUrl });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

// Increase the limit for the request body size
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};
