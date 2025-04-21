'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/lib/theme-context';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent
} from '@/components/ui/dropdown-menu';
import NotificationDropdown from '@/components/notification-dropdown';
import SearchBar from '@/components/search-bar';
import { Plus, Sun, Moon, Laptop, User, Settings, LogOut, Palette, Search } from 'lucide-react';
import { Suspense } from 'react';
import logo from '@/app/favicon.svg';

export default function Header() {
  const { user, logout } = useAuth();
  const { setTheme } = useTheme();
  const pathname = usePathname();
  const isSearchPage = pathname === '/search';

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/" className="text-2xl font-mono -mb-2 mr-8">
            <img src={logo.src} alt="Plork" className="h-8 w-8 inline-block mb-1" />
            lork
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
                <Link href="/compose" className="hidden md:block">
                  <Button size='sm'>
                    <Plus className="h-4 w-4" />
                    Write</Button>
                </Link>
                <NotificationDropdown />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.profileImage} alt={user.username} />
                        <AvatarFallback>
                          {user.displayName?.[0] || user.username[0]}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/users/${user.username}`} className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={logout} className="flex items-center gap-2">
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger className="flex items-center gap-2">
                        <Palette className="h-4 w-4" />
                        <span>Theme</span>
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        <DropdownMenuItem onClick={() => setTheme('light')} className="flex items-center gap-2">
                          <Sun className="h-4 w-4" />
                          <span>Light</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTheme('dark')} className="flex items-center gap-2">
                          <Moon className="h-4 w-4" />
                          <span>Dark</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTheme('system')} className="flex items-center gap-2">
                          <Laptop className="h-4 w-4" />
                          <span>System</span>
                        </DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                  </DropdownMenuContent>
                </DropdownMenu>
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
