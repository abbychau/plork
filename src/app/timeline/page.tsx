'use client';

import { Timer } from 'lucide-react';
import ResponsiveAppLayout from '@/components/responsive-app-layout';
import PostList from '@/components/post-list';

export default function TimelinePage() {
  return (
    <ResponsiveAppLayout
      title="Timeline"
      apiEndpoint="/api/posts"
    >
      <PostList
        title={
          <>
            <Timer className="inline-block mr-2 mb-1" />
            Timeline
          </>
        }
        apiEndpoint="/api/posts"
      />
    </ResponsiveAppLayout>
  );
}
