'use client';

import { useState, useRef, useCallback } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/auth-context';
import { Camera } from '@mynaui/icons-react';

interface AvatarUploadProps {
  onAvatarChange?: (url: string) => void;
}

export default function AvatarUpload({ onAvatarChange }: AvatarUploadProps) {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Function to convert image to square and return as a File object
  const processImageToSquare = useCallback((file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      // Create an image element to load the file
      const img = new Image();
      img.onload = () => {
        // Determine the size of the square (use the smaller dimension)
        const size = Math.min(img.width, img.height);

        // Create a canvas element to draw the square image
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;

        // Calculate the position to crop from center
        const offsetX = (img.width - size) / 2;
        const offsetY = (img.height - size) / 2;

        // Draw the image on the canvas, cropping to a square
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        ctx.drawImage(img, offsetX, offsetY, size, size, 0, 0, size, size);

        // Convert the canvas to a blob
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Could not create image blob'));
            return;
          }

          // Create a new File object from the blob
          const squareFile = new File([blob], file.name, {
            type: file.type,
            lastModified: file.lastModified
          });

          resolve(squareFile);
        }, file.type);
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      // Load the image from the file
      img.src = URL.createObjectURL(file);
    });
  }, []);

  const handleUpload = useCallback(async (file: File) => {
    setIsUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/users/avatar', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload avatar');
      }

      const data = await response.json();

      // Call the onAvatarChange callback if provided
      if (onAvatarChange) {
        onAvatarChange(data.profileImage);
      }
    } catch (err) {
      console.error('Error uploading avatar:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload avatar');
    } finally {
      setIsUploading(false);
    }
  }, [onAvatarChange]);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.');
      return;
    }

    try {
      // Create a preview URL
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      setError('');

      // Process the image to make it square
      const squareFile = await processImageToSquare(file);

      // Upload the square file
      await handleUpload(squareFile);

      // Clean up the preview URL
      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      console.error('Error processing image:', err);
      setError(err instanceof Error ? err.message : 'Failed to process image');
    }
  }, [processImageToSquare, handleUpload]);

  const handleButtonClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative group">
        <Avatar className="h-24 w-24 border-2 border-primary/20">
          <AvatarImage
            src={previewUrl || user?.profileImage}
            alt={user?.displayName || user?.username || 'User'}
          />
          <AvatarFallback className="text-2xl">
            {user?.displayName?.[0] || user?.username?.[0] || '?'}
          </AvatarFallback>
        </Avatar>

        <button
          type="button"
          onClick={handleButtonClick}
          className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1.5 shadow-sm hover:bg-primary/90 transition-colors"
          disabled={isUploading}
        >
          <Camera className="w-4 h-4" />
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
        onChange={handleFileChange}
        disabled={isUploading}
      />

      <div className="text-center">
        <Label htmlFor="avatar" className="cursor-pointer text-sm text-muted-foreground">
          {isUploading ? 'Uploading...' : 'Click to change avatar'}
        </Label>

        {error && (
          <p className="text-sm text-red-500 mt-1">{error}</p>
        )}
      </div>
    </div>
  );
}
