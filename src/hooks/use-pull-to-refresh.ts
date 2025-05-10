'use client';

import { useState, useEffect, useRef, RefObject } from 'react';

interface UsePullToRefreshOptions {
  threshold?: number; // Distance to pull before triggering refresh (in pixels)
  maxPull?: number; // Maximum distance to pull (in pixels)
  disabled?: boolean; // Whether to disable pull-to-refresh
}

/**
 * Hook for implementing pull-to-refresh functionality
 * @param callback Function to call when pull-to-refresh is triggered
 * @param targetRef Reference to the element to attach pull-to-refresh to
 * @param options Configuration options
 * @returns Object containing refreshing state and pull progress
 */
export function usePullToRefresh(
  callback: () => Promise<void> | void,
  targetRef: RefObject<HTMLElement>,
  options: UsePullToRefreshOptions = {}
) {
  const { threshold = 80, maxPull = 120, disabled = false } = options;
  const [refreshing, setRefreshing] = useState(false);
  const [pullProgress, setPullProgress] = useState(0);
  const startY = useRef(0);
  const currentY = useRef(0);
  const pulling = useRef(false);
  const isMobile = useRef(false);

  // Check if we're on a mobile device
  useEffect(() => {
    if (typeof window !== 'undefined') {
      isMobile.current = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
    }
  }, []);

  useEffect(() => {
    if (!targetRef.current || disabled || !isMobile.current) return;

    const element = targetRef.current;

    const handleTouchStart = (e: TouchEvent) => {
      // Only enable pull-to-refresh when at the top of the content
      if (element.scrollTop <= 0) {
        startY.current = e.touches[0].clientY;
        currentY.current = startY.current;
        pulling.current = true;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!pulling.current) return;

      currentY.current = e.touches[0].clientY;
      const pullDistance = Math.max(0, currentY.current - startY.current);

      // Apply resistance to the pull
      const resistedPull = Math.min(maxPull, pullDistance * 0.5);
      
      if (pullDistance > 0) {
        // Prevent default scrolling behavior when pulling down
        e.preventDefault();
        
        // Update pull progress (0 to 100)
        const progress = Math.min(100, (resistedPull / threshold) * 100);
        setPullProgress(progress);
        
        // Apply visual feedback
        if (element.style) {
          element.style.transform = `translateY(${resistedPull}px)`;
        }
      }
    };

    const handleTouchEnd = async () => {
      if (!pulling.current) return;
      
      pulling.current = false;
      const pullDistance = Math.max(0, currentY.current - startY.current);
      const resistedPull = Math.min(maxPull, pullDistance * 0.5);
      
      // Reset transform with transition
      if (element.style) {
        element.style.transition = 'transform 0.3s ease-out';
        element.style.transform = 'translateY(0)';
        
        // Clear transition after animation completes
        setTimeout(() => {
          if (element.style) {
            element.style.transition = '';
          }
        }, 300);
      }
      
      // If pulled far enough, trigger refresh
      if (resistedPull >= threshold) {
        setRefreshing(true);
        setPullProgress(100);
        
        try {
          await callback();
        } catch (error) {
          console.error('Error during pull-to-refresh:', error);
        } finally {
          setRefreshing(false);
          setPullProgress(0);
        }
      } else {
        setPullProgress(0);
      }
    };

    // Add event listeners
    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd);

    // Clean up event listeners
    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [callback, targetRef, threshold, maxPull, disabled]);

  return { refreshing, pullProgress };
}
