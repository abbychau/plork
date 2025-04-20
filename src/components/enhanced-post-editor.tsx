'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import TextareaAutosize from 'react-textarea-autosize';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import MarkdownContent from '@/components/markdown-content';
import PortalEmojiPicker from '@/components/portal-emoji-picker';
import { useCompactMode } from '@/hooks/use-compact-mode';

// Import Lucide icons
import { Eye, Image, Save, X, Send, Edit } from 'lucide-react';

interface EnhancedPostEditorProps {
  // Common props
  initialContent?: string;
  placeholder?: string;
  isLoading?: boolean;
  compact?: boolean; // Optional override for compact display

  // Mode-specific props
  mode: 'create' | 'edit';

  // For create mode
  onCreateSubmit?: (content: string) => Promise<void>;
  submitLabel?: string;

  // For edit mode
  onEditSubmit?: (content: string) => Promise<void>;
  onCancel?: () => void;
}

export default function EnhancedPostEditor({
  initialContent = '',
  placeholder = "What's on your mind?",
  isLoading = false,
  compact, // No default value, will be determined by useCompactMode
  mode = 'create',
  onCreateSubmit,
  submitLabel = 'Post',
  onEditSubmit,
  onCancel,
}: EnhancedPostEditorProps) {
  // Determine if compact mode should be used based on screen width
  // If compact prop is provided, it will override the screen width detection
  const isCompact = useCompactMode(compact);
  const { toast } = useToast();
  const [content, setContent] = useState(initialContent);
  const [isUploading, setIsUploading] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // Handle emoji selection
  const handleEmojiClick = useCallback((emojiData: { emoji: string }) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const cursorPos = textarea.selectionStart;
      const textBefore = content.substring(0, cursorPos);
      const textAfter = content.substring(cursorPos);

      const newContent = `${textBefore}${emojiData.emoji}${textAfter}`;
      setContent(newContent);

      // Focus and set cursor position after the inserted emoji
      setTimeout(() => {
        textarea.focus();
        const newCursorPos = cursorPos + emojiData.emoji.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    } else {
      // Fallback if textarea ref is not available
      setContent((prev) => `${prev}${emojiData.emoji}`);
    }
  }, [content, setContent]);

  // Update content when initialContent changes (for edit mode)
  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  // Handle file drop
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    await uploadAndInsertImage(acceptedFiles[0]);
  }, []);

  // Setup dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/gif': [],
      'image/webp': [],
    },
    noClick: true,
    noKeyboard: true,
  });

  // Handle paste event to capture images
  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        e.preventDefault();
        const file = items[i].getAsFile();
        if (file) {
          await uploadAndInsertImage(file);
        }
        break;
      }
    }
  };

  // Upload image and insert into content
  const uploadAndInsertImage = async (file: File) => {
    setIsUploading(true);

    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', file);

      // Upload the image
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();

      // Insert image markdown at cursor position or at the end
      const textarea = textareaRef.current;
      if (textarea) {
        const cursorPos = textarea.selectionStart;
        const textBefore = content.substring(0, cursorPos);
        const textAfter = content.substring(cursorPos);

        const imageMarkdown = `![Image](${data.url})`;
        const newContent = `${textBefore}${imageMarkdown}${textAfter}`;

        setContent(newContent);

        // Focus and set cursor position after the inserted image markdown
        setTimeout(() => {
          textarea.focus();
          const newCursorPos = cursorPos + imageMarkdown.length;
          textarea.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
      } else {
        // Fallback if textarea ref is not available
        setContent((prev) => `${prev}\n![Image](${data.url})`);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Emoji handling moved to useEmojiPicker hook

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) return;

    try {
      if (mode === 'create' && onCreateSubmit) {
        await onCreateSubmit(content);
        setContent('');
        setIsPreview(false);
      } else if (mode === 'edit' && onEditSubmit) {
        await onEditSubmit(content);
      }
    } catch (error) {
      console.error('Error submitting post:', error);
    }
  };

  return (
    <Card className='pb-0'>
      <form onSubmit={handleSubmit}>
        <div {...getRootProps()} className="relative">
          <CardContent className={`p-4 ${isDragActive ? 'bg-muted/50' : ''}`}>
            {isDragActive && (
              <div className="absolute inset-0 bg-primary/10 border-2 border-dashed border-primary rounded-md flex items-center justify-center z-10">
                <p className="text-primary font-medium">Drop image here</p>
              </div>
            )}

            {isPreview ? (
              <div className="min-h-[100px] py-2">
                <MarkdownContent content={content} />
              </div>
            ) : (
              <TextareaAutosize
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onPaste={handlePaste}
                placeholder={placeholder}
                className="w-full resize-none border-0 bg-transparent p-0 outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                minRows={3}
                disabled={isLoading || isUploading}
              />
            )}

            <input {...getInputProps()} />

            {isUploading && (
              <div className="mt-2 text-sm text-muted-foreground">
                Uploading image...
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-between px-4 py-3 border-t">
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsPreview(!isPreview)}
                disabled={isLoading || isUploading}
                title={isPreview ? 'Edit' : 'Preview'}
              >
                {isPreview ? (
                  <>
                    {!isCompact ? <><Edit className="h-4 w-4" />Edit</> : <Edit className="h-4 w-4" />}
                  </>
                ) : (
                  <>
                    {!isCompact ? <><Eye className="h-4 w-4" />Preview</> : <Eye className="h-4 w-4" />}
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => document.getElementById('file-upload')?.click()}
                disabled={isLoading || isUploading}
                title="Upload Image"
              >
                {isCompact ? <Image className="h-4 w-4" aria-hidden="true" /> : <><Image className="h-4 w-4" aria-hidden="true" /> Upload Image</>}
              </Button>
              <input
                id="file-upload"
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    await uploadAndInsertImage(file);
                    e.target.value = '';
                  }
                }}
              />

              <PortalEmojiPicker
                onEmojiClick={handleEmojiClick}
                compact={isCompact}
                disabled={isLoading || isUploading}
              />
            </div>

            <div className="flex space-x-2">
              {mode === 'edit' && onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onCancel}
                  disabled={isLoading || isUploading}
                  title="Cancel"
                >
                  {isCompact ? <X className="h-4 w-4" /> : 'Cancel'}
                </Button>
              )}
              <Button
                type="submit"
                size="sm"
                disabled={isLoading || isUploading || !content.trim()}
              >
                {isLoading ? (
                  isCompact ? <span className="animate-pulse">...</span> : 'Submitting...'
                ) : (
                  mode === 'create' ? (
                    isCompact ? <Send className="h-4 w-4" /> : submitLabel
                  ) : (
                    isCompact ? <Save className="h-4 w-4" /> : 'Save'
                  )
                )}
              </Button>
            </div>
          </CardFooter>
        </div>
      </form>
    </Card>
  );
}
