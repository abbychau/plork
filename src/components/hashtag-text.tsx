'use client';

import React from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

interface HashtagTextProps {
  text: string;
}

export default function HashtagText({ text = '' }: HashtagTextProps) {
  // Function to parse text and render hashtags as links
  const renderTextWithHashtags = () => {
    // If text is empty or not a string, return empty
    if (!text || typeof text !== 'string') {
      return null;
    }

    // Regular expression to match hashtags
    const hashtagRegex = /(#[\w\u0080-\uFFFF]+)/g;

    // Split the text by hashtags
    const parts = text.split(hashtagRegex);

    return parts.map((part, index) => {
      // Check if the part is a hashtag
      if (part.match(hashtagRegex)) {
        const hashtag = part.substring(1); // Remove the # symbol
        return (
          <Link
            key={index}
            href={`/explore?tag=${hashtag}`}
            className="inline-block"
          >
            <Badge variant="secondary" className="font-normal hover:bg-secondary/80 transition-colors cursor-pointer">
              {part}
            </Badge>
          </Link>
        );
      }

      // Return regular text
      return <span key={index}>{part}</span>;
    });
  };

  // Return the fragments directly without a wrapping div
  return <>{renderTextWithHashtags()}</>;
}
