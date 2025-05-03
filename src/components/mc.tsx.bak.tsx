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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Loader2 } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface MarkdownContentProps {
  content: string;
  className?: string;
 userEmojis?: CustomEmoji[]; // Add prop for user's custom emojis
}

export default function MarkdownContent({ content, className = '', userEmojis = [] }: MarkdownContentProps) {
 const { toast } = useToast();
 const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
 const [selectedEmojiToAdd, setSelectedEmojiToAdd] = useState<CustomEmoji | null>(null);
 const [newEmojiName, setNewEmojiName] = useState('');
 const [isAddingEmoji, setIsAddingEmoji] = useState(false);
 const [addEmojiError, setAddEmojiError] = useState<string | null>(null);

 const handleAddEmojiClick = (emoji: CustomEmoji) => {
   // Find the emoji in the user's collection based on imageUrl (or originalName/id if needed)
   // For simplicity, we assume the passed emoji object has the necessary ID.
   setSelectedEmojiToAdd(emoji);
   setNewEmojiName(''); // Reset name input
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
     // Optionally: Refresh user emoji list if needed elsewhere
   } catch (err) {
     console.error('Error adding emoji:', err);
     setAddEmojiError(err instanceof Error ? err.message : 'An unknown error occurred.');
   } finally {
     setIsAddingEmoji(false);
   }
 };

 // Create a map for quick lookup
 const emojiMap = new Map(userEmojis.map(e => [`:${e.name}:`, e]));
 
  return (
    <div className={`prose dark:prose-invert max-w-none overflow-x-hidden ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Override default components for custom styling
          a: ({ node, ...props }) => {
            const href = props.href || '';

            // Check if this is a YouTube link
            if (isYouTubeLink(href)) {
              // For YouTube links, we need to ensure we don't create invalid HTML
              // by having a div inside a p tag. We'll handle this by using a special
              // component that uses spans instead of divs.
              return (
                <YouTubePreview
                  url={href}
                  title={props.children?.toString() || 'YouTube Video'}
                />
              );
            }

            // Regular link
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
            
           console.log(props.src)
           // Check if this image is a custom emoji rendered by our logic below
           if (props.className?.includes('custom-emoji-image')) {
             // Find the emoji data based on src or alt
             const emojiData = userEmojis.find(e => e.imageUrl === props.src);
             if (emojiData) {
               return (
                 <Button
                   variant="ghost"
                   size="icon"
                   className="inline-block w-6 h-6 p-0 m-0 align-text-bottom hover:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                   title={`Add :${emojiData.originalName}: to your collection?`}
                   onClick={() => handleAddEmojiClick(emojiData)}
                 >
                   <img
                     {...props}
                     className='custom-emoji-image w-full h-full object-contain align-text-bottom'
                   />
                 </Button>
               );
             }
           }
           // Regular image handling (potentially with lightbox)
            const src = typeof props.src === 'string' ? props.src : '';
            return (
              <img
                src={src}
                alt={props.alt || 'Image'}
                className='inline-block'
              />
            );
          },
          p: ({ node, children, ...props }) => {
            // Get the text content from children
            // Ensure children is an array before using map
            const childrenArray = Array.isArray(children) ? children : [children];

            // Check if this paragraph contains a YouTube component
            // If so, we need to handle it specially to avoid invalid HTML nesting
            const hasYouTubeComponent = childrenArray.some(child =>
              child && typeof child === 'object' &&
              child.type && child.type.name === 'YouTubePreview'
            );

            if (hasYouTubeComponent) {
              // If there's a YouTube component, render without wrapping in a p tag
              // to avoid invalid HTML nesting
              return <>{children}</>;
            }

            const textContent = childrenArray
              .map(child => {
                // Handle potential custom emoji components within the paragraph
                if (child && typeof child === 'object' && 'props' in child && child.props.className === 'custom-emoji-image') {
                  return child.props.alt; // Use the alt text (e.g., :emoji_name:)
                }
                if (typeof child === 'string') return child;
                if (child?.props?.children) {
                  return typeof child.props.children === 'string'
                    ? child.props.children
                    : '';
                }
                return '';
              })
              .filter(child => child !== null && child !== undefined) // Filter out null/undefined
              .join('');

            // Split text by potential emoji codes and process segments
            const segments = textContent.split(/(:[a-zA-Z0-9_-]+:)/g).filter(Boolean);
            const processedChildren = segments.map((segment, index) => {
              if (emojiMap.has(segment)) {
                const emoji = emojiMap.get(segment)!;
                return (
                  <img
                    key={`${emoji.id}-${index}`}
                    src={emoji.imageUrl}
                    alt={segment} // Store the :name: here
                    title={`:${emoji.name}: (Original: ${emoji.originalName})`}
                    className="custom-emoji-image inline-block w-5 h-5 mx-px align-text-bottom object-contain"
                  />
                );
              }
              // Process hashtags within non-emoji segments
              if (segment.includes('#')) {
                return <HashtagText key={`hashtag-${index}`} text={segment} />;
              }
              return segment; // Regular text segment
            });

            // Render the paragraph with processed children
            return (
              <p {...props} className="my-2">
                {processedChildren}
              </p>
            );
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
         </DialogHeader>
         {selectedEmojiToAdd && (
           <div className="flex items-center space-x-4 my-4">
             <img src={selectedEmojiToAdd.imageUrl} alt={selectedEmojiToAdd.originalName} className="w-10 h-10 object-contain border rounded" />
             <div>
               <p>Original Name: <strong>:{selectedEmojiToAdd.originalName}:</strong></p>
               <p className="text-sm text-muted-foreground">Created by: [Creator Info - Placeholder]</p> {/* TODO: Add creator info if available */}
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
