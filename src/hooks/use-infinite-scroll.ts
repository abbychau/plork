'use client';

import { useState, useEffect, useCallback, RefObject } from 'react';

interface UseInfiniteScrollOptions {
  threshold?: number; // Distance from bottom to trigger loading (in pixels)
  rootMargin?: string; // IntersectionObserver rootMargin
  disabled?: boolean; // Whether to disable infinite scrolling
}

/**
 * Hook for implementing infinite scrolling
 * @param callback Function to call when the bottom is reached
 * @param targetRef Reference to the element to observe (optional)
 * @param options Configuration options
 * @returns Object containing loading state and a function to reset the scroll state
 */
export function useInfiniteScroll(
  callback: () => Promise<boolean | void> | boolean | void,
  targetRef?: RefObject<HTMLElement>,
  options: UseInfiniteScrollOptions = {}
) {
  const { threshold = 200, rootMargin = '0px 0px 200px 0px', disabled = false } = options;
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Function to handle scroll events
  const handleScroll = useCallback(async () => {
    if (isLoading || disabled || !hasMore) return;

    // If we're using IntersectionObserver (targetRef provided), this is handled separately
    if (targetRef) return;

    // Calculate if we're near the bottom of the page
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
    const clientHeight = document.documentElement.clientHeight || window.innerHeight;

    if (scrollHeight - scrollTop - clientHeight < threshold) {
      setIsLoading(true);
      try {
        const result = await callback();
        // If callback returns false, it means there's no more content
        if (result === false) {
          setHasMore(false);
        }
      } catch (error) {
        console.error('Error loading more content:', error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [callback, isLoading, threshold, disabled, hasMore, targetRef]);

  // Set up IntersectionObserver if targetRef is provided
  useEffect(() => {
    if (!targetRef?.current || disabled || !hasMore) return;

    const observer = new IntersectionObserver(
      async (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !isLoading) {
          setIsLoading(true);
          try {
            const result = await callback();
            // If callback returns false, it means there's no more content
            if (result === false) {
              setHasMore(false);
            }
          } catch (error) {
            console.error('Error loading more content:', error);
          } finally {
            setIsLoading(false);
          }
        }
      },
      { rootMargin }
    );

    observer.observe(targetRef.current);

    return () => {
      if (targetRef.current) {
        observer.unobserve(targetRef.current);
      }
    };
  }, [callback, targetRef, rootMargin, isLoading, disabled, hasMore]);

  // Set up scroll event listener if no targetRef is provided
  useEffect(() => {
    if (targetRef || disabled || !hasMore) return;

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll, targetRef, disabled, hasMore]);

  // Function to reset the infinite scroll state
  const reset = useCallback(() => {
    setHasMore(true);
  }, []);

  // Function to mark that there's no more content to load
  const end = useCallback(() => {
    setHasMore(false);
  }, []);

  return { isLoading, hasMore, reset, end };
}
