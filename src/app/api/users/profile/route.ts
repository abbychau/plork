/**
 * User profile update endpoint
 */
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';

// PUT /api/users/profile - Update user profile
export async function PUT(request: NextRequest) {
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

    // Get the updated profile data from the request body
    const body = await request.json();
    const { displayName, summary, email } = body;

    // Check if email is being changed and if it's already in use
    if (email && email.trim() !== '' && email !== user.email) {
      const existingUserWithEmail = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUserWithEmail && existingUserWithEmail.id !== userId) {
        return NextResponse.json(
          { error: 'Email is already in use by another account' },
          { status: 400 }
        );
      }
    }

    // Prepare the data object for update
    const updateData: any = {
      displayName,
      summary,
    };

    // Handle email update
    if (email === '') {
      // If email is empty string, set it to null to avoid unique constraint issues
      updateData.email = null;
    } else if (email && email !== user.email) {
      // Only update email if it's provided, not empty, and different from current
      updateData.email = email;
    }

    // Update the user profile
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    // Return the updated user (without sensitive information)
    return NextResponse.json({
      id: updatedUser.id,
      username: updatedUser.username,
      displayName: updatedUser.displayName,
      summary: updatedUser.summary,
      email: updatedUser.email,
      profileImage: updatedUser.profileImage,
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
