'use client';

import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/lib/theme-context';
import { Button } from '@/components/ui/button';
import { useCompactMode } from '@/hooks/use-compact-mode';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import {
  Settings,
  LogOut,
  Activity,
  Code,
  Info,
  Sun,
  Moon,
  Laptop,
  Menu,
  Home,
  Palette,
} from 'lucide-react';


export default function BottomMenu() {
  const { user, logout } = useAuth();
  const { setTheme } = useTheme();
  const isCompact = useCompactMode();

  // Don't show the bottom menu on mobile as we have the tab navigation
  if (!user || isCompact) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="h-10 w-10 rounded-full shadow-md">
            <Menu className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem asChild>
            <Link href="/" className="flex items-center gap-2 cursor-pointer">
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link href="/settings" className="flex items-center gap-2 cursor-pointer">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={logout} className="flex items-center gap-2 cursor-pointer">
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="flex items-center gap-2 cursor-pointer">
              <Sun className="h-4 w-4" />
              <span>Theme</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => setTheme('light')} className="flex items-center gap-2 cursor-pointer">
                <Sun className="h-4 w-4" />
                <span>Light</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('dark')} className="flex items-center gap-2 cursor-pointer">
                <Moon className="h-4 w-4" />
                <span>Dark</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('system')} className="flex items-center gap-2 cursor-pointer">
                <Laptop className="h-4 w-4" />
                <span>System</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setTheme('monokaipro')} className="flex items-center gap-2 cursor-pointer">
                <Palette className="h-4 w-4" />
                <span>Monokai Pro (System)</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('monokaipro-light')} className="flex items-center gap-2 cursor-pointer">
                <Palette className="h-4 w-4" />
                <span>Monokai Pro Light</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('monokaipro-dark')} className="flex items-center gap-2 cursor-pointer">
                <Palette className="h-4 w-4" />
                <span>Monokai Pro Dark</span>
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSeparator />

          <DropdownMenuItem asChild>
            <Link href="/activitypub" className="flex items-center gap-2 cursor-pointer">
              <Activity className="h-4 w-4" />
              <span>ActivityPub</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link href="/api-tester" className="flex items-center gap-2 cursor-pointer">
              <Code className="h-4 w-4" />
              <span>API Tester</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link href="/api-docs" className="flex items-center gap-2 cursor-pointer">
              <Code className="h-4 w-4" />
              <span>API Documentation</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link href="/about" className="flex items-center gap-2 cursor-pointer">
              <Info className="h-4 w-4" />
              <span>About</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}