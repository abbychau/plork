'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import PostEditor from '@/components/post-editor';

export default function ComposePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const handleSubmit = async (content: string) => {
    setError('');
    setIsLoading(true);

    try {
      // Create the post via API
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create post');
      }

      // Redirect to home page after posting
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create post');
      console.error(err);
      throw err; // Re-throw to let the PostEditor component handle the error state
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state if user is not available yet
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl flex justify-center items-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-4">Create a New Post</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <PostEditor
        onSubmit={handleSubmit}
        isLoading={isLoading}
        placeholder="What's on your mind? You can use Markdown and upload images!"
        submitLabel="Post"
      />

      <div className="mt-6 text-sm text-muted-foreground">
        <p className="mb-2">Tips:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Use Markdown for formatting</li>
          <li>Drag & drop images or paste them directly</li>
          <li>Click the Preview button to see how your post will look</li>
        </ul>
      </div>
    </div>
  );
}
