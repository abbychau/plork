'use client';

import { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { Toast, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from '@/components/ui/toast';
import { cn } from '@/lib/utils';

export default function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') return;

    // Set initial state
    setIsOnline(navigator.onLine);
    setIsInitialized(true);
    
    // After first render, set initialLoad to false
    setTimeout(() => setInitialLoad(false), 1000);

    const handleOnline = () => {
      setIsOnline(true);
      setShowToast(true);
      // Hide toast after 3 seconds
      setTimeout(() => setShowToast(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowToast(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Don't show anything on initial load or before initialization
  if (initialLoad || !isInitialized) return null;

  // Don't render if online and toast not showing
  if (isOnline && !showToast) return null;

  return (
    <ToastProvider>
      <Toast
        open={showToast}
        onOpenChange={setShowToast}
        className={cn(
          "fixed bottom-4 left-4 z-50 w-auto",
          isOnline ? "bg-green-50 text-green-900 dark:bg-green-900 dark:text-green-50" : 
                    "bg-red-50 text-red-900 dark:bg-red-900 dark:text-red-50"
        )}
      >
        <div className="flex items-center gap-2">
          {isOnline ? (
            <Wifi className="h-5 w-5" />
          ) : (
            <WifiOff className="h-5 w-5" />
          )}
          <div>
            <ToastTitle>{isOnline ? "You're back online" : "You're offline"}</ToastTitle>
            <ToastDescription>
              {isOnline 
                ? "Your internet connection has been restored" 
                : "Some features may not be available"}
            </ToastDescription>
          </div>
        </div>
      </Toast>
      <ToastViewport />
    </ToastProvider>
  );
}
