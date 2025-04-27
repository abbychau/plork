'use client';

import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Timer, Loader2 } from 'lucide-react';
import logo from '@/app/favicon.svg';

// This component is only rendered on the client side
export default function TimelineLoadingSkeleton() {
  // State to ensure client-side only rendering
  const [mounted, setMounted] = useState(false);
  const [progress, setProgress] = useState(0);

  // Simulate loading progress
  useEffect(() => {
    setMounted(true);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  // Return a simple loading indicator until client-side rendering is ready
  if (!mounted) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading timeline...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="h-full w-full flex flex-col relative">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-center opacity-5 z-0 animate-subtle-pulse pointer-events-none"></div>

      {/* Decorative circles - similar to landing page */}
      <div className="absolute top-1/4 -left-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-blob pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-20 w-64 h-64 bg-secondary/5 rounded-full blur-3xl animate-blob animation-delay-2000 pointer-events-none"></div>

      {/* Loading overlay */}
      <div className="absolute top-0 left-0 w-full z-10 px-4 py-2 bg-background/80 backdrop-blur-sm border-b border-border flex items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span>Loading your timeline</span>
          <span className="text-xs ml-2 font-mono bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
            {Math.min(Math.round(progress), 100)}%
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="absolute top-8 left-0 w-full h-0.5 bg-muted z-10">
        <div
          className="h-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
      {/* Main content area with 3-column layout */}
      <div className="flex h-full w-full">
        {/* Left column - Navigation */}
        <div className="w-[15%] min-w-[50px] border-r border-border flex flex-col animate-fade-in">
          <div className="h-13 flex items-center justify-center px-2 border-b border-border">
            <div className="flex items-center gap-2 -mb-1.5">
              <img src={logo.src} alt="Plork" className="h-8 w-8 inline-block mb-1" />
              <span className="font-bold hidden md:inline-block">lork</span>
            </div>
          </div>

          <div className="py-4 px-2 space-y-2">
            <Skeleton className="h-9 w-full rounded-md animate-pulse animation-delay-100" />
            <Skeleton className="h-9 w-full rounded-md animate-pulse animation-delay-200" />
            <Skeleton className="h-9 w-full rounded-md animate-pulse animation-delay-300" />
          </div>

          <div className="mt-4 px-2">
            <Skeleton className="h-4 w-24 mb-2 animate-pulse animation-delay-400" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-full rounded-md animate-pulse animation-delay-500" />
              <Skeleton className="h-8 w-full rounded-md animate-pulse animation-delay-700" />
            </div>
          </div>

          <div className="mt-auto px-2 pb-4">
            <Skeleton className="h-10 w-full rounded-md animate-pulse animation-delay-1000" />
          </div>
        </div>

        {/* Middle column - Posts list */}
        <div className="w-[37%] border-r border-border flex flex-col animate-fade-in animation-delay-100">
          <div className="p-3 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Timer className="h-5 w-5 text-primary animate-pulse" />
              <div className="font-medium">Timeline</div>
            </div>
            <Skeleton className="h-8 w-16 rounded-full animate-pulse" />
          </div>

          <div className="p-2 border-b border-border">
            <Skeleton className="h-9 w-full rounded-md animate-pulse" />
          </div>

          <div className="flex-1 overflow-hidden p-3 space-y-4">
            {/* Post skeletons - using fixed structure to avoid hydration mismatches */}
            {/* Post 1 - Selected/Active */}
            <div className="p-3 border-b border-border animate-fade-in animation-delay-100 bg-primary/5 border-l-2 border-l-primary">
              <div className="flex items-start gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1">
                  <div className="flex justify-between mb-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-10" />
                  </div>
                  <Skeleton className="h-3 w-full mb-1" />
                  <Skeleton className="h-3 w-full mb-1" />
                  <Skeleton className="h-3 w-3/4 mb-1" />
                  <div className="flex gap-4 mt-3">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                </div>
              </div>
            </div>

            {/* Post 2 - With image */}
            <div className="p-3 border-b border-border animate-fade-in animation-delay-200 hover:bg-muted/20">
              <div className="flex items-start gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1">
                  <div className="flex justify-between mb-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-10" />
                  </div>
                  <Skeleton className="h-3 w-full mb-1" />
                  <Skeleton className="h-3 w-full mb-1" />
                  <Skeleton className="h-32 w-full rounded-md mt-2 mb-2" />
                  <div className="flex gap-4 mt-3">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                </div>
              </div>
            </div>

            {/* Post 3 */}
            <div className="p-3 border-b border-border animate-fade-in animation-delay-300 hover:bg-muted/20">
              <div className="flex items-start gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1">
                  <div className="flex justify-between mb-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-10" />
                  </div>
                  <Skeleton className="h-3 w-full mb-1" />
                  <Skeleton className="h-3 w-full mb-1" />
                  <Skeleton className="h-3 w-full mb-1" />
                  <Skeleton className="h-3 w-1/2 mb-1" />
                  <div className="flex gap-4 mt-3">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                </div>
              </div>
            </div>

            {/* Post 4 - With image */}
            <div className="p-3 border-b border-border animate-fade-in animation-delay-400 hover:bg-muted/20">
              <div className="flex items-start gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1">
                  <div className="flex justify-between mb-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-10" />
                  </div>
                  <Skeleton className="h-3 w-full mb-1" />
                  <Skeleton className="h-32 w-full rounded-md mt-2 mb-2" />
                  <div className="flex gap-4 mt-3">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                </div>
              </div>
            </div>

            {/* Post 5 */}
            <div className="p-3 border-b border-border animate-fade-in animation-delay-500 hover:bg-muted/20">
              <div className="flex items-start gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1">
                  <div className="flex justify-between mb-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-10" />
                  </div>
                  <Skeleton className="h-3 w-full mb-1" />
                  <Skeleton className="h-3 w-full mb-1" />
                  <Skeleton className="h-3 w-3/4 mb-1" />
                  <div className="flex gap-4 mt-3">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column - Post detail */}
        <div className="w-[48%] flex flex-col animate-fade-in animation-delay-200">
          <div className="p-3 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div>
                  <Skeleton className="h-5 w-32 mb-1" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-4 w-20" />
            </div>
          </div>

          <div className="flex-1 overflow-hidden p-4">
            <div className="space-y-4">
              {/* Post content with hashtags */}
              <div className="space-y-3 mb-6">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <div className="flex gap-2 flex-wrap">
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-5 w-24 rounded-full" />
                </div>
                <Skeleton className="h-4 w-3/4" />
              </div>

              {/* Embedded content - could be image, video, etc. */}
              <div className="rounded-lg border border-border p-1 mb-4">
                <Skeleton className="h-48 w-full rounded-md" />
                <div className="mt-2 p-2">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>

              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />

              {/* Interaction buttons */}
              <div className="pt-4 mt-4 border-t border-border">
                <div className="flex justify-between">
                  <div className="flex gap-4">
                    <div className="flex items-center gap-1">
                      <Skeleton className="h-5 w-5 rounded-full" />
                      <Skeleton className="h-4 w-8" />
                    </div>
                    <div className="flex items-center gap-1">
                      <Skeleton className="h-5 w-5 rounded-full" />
                      <Skeleton className="h-4 w-8" />
                    </div>
                    <div className="flex items-center gap-1">
                      <Skeleton className="h-5 w-5 rounded-full" />
                      <Skeleton className="h-4 w-8" />
                    </div>
                  </div>
                  <Skeleton className="h-5 w-24" />
                </div>
              </div>

              {/* Comments section */}
              <div className="pt-6 mt-6 border-t border-border">
                <div className="flex items-center gap-2 mb-4">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <Skeleton className="h-6 w-32" />
                </div>

                {/* Comment input */}
                <div className="flex items-start gap-3 mb-6">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-20 w-full rounded-md" />
                  </div>
                </div>

                {/* Comments - fixed structure to avoid hydration mismatches */}
                <div className="space-y-4">
                  {/* Comment 1 */}
                  <div className="flex items-start gap-3 p-3 rounded-md bg-muted/10">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-10" />
                      </div>
                      <Skeleton className="h-3 w-full mb-1" />
                      <Skeleton className="h-3 w-5/6 mb-1" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                  </div>

                  {/* Comment 2 */}
                  <div className="flex items-start gap-3 p-3 rounded-md bg-muted/10">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-10" />
                      </div>
                      <Skeleton className="h-3 w-full mb-1" />
                      <Skeleton className="h-3 w-5/6 mb-1" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
