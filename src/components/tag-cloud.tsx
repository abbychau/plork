'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { extractHashtags } from '@/lib/utils';

interface Post {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    username: string;
    displayName?: string;
    profileImage?: string;
  };
}

interface TagCloudProps {
  posts: Post[];
  maxTags?: number;
}

export default function TagCloud({ posts, maxTags = 20 }: TagCloudProps) {
  const router = useRouter();
  const [tags, setTags] = useState<{ tag: string; count: number }[]>([]);

  useEffect(() => {
    if (!posts || posts.length === 0) return;

    // Extract all hashtags from posts
    const allTags: string[] = [];
    posts.forEach(post => {
      const postTags = extractHashtags(post.content);
      allTags.push(...postTags);
    });

    // Count occurrences of each tag
    const tagCounts: Record<string, number> = {};
    allTags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });

    // Convert to array and sort by count
    const sortedTags = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, maxTags);

    setTags(sortedTags);
  }, [posts, maxTags]);

  if (tags.length === 0) {
    return null;
  }

  return (
    <div className="bg-muted/30 rounded-lg p-4">
      <h3 className="font-medium mb-3">Trending Tags</h3>
      <div className="flex flex-wrap gap-2">
        {tags.map(({ tag, count }) => (
          <button
            key={tag}
            onClick={() => router.push(`/explore?tag=${tag}`)}
            className="inline-block"
          >
            <Badge variant="outline" className="hover:bg-primary/10 transition-colors">
              #{tag} <span className="ml-1 text-xs text-muted-foreground">({count})</span>
            </Badge>
          </button>
        ))}
      </div>
    </div>
  );
}
