'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import PersonalPortfolioPopover from '@/components/personal-portfolio-popover';
import NotificationDropdown from '@/components/notification-dropdown';
import SearchBar from '@/components/search-bar';
import { Plus, Search } from 'lucide-react';
import CreatePostModal from '@/components/create-post-modal';
import { Suspense } from 'react';
import logo from '@/app/favicon.svg';

export default function Header() {
  const { user } = useAuth();
  const pathname = usePathname();
  const isSearchPage = pathname === '/search';

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/" className="text-2xl font-mono -mb-2 mr-8">
            <img src={logo.src} alt="Plork" className="h-8 w-8 inline-block mb-1" />
            {//hide lork when collapsed
            }
            <span className="hidden md:inline-block font-bold">
            lork
            </span>
          </Link>
          <nav className="hidden md:flex space-x-4">
            <Link
              href="/"
              className={`transition-colors ${pathname === '/' ? 'text-primary font-medium' : 'hover:text-primary'}`}
            >
              Home
            </Link>
            <Link
              href="/explore"
              className={`transition-colors ${pathname === '/explore' ? 'text-primary font-medium' : 'hover:text-primary'}`}
            >
              Explore
            </Link>
          </nav>
        </div>

        <div className="flex items-center space-x-3">
          <div className="hidden md:block w-70 max-w-md">
            <Suspense fallback={<div className="h-10 w-full bg-muted/30 rounded-lg animate-pulse"></div>}>
            <SearchBar />
            </Suspense>
          </div>
          <Link href="/search" className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 ${isSearchPage ? 'border-primary ring-1 ring-primary/30' : ''}`}
            >
              <Search className="h-4 w-4" />
            </Button>
          </Link>

          <div className="ml-2">
            {user ? (
              <div className="flex items-center space-x-4">
                <CreatePostModal className="hidden md:block">
                  <Button size='sm'>
                    <Plus className="h-4 w-4" />
                    Write</Button>
                </CreatePostModal>
                <NotificationDropdown />
                <PersonalPortfolioPopover />
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link href="/register">
                  <Button>Register</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
