'use client';

import { ReactNode } from 'react';
import { useCompactMode } from '@/hooks/use-compact-mode';
import AppLayout from '@/components/app-layout';
import MobileAppLayout from '@/components/mobile-app-layout';

interface ResponsiveAppLayoutProps {
  children?: ReactNode;
  initialPosts?: any[];
  apiEndpoint?: string;
  title?: string;
  showSearch?: boolean;
  showNewPostButton?: boolean;
  tag?: string;
  searchQuery?: string;
  tabs?: { label: string; value: string }[];
  isTagsPage?: boolean;
}

export default function ResponsiveAppLayout({
  children,
  initialPosts,
  apiEndpoint,
  title,
  showSearch = false,
  showNewPostButton = false,
  tag,
  searchQuery,
  tabs,
  isTagsPage = false,
}: ResponsiveAppLayoutProps) {
  // Use the useCompactMode hook to determine if we should use the mobile layout
  const isCompact = useCompactMode();

  // Render the appropriate layout based on screen size
  if (isCompact) {
    return (
      <MobileAppLayout
        initialPosts={initialPosts}
        apiEndpoint={apiEndpoint}
        title={title}
        showSearch={showSearch}
        showNewPostButton={showNewPostButton}
        tag={tag}
        searchQuery={searchQuery}
        tabs={tabs}
        isTagsPage={isTagsPage}
      >
        {children}
      </MobileAppLayout>
    );
  }

  // Default to the desktop layout
  return (
    <AppLayout
      initialPosts={initialPosts}
      apiEndpoint={apiEndpoint}
      title={title}
      showSearch={showSearch}
      showNewPostButton={showNewPostButton}
      tag={tag}
      searchQuery={searchQuery}
      tabs={tabs}
      isTagsPage={isTagsPage}
    >
      {children}
    </AppLayout>
  );
}
