'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { Button } from '@/components/ui/button';
import { SmilePlus } from 'lucide-react';
import { useCompactMode } from '@/hooks/use-compact-mode';

interface PortalEmojiPickerProps {
  onEmojiClick: (emojiData: EmojiClickData) => void;
  compact?: boolean;
  disabled?: boolean;
}

export default function PortalEmojiPicker({
  onEmojiClick,
  compact, // No default value, will be determined by useCompactMode
  disabled = false
}: PortalEmojiPickerProps) {
  // Determine if compact mode should be used based on screen width
  // If compact prop is provided, it will override the screen width detection
  const isCompact = useCompactMode(compact);

  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Calculate position when button is clicked
  const updatePosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.top - 350 - 10, // Height of picker + offset
        left: rect.left
      });
    }
  };

  // Handle click outside to close the picker
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
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle emoji selection
  const handleEmojiSelect = (emojiData: EmojiClickData) => {
    onEmojiClick(emojiData);
    setIsOpen(false);
  };

  // Toggle picker
  const togglePicker = () => {
    if (!isOpen) {
      updatePosition();
    }
    setIsOpen(!isOpen);
  };

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={disabled}
        onClick={togglePicker}
        title="Add emoji"
        ref={buttonRef}
      >
        <SmilePlus className="w-4 h-4" />
        {!isCompact && <span className="ml-1">Emoji</span>}
      </Button>

      {isOpen && typeof document !== 'undefined' && createPortal(
        <div
          ref={pickerRef}
          className="fixed emoji-picker-portal"
          style={{
            top: `${Math.max(0, position.top)}px`,
            left: `${position.left}px`,
            zIndex: 9999,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            borderRadius: '8px',
            overflow: 'hidden'
          }}
        >
          <EmojiPicker
            onEmojiClick={handleEmojiSelect}
            width="320px"
            height="350px"
            lazyLoadEmojis={true}
          />
        </div>,
        document.body
      )}
    </>
  );
}
