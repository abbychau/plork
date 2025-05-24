'use client';

import { Heart } from '@mynaui/icons-react';
import ResponsiveAppLayout from '@/components/responsive-app-layout';
import PostList from '@/components/post-list';

export default function LikedPostsPage() {
  return (
    <ResponsiveAppLayout
      title="Liked"
      apiEndpoint="/api/posts/liked"
    >
      <PostList
        title={
          <>
            <Heart className="inline-block mr-2 mb-1" />
            Liked
          </>
        }
        apiEndpoint="/api/posts/liked"
      />
    </ResponsiveAppLayout>
  );
}
