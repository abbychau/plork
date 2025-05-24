'use client';

import { MessageSquare } from 'lucide-react';
import PersistentAppLayout from '@/components/persistent-app-layout';
import PostList from '@/components/post-list';

export default function RespondedPostsPage() {
  return (
    <PersistentAppLayout>
      <PostList
        title={
          <>
            <MessageSquare className="inline-block mr-2 mb-1" />
            Posts You've Responded To
          </>
        }
        apiEndpoint="/api/posts/responded"
      />
    </PersistentAppLayout>
  );
}