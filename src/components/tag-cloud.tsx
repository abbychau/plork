'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';

interface TagCloudProps {
  maxTags?: number;
}

export default function TagCloud({ maxTags = 20 }: TagCloudProps) {
  const router = useRouter();
  const [tags, setTags] = useState<{ tag: string; count: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch trending tags from the API
    const fetchTrendingTags = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/posts/trending-tags?limit=${maxTags}`);

        if (!response.ok) {
          throw new Error('Failed to fetch trending tags');
        }

        const data = await response.json();
        setTags(data);
      } catch (error) {
        console.error('Error fetching trending tags:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrendingTags();
  }, [maxTags]);

  if (isLoading) {
    return (
      <div className="bg-muted/30 rounded-lg p-4">
        <h3 className="font-medium mb-3">Trending Tags</h3>
        <div className="flex flex-wrap gap-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-6 w-16 bg-muted/50 rounded-full animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

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
            <Badge variant="outline" className="hover:bg-primary/10 transition-colors cursor-pointer">
              #{tag} <span className="ml-1 text-xs text-muted-foreground">({count})</span>
            </Badge>
          </button>
        ))}
      </div>
    </div>
  );
}
