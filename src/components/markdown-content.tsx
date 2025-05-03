'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import HashtagText from './hashtag-text';
import ImageLightbox from './image-lightbox';
import YouTubePreview from './youtube-preview';
import { isYouTubeLink } from '@/lib/utils';
import type { CustomEmoji } from '@/components/custom-emoji-picker';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Loader2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import React from 'react';

interface MarkdownContentProps {
  content: string;
  className?: string;
  userEmojis?: CustomEmoji[];
}

export default function MarkdownContent({ content, className = '', userEmojis = [] }: MarkdownContentProps) {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedEmojiToAdd, setSelectedEmojiToAdd] = useState<CustomEmoji | null>(null);
  const [newEmojiName, setNewEmojiName] = useState('');
  const [isAddingEmoji, setIsAddingEmoji] = useState(false);
  const [addEmojiError, setAddEmojiError] = useState<string | null>(null);

  const emojiMap = new Map(userEmojis.map(e => [`:${e.name}:`, e]));

  const handleAddEmojiClick = (emoji: CustomEmoji) => {
    setSelectedEmojiToAdd(emoji);
    setNewEmojiName('');
    setAddEmojiError(null);
    setIsAddDialogOpen(true);
  };

  const handleAddEmojiConfirm = async () => {
    if (!selectedEmojiToAdd || !newEmojiName.trim()) {
      setAddEmojiError('Please enter a name.');
      return;
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(newEmojiName)) {
      setAddEmojiError('Name can only contain letters, numbers, -, _');
      return;
    }

    setIsAddingEmoji(true);
    setAddEmojiError(null);

    try {
      const response = await fetch('/api/emojis/collection/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customEmojiId: selectedEmojiToAdd.id, name: newEmojiName.trim() }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to add emoji');
      }

      toast({ title: 'Emoji Added!', description: `:${result.name}: added to your collection.` });
      setIsAddDialogOpen(false);
      setSelectedEmojiToAdd(null);
    } catch (err) {
      console.error('Error adding emoji:', err);
      setAddEmojiError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsAddingEmoji(false);
    }
  };

  return (
    <div className={`prose dark:prose-invert max-w-none overflow-x-hidden ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ node, ...props }) => {
            const href = props.href || '';
            if (isYouTubeLink(href)) {
              return (
                <YouTubePreview
                  url={href}
                  title={props.children?.toString() || 'YouTube Video'}
                />
              );
            }
            return (
              <a
                {...props}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              />
            );
          },
          img: ({ node, ...props }) => {
            const src = typeof props.src === 'string' ? props.src : '';
            const alt = props.alt || 'Image';

            // Check if this is a custom emoji
            if (props.className?.includes('custom-emoji-image')) {
              return (
                <Button
                  variant="ghost"
                  size="icon"
                  className="inline-block w-6 h-6 p-0 m-0 align-text-bottom hover:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                  title={`Add ${alt} to your collection?`}
                  onClick={() => {
                    const emoji = userEmojis.find(e => `:${e.name}:` === alt);
                    if (emoji) handleAddEmojiClick(emoji);
                  }}
                >
                  <img
                    {...props}
                    className='custom-emoji-image w-full h-full object-contain align-text-bottom'
                  />
                </Button>
              );
            }

            // Regular image with lightbox
            return (
              <ImageLightbox
                src={src}
                alt={alt}
                className="inline-block w-auto"
              />
            );
          },
          p: ({ node, children, ...props }) => {
            // Check if any of the children is a YouTubePreview component
            const hasYouTubePreview = React.Children.toArray(children).some(
              child => React.isValidElement(child) && child.type === YouTubePreview
            );

            // If there's a YouTube preview, render without p tag wrapper
            if (hasYouTubePreview) {
              return <>{children}</>;
            }

            // If children is a simple string, process it for emojis and hashtags
            if (typeof children === 'string') {
              // Check for hashtags first
              if (children.includes('#')) {
                return (
                  <p {...props} className="my-2">
                    <HashtagText text={children} />
                  </p>
                );
              }

              // Process emojis
              const segments = children.split(/(:[a-zA-Z0-9_-]+:)/g).filter(Boolean);
              const processedChildren = segments.map((segment, index) => {
                if (emojiMap.has(segment)) {
                  const emoji = emojiMap.get(segment)!;
                  return (
                    <Button
                      key={`${emoji.id}-${index}`}
                      variant="ghost"
                      size="icon"
                      className="inline-block w-10 h-10 p-0 m-0 align-text-bottom hover:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                      title={`Add :${emoji.name}: to your collection?`}
                      onClick={() => handleAddEmojiClick(emoji)}
                    >
                      <img
                        src={emoji.imageUrl}
                        alt={segment}
                        title={`:${emoji.name}: (Original: ${emoji.originalName})`}
                        className="custom-emoji-image w-full h-full object-contain align-text-bottom cursor-pointer"
                      />
                    </Button>
                  );
                }
                return segment;
              });

              return (
                <p {...props} className="my-2">
                  {processedChildren}
                </p>
              );
            }

            // For other non-string children, render with p tag
            return <p {...props} className="my-2">{children}</p>;
          },
          code: ({ node, ...props }: any) => {
            const isInline = props.inline || true;
            return (
              isInline ?
                <code {...props} className="bg-muted p-1 py-0.5 rounded text-sm break-all" /> :
                <code {...props} className="block bg-muted p-4 rounded-md overflow-x-auto text-sm break-all max-w-1" />
            );
          },
          pre: ({ node, ...props }) => {
            return <pre {...props} className="bg-muted p-1 m-1 rounded-md overflow-x-auto text-sm break-all max-w-prose" />;
          },
        }}
      >
        {content}
      </ReactMarkdown>

      {/* Add Emoji Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Emoji to Collection</DialogTitle>
            <DialogDescription>
              Add a custom emoji to your personal collection. You can give it a unique name that you'll use to reference it.
            </DialogDescription>
          </DialogHeader>
          {selectedEmojiToAdd && (
            <div className="flex items-center space-x-4 my-4">
              <img src={selectedEmojiToAdd.imageUrl} alt={selectedEmojiToAdd.originalName} className="w-10 h-10 object-contain border rounded" />
              <div>
                <p>Original Name: <strong>:{selectedEmojiToAdd.originalName}:</strong></p>
                <p className="text-sm text-muted-foreground">Created by: @{selectedEmojiToAdd.creatorUsername}</p>
              </div>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="newEmojiName">Your Name for this Emoji:</Label>
            <Input
              id="newEmojiName"
              value={newEmojiName}
              onChange={(e) => setNewEmojiName(e.target.value)}
              placeholder="e.g., my_awesome_emoji"
              pattern="^[a-zA-Z0-9_-]+$"
              disabled={isAddingEmoji}
            />
            <p className="text-xs text-muted-foreground">This will be used like :{newEmojiName || 'your_name'}:</p>
            {addEmojiError && <p className="text-sm text-destructive">{addEmojiError}</p>}
          </div>
          <DialogFooter>
            <DialogPrimitive.Close asChild>
              <Button variant="outline" disabled={isAddingEmoji}>Cancel</Button>
            </DialogPrimitive.Close>
            <Button onClick={handleAddEmojiConfirm} disabled={isAddingEmoji || !newEmojiName.trim()}>
              {isAddingEmoji ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {isAddingEmoji ? 'Adding...' : 'Add to Collection'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
