'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ThemeToggle } from '@/components/theme-toggle';
import NotificationDropdown from '@/components/notification-dropdown';
import UserSearchBar from '@/components/user-search-bar';

export default function Header() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/" className="text-2xl font-bold">
            Plork
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
          <div className="hidden lg:block w-70">
            <UserSearchBar />
          </div>
          <ThemeToggle />

          <div className="ml-2">
            {user ? (
              <div className="flex items-center space-x-4">
                <Link href="/compose" className="hidden md:block">
                  <Button>New Post</Button>
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
                      <Link href={`/users/${user.username}`}>Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings">Settings</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={logout}>
                      Logout
                    </DropdownMenuItem>
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
