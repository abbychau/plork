'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { VisuallyHidden } from '@/components/ui/visually-hidden';
import { Button } from '@/components/ui/button';
import { X, Play, ExternalLink, ClipboardCopy } from 'lucide-react';
import { extractYouTubeVideoId } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { copyToClipboard } from '@/lib/clipboard';

interface YouTubePreviewProps {
  url: string;
  title?: string;
}

export default function YouTubePreview({ url, title = 'YouTube Video' }: YouTubePreviewProps) {
  const [isOpen, setIsOpen] = useState(false);
  const videoId = extractYouTubeVideoId(url);
  const { toast } = useToast();

  const handleCopyUrl = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const success = await copyToClipboard(url);

    if (success) {
      toast({
        title: "URL copied",
        description: "YouTube URL copied to clipboard",
      });
    } else {
      toast({
        title: "Failed to copy",
        description: "Could not copy URL to clipboard",
        variant: "destructive"
      });
    }
  };

  if (!videoId) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
        {url}
      </a>
    );
  }

  // Create thumbnail URL
  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <span className="relative block my-4 rounded-md overflow-hidden border border-border max-w-[50%] mx-auto cursor-pointer">
          <span className="relative block h-[150px]">
            {/* YouTube Thumbnail */}
            <img
              src={thumbnailUrl}
              alt={`YouTube thumbnail for ${title}`}
              className="w-full h-auto mx-auto object-cover"
            />

            {/* Play Button Overlay */}
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="w-10 h-10 rounded-full bg-primary/90 hover:bg-primary text-primary-foreground flex items-center justify-center">
                <Play className="h-5 w-5" />
              </span>
            </span>

            {/* Video Title and Link */}
            <span className="absolute bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm p-1.5 flex justify-between items-center">
              <span className="font-medium text-sm truncate">{title}</span>
              <span className="flex items-center gap-1 ml-2 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-foreground hover:text-primary"
                  onClick={handleCopyUrl}
                  title="Copy URL"
                >
                  <ClipboardCopy className="h-3.5 w-3.5" />
                  <span className="sr-only">Copy URL</span>
                </Button>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center h-6 w-6 text-foreground hover:text-primary"
                  onClick={(e) => e.stopPropagation()}
                  title="Watch on YouTube"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span className="sr-only">Watch on YouTube</span>
                </a>
              </span>
            </span>
          </span>
        </span>
      </DialogTrigger>

      <DialogContent className="p-0 border-none bg-transparent shadow-none max-w-[90vw] max-h-[90vh] w-auto youtube-preview-dialog" closeButton={false}>
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
