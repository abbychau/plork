/**
 * Script to update existing posts with hashtags
 *
 * Run with: node scripts/update-post-hashtags.js
 */
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Function to extract hashtags from text
function extractHashtags(text) {
  const hashtagRegex = /#([\w\u0080-\uFFFF]+)/g;
  const matches = text.match(hashtagRegex);

  if (!matches) return [];

  // Remove duplicates and the # symbol
  return [...new Set(matches)].map(tag => tag.substring(1));
}

async function updatePostHashtags() {
  console.log('Updating post hashtags...');

  try {
    // Get all posts
    const posts = await prisma.post.findMany();
    console.log(`Found ${posts.length} posts to update`);

    let updatedCount = 0;

    // Update each post
    for (const post of posts) {
      const hashtags = extractHashtags(post.content);
      const hashtagsString = hashtags.length > 0 ? hashtags.join(',') : null;

      // Update the post
      await prisma.post.update({
        where: { id: post.id },
        data: { hashtags: hashtagsString },
      });

      updatedCount++;
      if (updatedCount % 10 === 0) {
        console.log(`Updated ${updatedCount} posts...`);
      }
    }

    console.log(`Successfully updated ${updatedCount} posts with hashtags`);
  } catch (error) {
    console.error('Error updating post hashtags:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the update function
updatePostHashtags();
