'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function ExplorePostsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tagParam = searchParams.get('tag');

  useEffect(() => {
    // Redirect to the main explore page with the tag parameter if it exists
    if (tagParam) {
      router.push(`/explore?tag=${tagParam}`);
    } else {
      router.push('/explore');
    }
  }, [router, tagParam]);

  // Return a simple loading state while redirecting
  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <p>Redirecting to explore page...</p>
    </div>
  );
}

export default function ExplorePostsPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8 text-center">Loading...</div>}>
      <ExplorePostsContent />
    </Suspense>
  );
}
