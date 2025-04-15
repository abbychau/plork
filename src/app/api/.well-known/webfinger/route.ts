/**
 * WebFinger endpoint for ActivityPub discovery
 */
import { NextRequest, NextResponse } from 'next/server';
import { userService } from '@/lib/db';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const resource = searchParams.get('resource');
  
  if (!resource) {
    return NextResponse.json(
      { error: 'Resource parameter is required' },
      { status: 400 }
    );
  }
  
  // Parse the resource URI
  // Format: acct:username@domain
  const match = resource.match(/^acct:([^@]+)@(.+)$/);
  
  if (!match) {
    return NextResponse.json(
      { error: 'Invalid resource format' },
      { status: 400 }
    );
  }
  
  const [, username, domain] = match;
  
  // Check if the domain matches our domain
  const host = req.headers.get('host') || '';
  if (domain !== host) {
    return NextResponse.json(
      { error: 'Domain not found' },
      { status: 404 }
    );
  }
  
  // Find the user
  const user = await userService.getUserByUsername(username);
  
  if (!user) {
    return NextResponse.json(
      { error: 'User not found' },
      { status: 404 }
    );
  }
  
  // Construct the WebFinger response
  const response = {
    subject: resource,
    links: [
      {
        rel: 'self',
        type: 'application/activity+json',
        href: user.actorUrl,
      },
    ],
  };
  
  return NextResponse.json(response);
}
