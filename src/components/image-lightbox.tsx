'use client';

import { useState } from 'react';
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <img
          src={src}
          alt={alt}
          className={`cursor-pointer max-w-full max-h-[300px] rounded-md my-4 ${className}`}
          loading="lazy"
        />
      </DialogTrigger>
      <DialogContent className="p-0 border-none bg-transparent shadow-none max-w-[90vw] max-h-[90vh] w-auto" closeButton={false}>
        <DialogTitle>
          <VisuallyHidden>{alt || 'Image'}</VisuallyHidden>
        </DialogTitle>
        <div className="relative flex items-center justify-center">
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 transition-colors z-10"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
          <img
            src={src}
            alt={alt}
            className="max-w-[90vw] max-h-[90vh] object-contain"
            loading="lazy"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
