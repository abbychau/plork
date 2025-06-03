'use client';

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import UserProfilePopover from '@/components/user-profile-popover';

interface MentionTextProps {
  text: string;
}

export default function MentionText({ text = '' }: MentionTextProps) {
  // Function to parse text and render mentions with avatars and popovers
  const renderTextWithMentions = () => {
    // If text is empty or not a string, return empty
    if (!text || typeof text !== 'string') {
      return null;
    }

    // Regular expression to match mentions (@username)
    const mentionRegex = /(@[a-zA-Z0-9_-]+)/g;

    // Split the text by mentions
    const parts = text.split(mentionRegex);

    return parts.map((part, index) => {
      // Check if the part is a mention
      if (part.match(mentionRegex)) {
        const username = part.substring(1); // Remove the @ symbol
        return (
          <UserProfilePopover
            key={index}
            username={username}
          >
            <span className="inline-flex items-center gap-1 cursor-pointer hover:bg-muted/50 rounded px-1 py-0.5 transition-colors">

              <span className="font-medium text-primary hover:underline">
                {part}
              </span>
            </span>
          </UserProfilePopover>
        );
      }

      // Return regular text
      return <span key={index}>{part}</span>;
    });
  };

  // Return the fragments directly without a wrapping div
  return <>{renderTextWithMentions()}</>;
}
