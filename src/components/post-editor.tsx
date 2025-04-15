'use client';

import { useState, useRef, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import TextareaAutosize from 'react-textarea-autosize';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import MarkdownContent from '@/components/markdown-content';

interface PostEditorProps {
  onSubmit: (content: string) => Promise<void>;
  placeholder?: string;
  submitLabel?: string;
  initialContent?: string;
  isLoading?: boolean;
}

export default function PostEditor({
  onSubmit,
  placeholder = "What's on your mind?",
  submitLabel = "Post",
  initialContent = "",
  isLoading = false,
}: PostEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [isUploading, setIsUploading] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Handle file drop
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    await uploadAndInsertImage(acceptedFiles[0]);
  }, [content]);

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
      const formData = new FormData();
      formData.append('file', file);
      
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
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) return;
    
    try {
      await onSubmit(content);
      setContent('');
      setIsPreview(false);
    } catch (error) {
      console.error('Error submitting post:', error);
    }
  };

  return (
    <Card>
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
                className="w-full resize-none border-0 bg-transparent p-0 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
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
              >
                {isPreview ? 'Edit' : 'Preview'}
              </Button>
              
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => document.getElementById('file-upload')?.click()}
                disabled={isLoading || isUploading}
              >
                Upload Image
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
            </div>
            
            <Button
              type="submit"
              disabled={!content.trim() || isLoading || isUploading}
            >
              {isLoading ? 'Posting...' : submitLabel}
            </Button>
          </CardFooter>
        </div>
      </form>
    </Card>
  );
}
