'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { SmilePlus, Upload, Loader2, X, Search } from 'lucide-react';
import { useCompactMode } from '@/hooks/use-compact-mode';

export interface CustomEmoji {
  id: string;
  name: string; // User's custom name
  imageUrl: string;
  originalName: string; // Original name from creator
  creatorUsername: string; // Username of the creator
}

interface CustomEmojiPickerProps {
  onEmojiSelect: (emojiName: string) => void; // Callback with the :name: format
  compact?: boolean;
  disabled?: boolean;
  onEmojiUploaded?: () => void; // Add callback for when emoji is uploaded
}

export default function CustomEmojiPicker({
  onEmojiSelect,
  compact,
  disabled = false,
  onEmojiUploaded,
}: CustomEmojiPickerProps) {
  const isCompact = useCompactMode(compact);
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  const [emojis, setEmojis] = useState<CustomEmoji[]>([]);
  const [allEmojis, setAllEmojis] = useState<CustomEmoji[]>([]);
  const [isLoadingEmojis, setIsLoadingEmojis] = useState(false);
  const [emojiError, setEmojiError] = useState<string | null>(null);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadName, setUploadName] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const updatePosition = useCallback(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const pickerHeight = 400; // Approximate height
      const pickerWidth = 320;
      const spaceAbove = rect.top;
      const spaceBelow = window.innerHeight - rect.bottom;

      let top = rect.bottom + 10;
      if (spaceBelow < pickerHeight + 10 && spaceAbove > spaceBelow) {
        top = rect.top - pickerHeight - 10;
      }

      setPosition({
        top: Math.max(10, Math.min(top, window.innerHeight - pickerHeight - 10)),
        left: Math.max(10, Math.min(rect.left, window.innerWidth - pickerWidth - 10)),
      });
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside, { capture: true });
    } else {
      document.removeEventListener('mousedown', handleClickOutside, { capture: true });
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside, { capture: true });
    };
  }, [isOpen]);

  // --- Fetch User Emojis ---
  const fetchEmojis = useCallback(async () => {
    if (!isOpen) return;
    setIsLoadingEmojis(true);
    setEmojiError(null);
    try {
      const response = await fetch('/api/emojis/collection');
      if (!response.ok) {
        throw new Error('Failed to fetch emojis');
      }
      const data: CustomEmoji[] = await response.json();
      setEmojis(data);
    } catch (err) {
      console.error('Error fetching emojis:', err);
      setEmojiError(err instanceof Error ? err.message : 'Could not load emojis.');
    } finally {
      setIsLoadingEmojis(false);
    }
  }, [isOpen]);

  // Add fetch all emojis
  const fetchAllEmojis = useCallback(async () => {
    if (!isOpen) return;
    try {
      const response = await fetch('/api/emojis/all');
      if (!response.ok) {
        throw new Error('Failed to fetch all emojis');
      }
      const data: CustomEmoji[] = await response.json();
      setAllEmojis(data);
    } catch (err) {
      console.error('Error fetching all emojis:', err);
      setEmojiError(err instanceof Error ? err.message : 'Could not load emojis.');
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      fetchEmojis();
      fetchAllEmojis();
    }
  }, [isOpen, fetchEmojis, fetchAllEmojis]);

  // Filter emojis based on search query
  const filteredAllEmojis = allEmojis.filter(emoji => 
    emoji.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emoji.originalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emoji.creatorUsername.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --- Emoji Selection ---
  const handleSelect = (emoji: CustomEmoji) => {
    onEmojiSelect(`:${emoji.name}:`);
    setIsOpen(false);
  };

  // --- Emoji Upload ---
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setUploadFile(event.target.files[0]);
      setUploadError(null);
    }
  };

  const handleUploadSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!uploadFile || !uploadName.trim()) {
      setUploadError('Please provide both a name and a file.');
      return;
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(uploadName)) {
        setUploadError('Name can only contain letters, numbers, -, _');
        return;
    }

    setIsUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('name', uploadName.trim());

    try {
      const response = await fetch('/api/emojis/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      toast({ title: 'Emoji Uploaded!', description: `:${result.name}: added.` });
      setUploadName('');
      setUploadFile(null);
      if (fileInputRef.current) fileInputRef.current.value = ''; // Reset file input
      fetchEmojis(); // Refresh emoji list
      onEmojiUploaded?.(); // Notify parent component
    } catch (err) {
      console.error('Upload error:', err);
      setUploadError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsUploading(false);
    }
  };

  // --- Toggle Picker ---
  const togglePicker = () => {
    if (!isOpen) {
      updatePosition();
    }
    setIsOpen(!isOpen);
  };

  // Add delete handler
  const handleDelete = async (emoji: CustomEmoji, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent emoji selection
    if (!confirm(`Are you sure you want to remove :${emoji.name}: from your collection?`)) {
      return;
    }

    setIsDeleting(emoji.id);
    try {
      const response = await fetch(`/api/emojis/collection/delete?customEmojiId=${emoji.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete emoji');
      }

      toast({ title: 'Emoji Removed', description: `:${emoji.name}: removed from your collection.` });
      fetchEmojis(); // Refresh the list
    } catch (err) {
      console.error('Error deleting emoji:', err);
      toast({ 
        title: 'Error', 
        description: err instanceof Error ? err.message : 'Failed to remove emoji',
        variant: 'destructive'
      });
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={disabled}
        onClick={togglePicker}
        title="Add custom emoji"
        ref={buttonRef}
      >
        <SmilePlus className="w-4 h-4" />
        {!isCompact && <span className="ml-1">Emoji</span>}
      </Button>

      {isOpen && typeof document !== 'undefined' && createPortal(
        <div
          ref={pickerRef}
          className="fixed bg-background border rounded-lg shadow-lg z-[100000] w-[320px] h-[400px] flex flex-col"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
          }}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <Tabs defaultValue="picker" className="flex flex-col flex-grow">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="picker">My Emojis</TabsTrigger>
              <TabsTrigger value="browse">Browse All</TabsTrigger>
              <TabsTrigger value="upload">Upload</TabsTrigger>
            </TabsList>

            {/* My Emojis Tab */}
            <TabsContent value="picker" className="flex-grow overflow-hidden p-2">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium">My Collection</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className={isDeleteMode ? "text-destructive" : ""}
                  onClick={() => setIsDeleteMode(!isDeleteMode)}
                >
                  {isDeleteMode ? "Done" : "Delete Mode"}
                </Button>
              </div>
              {isLoadingEmojis && <div className="flex justify-center items-center h-full"><Loader2 className="h-6 w-6 animate-spin" /></div>}
              {emojiError && <div className="text-destructive text-center p-4">{emojiError}</div>}
              {!isLoadingEmojis && !emojiError && (
                <ScrollArea className="h-full">
                  {emojis.length === 0 ? (
                    <div className="text-muted-foreground text-center p-4">No custom emojis yet. Upload one!</div>
                  ) : (
                    <div className="grid grid-cols-8 gap-1 p-1">
                      {emojis.map((emoji) => (
                        <div key={emoji.id} className="relative group">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-8 h-8 p-0.5 hover:bg-accent"
                            onClick={() => handleSelect(emoji)}
                            title={`:${emoji.name}: (Original: ${emoji.originalName})`}
                          >
                            <img src={emoji.imageUrl} alt={emoji.name} className="w-full h-full object-contain" />
                          </Button>
                          {isDeleteMode && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute top-0 right-0 w-4 h-4 p-0 opacity-0 group-hover:opacity-100 hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground"
                              onClick={(e) => handleDelete(emoji, e)}
                              disabled={isDeleting === emoji.id}
                              title="Remove from collection"
                            >
                              {isDeleting === emoji.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <X className="h-3 w-3" />
                              )}
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              )}
            </TabsContent>

            {/* Browse All Tab */}
            <TabsContent value="browse" className="flex-grow overflow-hidden p-2">
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search emojis..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <ScrollArea className="h-[calc(100%-2.5rem)]">
                  {filteredAllEmojis.length === 0 ? (
                    <div className="text-muted-foreground text-center p-4">No emojis found</div>
                  ) : (
                    <div className="grid grid-cols-8 gap-1 p-1">
                      {filteredAllEmojis.map((emoji) => (
                        <Button
                          key={emoji.id}
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8 p-0.5 hover:bg-accent"
                          onClick={() => handleSelect(emoji)}
                          title={`:${emoji.name}: (Created by @${emoji.creatorUsername})`}
                        >
                          <img src={emoji.imageUrl} alt={emoji.name} className="w-full h-full object-contain" />
                        </Button>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </TabsContent>

            {/* Upload Tab */}
            <TabsContent value="upload" className="flex-grow overflow-y-auto p-4">
              <form onSubmit={handleUploadSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="emojiName">Emoji Name (e.g., my_cat)</Label>
                  <Input
                    id="emojiName"
                    type="text"
                    value={uploadName}
                    onChange={(e) => setUploadName(e.target.value)}
                    placeholder="letters, numbers, -, _"
                    pattern="^[a-zA-Z0-9_-]+$"
                    required
                    disabled={isUploading}
                    className="mt-1"
                  />
                   <p className="text-xs text-muted-foreground mt-1">This will be used like :your_name:</p>
                </div>
                <div>
                  <Label htmlFor="emojiFile">Image File (PNG, JPG, GIF, WEBP)</Label>
                  <Input
                    id="emojiFile"
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/png, image/jpeg, image/gif, image/webp"
                    required
                    disabled={isUploading}
                    className="mt-1"
                  />
                </div>
                {uploadError && <p className="text-sm text-destructive">{uploadError}</p>}
                <Button type="submit" disabled={isUploading || !uploadFile || !uploadName.trim()} className="w-full">
                  {isUploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                  {isUploading ? 'Uploading...' : 'Upload Emoji'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>,
        document.body
      )}
    </>
  );
}