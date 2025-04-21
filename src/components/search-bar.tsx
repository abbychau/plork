'use client';

import { useState, KeyboardEvent, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function SearchBar() {
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isSearchPage = pathname === '/search';

  // Update search term from URL when on search page
  useEffect(() => {
    if (isSearchPage) {
      const query = searchParams.get('q');
      const tag = searchParams.get('tag');

      if (query) {
        setSearchTerm(query);
      } else if (tag) {
        setSearchTerm(`#${tag}`);
      }
    }
  }, [isSearchPage, searchParams]);

  const handleSearch = () => {
    if (!searchTerm.trim()) return;

    // Update URL with search parameter
    if (searchTerm.startsWith('#')) {
      const tag = searchTerm.substring(1);
      router.push(`/search?tag=${encodeURIComponent(tag)}`);
    } else {
      router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
    }

    // Only clear the search input if not on the search page
    if (!isSearchPage) {
      setSearchTerm('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="relative flex items-center w-full">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search posts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          className={cn(
            "pl-9 w-full pr-20",
            isSearchPage && "border-primary ring-1 ring-primary/30 focus-visible:ring-primary/50"
          )}
        />
        <div className="absolute right-2 top-1.5">
          <Button
            onClick={handleSearch}
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
  );
}
