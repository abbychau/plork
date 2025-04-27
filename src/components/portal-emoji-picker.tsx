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
      // Check if there's enough space above the button
      const spaceAbove = rect.top;
      const spaceBelow = window.innerHeight - rect.bottom;

      // Position the picker above or below the button based on available space
      if (spaceAbove >= 350 + 10) { // If there's enough space above
        setPosition({
          top: rect.top - 350 - 10, // Height of picker + offset
          left: rect.left
        });
      } else if (spaceBelow >= 350 + 10) { // If there's enough space below
        setPosition({
          top: rect.bottom + 10, // Position below with offset
          left: rect.left
        });
      } else { // Not enough space above or below, center in viewport
        setPosition({
          top: Math.max(10, (window.innerHeight - 350) / 2),
          left: Math.max(10, (window.innerWidth - 320) / 2)
        });
      }
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
      document.addEventListener('mousedown', handleClickOutside, { capture: true });
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside, { capture: true });
    };
  }, [isOpen]);

  // Handle emoji selection
  const handleEmojiSelect = (emojiData: EmojiClickData) => {
    onEmojiClick(emojiData);
    setIsOpen(false);
  };

  // Prevent event propagation for the emoji picker
  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
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
            zIndex: 100000, // Ensure this is higher than any other z-index in the app
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            borderRadius: '8px',
            overflow: 'hidden'
          }}
          onClick={(e) => e.stopPropagation()} // Prevent clicks from reaching the modal
          onMouseDown={handleMouseDown} // Prevent mousedown events from reaching the modal
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
