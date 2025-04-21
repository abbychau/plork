/**
 * Script to normalize hashtags in all posts to lowercase
 * 
 * Run with: node scripts/normalize-hashtags.js
 */
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Function to extract hashtags from text and convert to lowercase
function extractHashtags(text) {
  const hashtagRegex = /#([\w\u0080-\uFFFF]+)/g;
  const matches = text.match(hashtagRegex);

  if (!matches) return [];

  // Remove duplicates, the # symbol, and convert to lowercase for consistency
  return [...new Set(matches)].map(tag => tag.substring(1).toLowerCase());
}

async function normalizeHashtags() {
  console.log('Normalizing hashtags in all posts...');

  try {
    // Get all posts
    const posts = await prisma.post.findMany();
    console.log(`Found ${posts.length} posts to process`);

    let updatedCount = 0;

    // Update each post
    for (const post of posts) {
      const hashtags = extractHashtags(post.content);
      const hashtagsString = hashtags.length > 0 ? hashtags.join(',') : null;

      // Only update if the hashtags have changed
      if (hashtagsString !== post.hashtags) {
        // Update the post
        await prisma.post.update({
          where: { id: post.id },
          data: { hashtags: hashtagsString },
        });

        updatedCount++;
        console.log(`Updated post ${post.id}: ${post.hashtags} -> ${hashtagsString}`);
      }

      if ((updatedCount + 1) % 10 === 0) {
        console.log(`Processed ${updatedCount + 1} posts...`);
      }
    }

    console.log(`Successfully updated ${updatedCount} posts with normalized hashtags`);
  } catch (error) {
    console.error('Error normalizing hashtags:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the update function
normalizeHashtags();
