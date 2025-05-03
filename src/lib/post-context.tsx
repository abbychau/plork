'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// Define the Post type
export interface PostAuthor {
  id: string;
  username: string;
  displayName?: string;
  profileImage?: string;
}

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: PostAuthor;
}

export interface Post {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  authorId: string;
  author: PostAuthor;
  comments?: Comment[];
  likes?: PostLike[];
  activityId: string;
}

export interface PostLike {
  id: string;
  userId: string;
  postId: string;
  createdAt: string;
}

// Define the context type
interface PostContextType {
  selectedPostId: string | null;
  setSelectedPostId: (id: string | null) => void;
  selectedPost: Post | null;
  setSelectedPost: (post: Post | null) => void;
  fetchPost: (id: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

// Create the context with a default value
const PostContext = createContext<PostContextType>({
  selectedPostId: null,
  setSelectedPostId: () => {},
  selectedPost: null,
  setSelectedPost: () => {},
  fetchPost: async () => {},
  isLoading: false,
  error: null,
});

// Create a provider component
export function PostProvider({ children }: { children: React.ReactNode }) {
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch a post by ID
  const fetchPost = async (id: string) => {
    if (!id) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/posts/${id}`);

      if (!response.ok) {
        throw new Error('Failed to fetch post');
      }

      const post = await response.json();
      setSelectedPost(post);
    } catch (err) {
      console.error('Error fetching post:', err);
      setError('Failed to load post. Please try again.');
      setSelectedPost(null);
    } finally {
      setIsLoading(false);
    }
  };

  // When selectedPostId changes, fetch the post
  useEffect(() => {
    if (selectedPostId) {
      fetchPost(selectedPostId);
    } else {
      setSelectedPost(null);
    }
  }, [selectedPostId]);

  return (
    <PostContext.Provider
      value={{
        selectedPostId,
        setSelectedPostId,
        selectedPost,
        setSelectedPost,
        fetchPost,
        isLoading,
        error,
      }}
    >
      {children}
    </PostContext.Provider>
  );
}

// Create a custom hook to use the context
export function usePost() {
  return useContext(PostContext);
}
