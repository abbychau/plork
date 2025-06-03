'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface User {
  id: string;
  username: string;
  displayName?: string;
  profileImage?: string;
}

interface MentionAutocompleteProps {
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  content: string;
  onMention: (username: string) => void;
}

export default function MentionAutocomplete({
  textareaRef,
  content,
  onMention,
}: MentionAutocompleteProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const autocompleteRef = useRef<HTMLDivElement>(null);

  // Extract current mention query and position
  const mentionData = useMemo(() => {
    const textarea = textareaRef.current;
    if (!textarea) return null;

    const cursorPosition = textarea.selectionStart;
    const textBefore = content.substring(0, cursorPosition);
    
    // Find the last @ symbol before cursor
    const lastAtIndex = textBefore.lastIndexOf('@');
    if (lastAtIndex === -1) return null; // -1 means no @ found

    // Check if there's a space or newline between @ and cursor (which would end the mention)
    const textAfterAt = textBefore.substring(lastAtIndex + 1);
    if (textAfterAt.includes(' ') || textAfterAt.includes('\n')) return null;

    // Check if @ is at start of line or preceded by whitespace
    const charBeforeAt = lastAtIndex > 0 ? textBefore[lastAtIndex - 1] : ' ';
    if (charBeforeAt !== ' ' && charBeforeAt !== '\n' && lastAtIndex !== 0) return null;

    return {
      query: textAfterAt,
      start: lastAtIndex,
      end: cursorPosition,
    };
  }, [content, textareaRef]);

  // Calculate position for dropdown
  useEffect(() => {
    if (!mentionData || !textareaRef.current) {
      setPosition(null);
      return;
    }

    const textarea = textareaRef.current;
    const textBefore = content.substring(0, mentionData.start);
    
    // Create a temporary div to measure text dimensions
    const temp = document.createElement('div');
    temp.style.position = 'absolute';
    temp.style.visibility = 'hidden';
    temp.style.whiteSpace = 'pre-wrap';
    temp.style.wordBreak = 'break-word';
    temp.style.font = window.getComputedStyle(textarea).font;
    temp.style.width = `${textarea.clientWidth}px`;
    temp.style.padding = window.getComputedStyle(textarea).padding;
    temp.style.border = window.getComputedStyle(textarea).border;
    temp.textContent = textBefore;
    
    document.body.appendChild(temp);
    
    // Get textarea position
    const textareaRect = textarea.getBoundingClientRect();
    const tempRect = temp.getBoundingClientRect();
    
    // Calculate position relative to textarea
    const left = tempRect.width % textarea.clientWidth;
    const top = Math.floor(tempRect.width / textarea.clientWidth) * parseInt(window.getComputedStyle(textarea).lineHeight || '20');
    
    document.body.removeChild(temp);
    
    setPosition({
      top: textareaRect.top + top + 20 + window.scrollY, // 20px below current line
      left: textareaRect.left + left + window.scrollX,
    });
  }, [mentionData, content, textareaRef]);

  // Search for users when mention query changes
  useEffect(() => {
    if (!mentionData || mentionData.query.length === 0) {
      setUsers([]);
      return;
    }

    const searchUsers = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/users/search?q=${encodeURIComponent(mentionData.query)}`);
        if (response.ok) {
          const data = await response.json();
          setUsers(data.users || []);
          setSelectedIndex(0);
        }
      } catch (error) {
        console.error('Error searching users:', error);
        setUsers([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce the search
    const timer = setTimeout(searchUsers, 150);
    return () => clearTimeout(timer);
  }, [mentionData?.query]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!mentionData || users.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % users.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + users.length) % users.length);
          break;
        case 'Enter':
        case 'Tab':
          e.preventDefault();
          if (users[selectedIndex]) {
            onMention(users[selectedIndex].username);
          }
          break;
        case 'Escape':
          setUsers([]);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mentionData, users, selectedIndex, onMention]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        autocompleteRef.current &&
        !autocompleteRef.current.contains(event.target as Node) &&
        textareaRef.current &&
        !textareaRef.current.contains(event.target as Node)
      ) {
        setUsers([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [textareaRef]);

  // Handle user selection
  const handleUserSelect = (user: User) => {
    onMention(user.username);
  };

  // Scroll selected item into view
  useEffect(() => {
    if (autocompleteRef.current) {
      const selectedElement = autocompleteRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (!mentionData || !position || users.length === 0) {
    return null;
  }

  return (
    <div
      ref={autocompleteRef}
      className="fixed z-50 bg-popover border rounded-md shadow-lg max-h-48 overflow-y-auto min-w-48"
      style={{
        top: position.top,
        left: position.left,
      }}
    >
      {isLoading ? (
        <div className="p-3 text-sm text-muted-foreground">Loading...</div>
      ) : (
        <div className="py-1">
          {users.map((user, index) => (
            <div
              key={user.id}
              className={`px-3 py-2 cursor-pointer flex items-center gap-2 ${
                index === selectedIndex ? 'bg-accent' : 'hover:bg-accent'
              }`}
              onClick={() => handleUserSelect(user)}
            >
              <Avatar className="h-6 w-6">
                <AvatarImage src={user.profileImage} alt={user.username} />
                <AvatarFallback className="text-xs">
                  {user.displayName?.[0] || user.username[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">
                  {user.displayName || user.username}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  @{user.username}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
