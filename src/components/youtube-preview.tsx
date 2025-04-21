'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog';
import { VisuallyHidden } from '@/components/ui/visually-hidden';
import { Button } from '@/components/ui/button';
import { X, Play } from 'lucide-react';
import { extractYouTubeVideoId } from '@/lib/utils';

interface YouTubePreviewProps {
  url: string;
  title?: string;
}

export default function YouTubePreview({ url, title = 'YouTube Video' }: YouTubePreviewProps) {
  const [isOpen, setIsOpen] = useState(false);
  const videoId = extractYouTubeVideoId(url);

  if (!videoId) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
        {url}
      </a>
    );
  }

  // Create thumbnail URL
  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;

  // We need to ensure this component doesn't get wrapped in a <p> tag
  // by the markdown renderer, so we'll use a React Fragment at the top level
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {/* Use a span instead of div to avoid nesting issues with <p> tags */}
      <span className="block my-4 rounded-md overflow-hidden border border-border max-w-[320px] mx-auto">
        <span className="relative block">
          {/* YouTube Thumbnail */}
          <img
            src={thumbnailUrl}
            alt={`YouTube thumbnail for ${title}`}
            className="w-full h-auto max-h-[180px] max-w-[320px] mx-auto object-cover"
          />

          {/* Play Button Overlay */}
          <DialogTrigger asChild>
            <Button
              className="absolute inset-0 m-auto w-10 h-10 rounded-full bg-primary/90 hover:bg-primary text-primary-foreground flex items-center justify-center"
              aria-label="Play video"
            >
              <Play className="h-5 w-5" />
            </Button>
          </DialogTrigger>

          {/* Video Title and Link */}
          <span className="absolute bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm p-1.5 flex justify-between items-center">
            <span className="font-medium text-sm truncate">{title}</span>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline ml-2 flex-shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              Watch on YouTube
            </a>
          </span>
        </span>
      </span>

      <DialogContent className="p-0 border-none bg-transparent shadow-none max-w-[90vw] max-h-[90vh] w-auto" closeButton={false}>
        <DialogTitle>
          <VisuallyHidden>{title}</VisuallyHidden>
        </DialogTitle>
        <div className="relative flex items-center justify-center bg-black rounded-md overflow-hidden">
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 transition-colors z-10"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
          <iframe
            width="853"
            height="480"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
            title={title}
            style={{ border: 0 }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="max-w-[90vw] max-h-[90vh] w-full aspect-video"
          ></iframe>
        </div>
      </DialogContent>
    </Dialog>
  );
}
