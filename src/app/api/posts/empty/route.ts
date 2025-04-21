/**
 * Empty posts API endpoint
 * Used when no tag is selected on the Tags page
 */
import { NextRequest, NextResponse } from 'next/server';

// GET /api/posts/empty - Return an empty posts array
export async function GET(_request: NextRequest) {
  try {
    // Return an empty posts array with the expected structure
    return NextResponse.json({
      posts: [],
      nextOffset: null
    });
  } catch (error) {
    console.error('Error in empty posts endpoint:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
