/**
 * Script to fix existing users' ActivityPub URLs
 * This updates the actorUrl, inboxUrl, outboxUrl, followersUrl, and followingUrl
 * to point to the correct API endpoints instead of the HTML pages
 */

const { PrismaClient } = require('@prisma/client');
const { getBaseUrl } = require('../src/lib/config');

const prisma = new PrismaClient();

async function fixActorUrls() {
  try {
    console.log('Starting to fix actor URLs...');
    
    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        actorUrl: true,
        inboxUrl: true,
        outboxUrl: true,
        followersUrl: true,
        followingUrl: true,
      },
    });

    console.log(`Found ${users.length} users to update`);

    // Get the base URL (using HTTPS as default for production)
    const baseUrl = getBaseUrl('https');

    for (const user of users) {
      // Check if the URLs need updating (if they don't already contain '/api/')
      if (!user.actorUrl.includes('/api/')) {
        const newActorUrl = `${baseUrl}/api/users/${user.username}`;
        const newInboxUrl = `${baseUrl}/api/users/${user.username}/inbox`;
        const newOutboxUrl = `${baseUrl}/api/users/${user.username}/outbox`;
        const newFollowersUrl = `${baseUrl}/api/users/${user.username}/followers`;
        const newFollowingUrl = `${baseUrl}/api/users/${user.username}/following`;

        console.log(`Updating user ${user.username}:`);
        console.log(`  Old actorUrl: ${user.actorUrl}`);
        console.log(`  New actorUrl: ${newActorUrl}`);

        await prisma.user.update({
          where: { id: user.id },
          data: {
            actorUrl: newActorUrl,
            inboxUrl: newInboxUrl,
            outboxUrl: newOutboxUrl,
            followersUrl: newFollowersUrl,
            followingUrl: newFollowingUrl,
          },
        });

        console.log(`  ✓ Updated user ${user.username}`);
      } else {
        console.log(`  ✓ User ${user.username} already has correct URLs`);
      }
    }

    console.log('✅ Actor URLs fixed successfully!');
  } catch (error) {
    console.error('❌ Error fixing actor URLs:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
fixActorUrls();
