'use client';

import { useWindowSize } from './use-window-size';

// Breakpoint for compact mode (in pixels)
// Using md breakpoint from Tailwind (768px)
const COMPACT_BREAKPOINT = 768;

/**
 * Hook to determine if the UI should be in compact mode based on screen width
 * @param forceCompact Optional override to force compact mode regardless of screen width
 * @returns boolean indicating if compact mode should be active
 */
export function useCompactMode(forceCompact?: boolean): boolean {
  const { width } = useWindowSize();
  
  // If forceCompact is provided, use that value
  if (forceCompact !== undefined) {
    return forceCompact;
  }
  
  // Otherwise determine based on screen width
  return width < COMPACT_BREAKPOINT;
}
