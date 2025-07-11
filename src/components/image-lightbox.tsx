'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog';
import { VisuallyHidden } from '@/components/ui/visually-hidden';
import { X } from 'lucide-react';

interface ImageLightboxProps {
  src: string;
  alt: string;
  className?: string;
}

export default function ImageLightbox({ src, alt, className = '' }: ImageLightboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isExternalImage = src.startsWith('http://') || src.startsWith('https://');

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {isExternalImage ? (
          <img
            src={src}
            alt={alt}
            className={`cursor-pointer max-w-[50%] max-h-[300px] rounded-md my-4 ${className}`}
            style={{ objectFit: 'contain' }}
            crossOrigin="anonymous"
          />
        ) : (
          <Image
            src={src}
            alt={alt}
            width={600}
            height={300}
            className={`cursor-pointer max-w-[50%] max-h-[300px] rounded-md my-4 ${className}`}
            style={{ objectFit: 'contain' }}
            priority={false}
          />
        )}
      </DialogTrigger>
      <DialogContent className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] z-50 p-0 border-none bg-transparent shadow-none max-w-[95vw] max-h-[95vh] w-auto flex items-center justify-center image-lightbox-dialog" closeButton={false}>
        <DialogTitle>
          <VisuallyHidden>{alt || 'Image'}</VisuallyHidden>
        </DialogTitle>
        <div className="relative">
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 transition-colors z-10"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
          {isExternalImage ? (
            <img
              src={src}
              alt={alt}
              className="max-w-[90vw] max-h-[90vh] object-contain"
              crossOrigin="anonymous"
            />
          ) : (
            <Image
              src={src}
              alt={alt}
              width={1200}
              height={800}
              className="max-w-[90vw] max-h-[90vh] object-contain"
              priority={false}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
