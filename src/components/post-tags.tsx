'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

interface PostTagsProps {
  hashtags: string | null;
  className?: string;
  limit?: number;
}

export default function PostTags({ hashtags, className = '', limit }: PostTagsProps) {
  const [showAllTags, setShowAllTags] = useState(false);

  if (!hashtags) return null;

  // Split the comma-separated hashtags
  const tags = hashtags.split(',');

  // Apply limit if specified and not showing all tags
  const displayTags = (limit && !showAllTags) ? tags.slice(0, limit) : tags;

  // Toggle showing all tags
  const handleShowMoreClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering parent click
    setShowAllTags(!showAllTags);
  };

  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {displayTags.map((tag, index) => (
        <Link
          key={`${tag}-${index}`}
          href={`/tags?tag=${encodeURIComponent(tag)}`}
          onClick={(e) => e.stopPropagation()} // Prevent triggering parent click
        >
          <Badge
            variant="secondary"
            className="text-xs font-normal hover:bg-secondary/80 transition-colors cursor-pointer rounded-sm px-1.5 py-0.5"
          >
            #{tag}
          </Badge>
        </Link>
      ))}
      {limit && tags.length > limit && !showAllTags && (
        <Badge
          variant="outline"
          className="text-xs font-normal rounded-sm px-1.5 py-0.5 hover:bg-secondary/30 cursor-pointer"
          onClick={handleShowMoreClick}
        >
          +{tags.length - limit} more
        </Badge>
      )}
      {showAllTags && limit && tags.length > limit && (
        <Badge
          variant="outline"
          className="text-xs font-normal rounded-sm px-1.5 py-0.5 hover:bg-secondary/30 cursor-pointer"
          onClick={handleShowMoreClick}
        >
          Show less
        </Badge>
      )}
    </div>
  );
}
