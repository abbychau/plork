'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import TextareaAutosize from 'react-textarea-autosize';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import MarkdownContent from '@/components/markdown-content';
import CustomEmojiPicker from '@/components/custom-emoji-picker'; // Changed import
import MentionAutocomplete from '@/components/mention-autocomplete';
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

  // New prop for emoji upload callback
  onEmojiUploaded?: () => void;
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
  onEmojiUploaded,
}: EnhancedPostEditorProps) {
  // Determine if compact mode should be used based on screen width
  // If compact prop is provided, it will override the screen width detection
  const isCompact = useCompactMode(compact);
  const { toast } = useToast();
  const [content, setContent] = useState(initialContent);
  const [isUploading, setIsUploading] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Handle emoji selection (updated for CustomEmojiPicker)
  const handleEmojiSelect = useCallback((emojiName: string) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const cursorPos = textarea.selectionStart;
      const textBefore = content.substring(0, cursorPos);
      const textAfter = content.substring(cursorPos);

      const newContent = `${textBefore}${emojiName}${textAfter}`;
      setContent(newContent);

      // Focus and set cursor position after the inserted emoji
      setTimeout(() => {
        textarea.focus();
        const newCursorPos = cursorPos + emojiName.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    } else {
      // Fallback if textarea ref is not available
      setContent((prev) => `${prev}${emojiName}`);
    }
  }, [content, setContent]);

  // Handle mention selection
  const handleMention = useCallback((username: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const cursorPos = textarea.selectionStart;
    const textBefore = content.substring(0, cursorPos);
    const textAfter = content.substring(cursorPos);

    // Find the last @ symbol before cursor
    const lastAtIndex = textBefore.lastIndexOf('@');
    if (lastAtIndex === -1) return;

    // Replace from @ to cursor with @username
    const beforeMention = content.substring(0, lastAtIndex);
    const mention = `@${username} `;
    const newContent = `${beforeMention}${mention}${textAfter}`;

    setContent(newContent);

    // Focus and set cursor position after the inserted mention
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = lastAtIndex + mention.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  }, [content]);

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
    <Card className='py-0'>
      <form onSubmit={handleSubmit}>
        <div {...getRootProps()} className="relative">
          <CardContent className={`p-4 ${isDragActive ? 'bg-muted/50' : ''} w-full`}>
            {isDragActive && (
              <div className="absolute inset-0 bg-primary/10 border-2 border-dashed border-primary rounded-md flex items-center justify-center z-10">
                <p className="text-primary font-medium">Drop image here</p>
              </div>
            )}

            {isPreview ? (
              <div className="min-h-[100px] py-2 max-h-[600px] h-full overflow-y-auto">
                <MarkdownContent content={content} />
              </div>
            ) : (
              <TextareaAutosize
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onPaste={handlePaste}
                onKeyDown={(e) => {
                  // Submit on CTRL+ENTER
                  if (e.ctrlKey && e.key === 'Enter') {
                    e.preventDefault();
                    if (content.trim() && !isLoading && !isUploading) {
                      handleSubmit(e);
                    }
                  }
                }}
                placeholder={placeholder}
                className="w-full resize-none border-0 bg-transparent p-0 outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 max-h-[600px] font-mono text-xs mobile-textarea"
                style={{ fontSize: isCompact ? '16px' : '14px', width: '100%' }}
                minRows={3}
                disabled={isLoading || isUploading}
                maxRows={isCompact ? 6 : 100} // Limit rows on mobile to prevent excessive height

              />
            )}

            <input {...getInputProps()} />

            {isUploading && (
              <div className="mt-2 text-sm text-muted-foreground">
                Uploading image...
              </div>
            )}

            {/* Mention Autocomplete */}
            <MentionAutocomplete
              textareaRef={textareaRef}
              content={content}
              onMention={handleMention}
            />
          </CardContent>

          <CardFooter className="flex flex-col sm:flex-row sm:justify-between px-4 pb-3 gap-2 card-footer w-full">
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsPreview(!isPreview)}
                disabled={isLoading || isUploading}
                title={isPreview ? 'Edit' : 'Preview'}
                className="p-2"
              >
                {isPreview ? <Edit className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => document.getElementById('file-upload')?.click()}
                disabled={isLoading || isUploading}
                title="Upload Image"
                className="p-2"
              >
                <Image className="h-4 w-4" aria-hidden="true" />
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

              <CustomEmojiPicker
                onEmojiSelect={handleEmojiSelect}
                compact={true}
                disabled={isLoading || isUploading}
                onEmojiUploaded={onEmojiUploaded}
              />

              <div className="flex-grow"></div>

              {mode === 'edit' && onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onCancel}
                  disabled={isLoading || isUploading}
                  title="Cancel"
                  className="p-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}

              <Button
                type="submit"
                size="sm"
                disabled={isLoading || isUploading || !content.trim()}
                className="ml-auto"
              >
                {isLoading ? (
                  <span className="animate-pulse">...</span>
                ) : (
                  mode === 'create' ? (
                    <Send className="h-4 w-4" />
                  ) : (
                    <Save className="h-4 w-4" />
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
