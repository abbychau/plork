/**
 * Logout API endpoint
 */
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  // Clear the session cookie
  const cookieStore = await cookies();
  cookieStore.delete('userId');

  return NextResponse.json({ success: true });
}
