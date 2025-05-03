'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/lib/auth-context';
import { usePinnedUsers } from '@/lib/pinned-users-context';
import { useUnreadCounts } from '@/hooks/use-unread-counts';
import { useTimelineUnread } from '@/hooks/use-timeline-unread';
import NotificationDropdown from '@/components/notification-dropdown';
import CreatePostModal from '@/components/create-post-modal';
import PersonalPortfolioPopover from '@/components/personal-portfolio-popover';
import FindUsersModal from '@/components/find-users-modal';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import {
  Home,
  Compass,
  User,
  FileText,
  Hash,
  MessageSquare
} from 'lucide-react';
import { Heart } from '@mynaui/icons-react';
import logo from '@/app/favicon.svg'

interface NavProps {
  isCollapsed: boolean;
}

export default function AppNav({ isCollapsed }: NavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const { pinnedUsers } = usePinnedUsers();
  const { unreadCounts } = useUnreadCounts(pinnedUsers.map(user => user.username));
  const { unreadCount: timelineUnreadCount } = useTimelineUnread();

  // Handle navigation with client-side routing to preserve layout
  const handleNavigation = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    router.push(href);
  };

  const navItems = [
    {
      title: 'Timeline',
      href: '/timeline',
      icon: Home,
      active: pathname === '/' || pathname === '/timeline',
      unreadCount: timelineUnreadCount,
    },
    {
      title: 'Explore',
      href: '/explore',
      icon: Compass,
      active: pathname === '/explore',
    },
    {
      title: 'Tags',
      href: '/tags',
      icon: Hash,
      active: pathname === '/tags' || pathname.startsWith('/tags/'),
    },
  ];

  // Add My Posts and Liked to user nav items
  const userNavItems = [
    {
      title: 'My Posts',
      href: user ? `/users/${user.username}` : '/',
      icon: FileText,
      active: user ? pathname === `/users/${user.username}` : false,
    },
    {
      title: 'Liked',
      href: '/liked',
      icon: Heart,
      active: pathname === '/liked',
    },
    {
      title: 'Responded',
      href: '/responded',
      icon: MessageSquare,
      active: pathname === '/responded',
    },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className={cn(
        "flex h-13 items-center justify-center",
        isCollapsed ? "h-13" : "px-2"
      )}>
        <Link href="/timeline" className={cn(
          "flex items-center gap-2 -mb-1.5",
          isCollapsed ? "justify-center" : "justify-start"
        )}>
          <img src={logo.src} alt="Plork" className="h-8 w-8 inline-block mb-1" />
          {!isCollapsed && (
            <span className="font-bold hidden md:inline-block">
              lork
            </span>
          )}
        </Link>
      </div>

      <Separator />

      <div
        data-collapsed={isCollapsed}
        className="group flex flex-col gap-4 py-2 data-[collapsed=true]:py-2"
      >
        <nav className="grid gap-1 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2">
          {navItems.map((item, index) =>
            isCollapsed ? (
              <Tooltip key={index} delayDuration={0}>
                <TooltipTrigger asChild>
                  <div className="relative">
                    <Link
                      href={item.href}
                      onClick={(e) => handleNavigation(e, item.href)}
                      className={cn(
                        buttonVariants({ variant: item.active ? 'default' : 'ghost', size: 'icon' }),
                        "h-9 w-9",
                        item.active && "dark:bg-muted dark:text-white dark:hover:bg-muted dark:hover:text-white"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      <span className="sr-only">{item.title}</span>
                    </Link>
                    {item.unreadCount > 0 && (
                      <Badge
                        variant="default"
                        className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]"
                      >
                        {item.unreadCount > 9 ? '9+' : item.unreadCount}
                      </Badge>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right" className="flex items-center gap-2">
                  {item.title}
                  {item.unreadCount > 0 && (
                    <span className="bg-primary text-primary-foreground text-xs rounded-full px-1.5 py-0.5 min-w-[1.25rem] text-center">
                      {item.unreadCount > 99 ? '99+' : item.unreadCount}
                    </span>
                  )}
                </TooltipContent>
              </Tooltip>
            ) : (
              <div key={index} className="relative w-full">
                <Link
                  href={item.href}
                  onClick={(e) => handleNavigation(e, item.href)}
                  className={cn(
                    buttonVariants({ variant: item.active ? 'default' : 'ghost', size: 'sm' }),
                    item.active && "dark:bg-muted dark:text-white dark:hover:bg-muted dark:hover:text-white",
                    "justify-start w-full"
                  )}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.title}
                  {item.unreadCount > 0 && (
                    <span className="ml-auto bg-primary text-primary-foreground text-xs rounded-full px-1.5 py-0.5 min-w-[1.25rem] text-center">
                      {item.unreadCount > 99 ? '99+' : item.unreadCount}
                    </span>
                  )}
                </Link>
              </div>
            )
          )}
        </nav>
      </div>

      {user && (
        <>
          <Separator className="my-2" />

          <div
            data-collapsed={isCollapsed}
            className="group flex flex-col gap-4 py-2 data-[collapsed=true]:py-2"
          >
            <nav className="grid gap-1 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2">
              {userNavItems.map((item, index) =>
                isCollapsed ? (
                  <Tooltip key={index} delayDuration={0}>
                    <TooltipTrigger asChild>
                      <Link
                        href={item.href}
                        onClick={(e) => handleNavigation(e, item.href)}
                        className={cn(
                          buttonVariants({ variant: item.active ? 'default' : 'ghost', size: 'icon' }),
                          "h-9 w-9",
                          item.active && "dark:bg-muted dark:text-white dark:hover:bg-muted dark:hover:text-white"
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        <span className="sr-only">{item.title}</span>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="flex items-center gap-4">
                      {item.title}
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <Link
                    key={index}
                    href={item.href}
                    onClick={(e) => handleNavigation(e, item.href)}
                    className={cn(
                      buttonVariants({ variant: item.active ? 'default' : 'ghost', size: 'sm' }),
                      item.active && "dark:bg-muted dark:text-white dark:hover:bg-muted dark:hover:text-white",
                      "justify-start"
                    )}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.title}
                  </Link>
                )
              )}
            </nav>
          </div>

          {/* Pinned Users Section */}
          {pinnedUsers.length > 0 && (
            <>
              <Separator className="my-2" />

              <div className="px-2 py-1">
                <div className="flex items-center justify-between">
                  <p className={cn(
                    "text-xs font-medium text-muted-foreground",
                    isCollapsed && "sr-only"
                  )}>
                    Pinned Users
                  </p>
                  {!isCollapsed && (
                    <FindUsersModal compact triggerClassName="h-5 w-5" />
                  )}
                </div>
              </div>

              <div
                data-collapsed={isCollapsed}
                className="group flex flex-col gap-2 py-1 data-[collapsed=true]:py-1"
              >
                <nav className="grid gap-1 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2">
                  {pinnedUsers.map((pinnedUser) => (
                    <div key={pinnedUser.id} className="flex items-center">
                      {isCollapsed ? (
                        <Tooltip delayDuration={0}>
                          <TooltipTrigger asChild>
                            <div className="relative">
                              <Link
                                href={`/users/${pinnedUser.username}`}
                                className={cn(
                                  "flex items-center justify-center h-9 w-9 rounded-md transition-colors",
                                  pathname.startsWith(`/users/${pinnedUser.username}`)
                                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                    : "hover:bg-muted"
                                )}
                              >
                                <Avatar className="h-7 w-7">
                                  <AvatarImage src={pinnedUser.profileImage} alt={pinnedUser.username} />
                                  <AvatarFallback>
                                    {pinnedUser.displayName?.[0] || pinnedUser.username[0]}
                                  </AvatarFallback>
                                </Avatar>
                              </Link>
                              {unreadCounts[pinnedUser.username] > 0 && (
                                <Badge
                                  variant="default"
                                  className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]"
                                >
                                  {unreadCounts[pinnedUser.username] > 9 ? '9+' : unreadCounts[pinnedUser.username] || 0}
                                </Badge>
                              )}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            {pinnedUser.displayName || pinnedUser.username}
                            {unreadCounts[pinnedUser.username] > 0 && (
                              <span className="ml-1 text-xs">({unreadCounts[pinnedUser.username] || 0} new)</span>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <div className="flex items-center justify-between w-full">
                          <Link
                            href={`/users/${pinnedUser.username}`}
                            className={cn(
                              "flex items-center gap-2 py-1 px-2 rounded-md transition-colors w-full text-left",
                              pathname.startsWith(`/users/${pinnedUser.username}`)
                                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                : "hover:bg-muted"
                            )}
                          >
                            <div className="relative">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={pinnedUser.profileImage} alt={pinnedUser.username} />
                                <AvatarFallback>
                                  {pinnedUser.displayName?.[0] || pinnedUser.username[0]}
                                </AvatarFallback>
                              </Avatar>

                              {unreadCounts[pinnedUser.username] > 0 && (
                                <Badge
                                  variant="default"
                                  className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]"
                                >
                                  {unreadCounts[pinnedUser.username] > 9 ? '9+' : unreadCounts[pinnedUser.username] || '0'}
                                </Badge>
                              )}
                            </div>
                            <span className="text-sm truncate">
                              {pinnedUser.displayName || pinnedUser.username}
                            </span>
                          </Link>
                        </div>
                      )}
                    </div>
                  ))}
                </nav>
              </div>
            </>
          )}
        </>
      )}



      <div className="mt-auto px-2 pb-4">
        {user ? (
          <div className="flex flex-col gap-2">
            {!isCollapsed && (
              <div className="flex items-center justify-between">
                <NotificationDropdown />
                <CreatePostModal compact triggerClassName="h-8 w-8" />
              </div>
            )}

            {isCollapsed && (
              <div className="mb-2">
                <CreatePostModal compact triggerClassName="h-9 w-9" />
              </div>
            )}

            <PersonalPortfolioPopover isCollapsed={isCollapsed} />
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {!isCollapsed && (
              <>
                <Link
                  href="/login"
                  className={cn(
                    buttonVariants({ variant: 'default', size: 'sm' }),
                    "w-full"
                  )}
                >
                  Login
                </Link>

                <Link
                  href="/register"
                  className={cn(
                    buttonVariants({ variant: 'outline', size: 'sm' }),
                    "w-full"
                  )}
                >
                  Register
                </Link>
              </>
            )}

            {isCollapsed && (
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Link
                    href="/login"
                    className={cn(
                      buttonVariants({ variant: 'default', size: 'icon' }),
                      "h-9 w-9"
                    )}
                  >
                    <User className="h-4 w-4" />
                    <span className="sr-only">Login</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  Login
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
