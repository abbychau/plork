'use client';

import { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

interface User {
  id: string;
  username: string;
  displayName?: string;
  profileImage?: string;
}

export default function UserSearchBar() {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Handle outside clicks to close the dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Search for users and posts when the search term changes
  useEffect(() => {
    const performSearch = async () => {
      if (!searchTerm.trim()) {
        setUsers([]);
        return;
      }

      setIsLoading(true);
      try {
        // Always search for users for autocomplete
        const userResponse = await fetch(`/api/users?search=${encodeURIComponent(searchTerm)}&limit=5`);
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUsers(userData);
          setShowResults(true);
        }


      } catch (error) {
        console.error('Error searching:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce the search
    const timer = setTimeout(() => {
      performSearch();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleUserClick = (username: string) => {
    router.push(`/users/${username}`);
    setShowResults(false);
    setSearchTerm('');
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!searchTerm.trim()) return;

    // If there are users in the dropdown, navigate to the first user's profile
    if (users.length > 0) {
      router.push(`/users/${users[0].username}`);
    } else {
      // Otherwise, search for posts
      router.push(`/explore?search=${encodeURIComponent(searchTerm)}`);
    }

    setShowResults(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  return (
    <div className="relative" ref={searchRef}>
      <form onSubmit={handleSearchSubmit}>
        <div className="relative flex">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search users or posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-9 w-full pr-20"
              onFocus={() => searchTerm.trim() && setShowResults(true)}
            />
            <div className="absolute right-2 top-1.5">
              <Button
                type="submit"
                size="sm"
                variant="ghost"
                className="h-6 px-2 text-xs"
              >
                <Search className="h-3 w-3 mr-1" />
                Search
              </Button>
            </div>
          </div>
        </div>
      </form>

      {showResults && (
        <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md max-h-80 overflow-y-auto">
          {isLoading ? (
            <div className="p-2 text-center text-sm text-muted-foreground">
              Loading...
            </div>
          ) : users.length > 0 ? (
            <div>
              <div className="px-3 py-2 text-xs font-medium text-muted-foreground border-b">
                Users
              </div>
              <ul>
                {users.map((user) => (
                  <li
                    key={user.id}
                    className="px-3 py-2 hover:bg-muted cursor-pointer flex items-center gap-2"
                    onClick={() => handleUserClick(user.username)}
                  >
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={user.profileImage} alt={user.username} />
                      <AvatarFallback>
                        {user.displayName?.[0] || user.username[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-medium">
                        {user.displayName || user.username}
                      </div>
                      {user.displayName && (
                        <div className="text-xs text-muted-foreground">
                          @{user.username}
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
              <div className="px-3 py-2 text-xs text-muted-foreground border-t">
                Press Enter to search for posts
              </div>
            </div>
          ) : searchTerm.trim() ? (
            <div>
              <div className="p-2 text-center text-sm text-muted-foreground">
                No users found
              </div>
              <div className="px-3 py-2 text-xs text-center text-muted-foreground border-t">
                Press Enter to search for posts
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
