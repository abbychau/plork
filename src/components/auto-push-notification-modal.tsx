'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Bell, X } from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function AutoPushNotificationModal() {
  const { user } = useAuth();
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [permissionState, setPermissionState] = useState<NotificationPermission>('default');

  useEffect(() => {
    // Check if push notifications are supported
    const supported = 'serviceWorker' in navigator && 'PushManager' in window;
    setIsSupported(supported);

    if (supported && user) {
      // Check current permission state
      setPermissionState(Notification.permission);
      
      // Check if user is already subscribed
      checkSubscriptionStatus();
    }
  }, [user]);

  useEffect(() => {
    // Show modal automatically if conditions are met
    if (
      user && 
      isSupported && 
      permissionState === 'default' && 
      !isSubscribed && 
      !localStorage.getItem('push-notification-dismissed')
    ) {
      // Small delay to ensure the app has loaded
      const timer = setTimeout(() => {
        setShowModal(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [user, isSupported, permissionState, isSubscribed]);

  const checkSubscriptionStatus = async () => {
    if (!user || !isSupported) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error('Error checking subscription status:', error);
    }
  };
  const handleEnableNotifications = async () => {
    if (!isSupported || !user) return;

    setIsLoading(true);
    try {
      // Request permission first
      console.log('Requesting notification permission...');
      const permission = await Notification.requestPermission();
      setPermissionState(permission);

      if (permission === 'granted') {
        console.log('Permission granted, subscribing user...');
        await subscribeUser();
        setShowModal(false);
      } else {
        console.log('Permission denied or dismissed');
        // Permission denied, close modal and mark as dismissed
        setShowModal(false);
        localStorage.setItem('push-notification-dismissed', 'true');
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
      // Close modal even on error to prevent it from getting stuck
      setShowModal(false);
      localStorage.setItem('push-notification-dismissed', 'true');
    } finally {
      setIsLoading(false);
    }
  };
  const subscribeUser = async () => {
    try {
      // First, ensure service worker is registered
      let registration;
      try {
        registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered successfully');
        
        // Wait for the service worker to be ready
        registration = await navigator.serviceWorker.ready;
        console.log('Service Worker is ready');
      } catch (swError) {
        console.error('Service Worker registration failed:', swError);
        throw new Error('Service Worker registration failed');
      }

      // Get VAPID public key
      const vapidResponse = await fetch('/api/push/vapid-key');
      if (!vapidResponse.ok) {
        const errorText = await vapidResponse.text();
        console.error('VAPID key fetch failed:', errorText);
        throw new Error('Failed to get VAPID key');
      }

      const { publicKey } = await vapidResponse.json();
      console.log('VAPID public key retrieved successfully');

      // Check if push manager is available
      if (!registration.pushManager) {
        throw new Error('Push messaging is not supported');
      }

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      console.log('Push subscription created successfully');

      // Send subscription to server
      const response = await fetch('/api/push/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          keys: {
            p256dh: arrayBufferToBase64(subscription.getKey('p256dh')!),
            auth: arrayBufferToBase64(subscription.getKey('auth')!),
          },
          userAgent: navigator.userAgent,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Subscription save failed:', errorText);
        throw new Error('Failed to save subscription');
      }

      console.log('Subscription saved to server successfully');
      setIsSubscribed(true);
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      throw error;
    }
  };

  const handleDismiss = () => {
    setShowModal(false);
    localStorage.setItem('push-notification-dismissed', 'true');
  };

  // Utility functions
  const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
  };

  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Stay Connected with Plork
          </DialogTitle>
          <DialogDescription>
            Enable push notifications to get instant alerts when someone likes, comments on, or mentions you. 
            You'll never miss important interactions!
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-2">
                <Bell className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Instant notifications</p>
                <p className="text-xs text-muted-foreground">Get notified immediately when something happens</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-green-100 p-2">
                <div className="h-4 w-4 rounded-full bg-green-500" />
              </div>
              <div>
                <p className="text-sm font-medium">Privacy focused</p>
                <p className="text-xs text-muted-foreground">Only you receive your notifications</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-blue-100 p-2">
                <X className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium">Easy to disable</p>
                <p className="text-xs text-muted-foreground">Turn off anytime in settings or browser</p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={handleDismiss}>
            Not now
          </Button>
          <Button onClick={handleEnableNotifications} disabled={isLoading}>
            {isLoading ? 'Enabling...' : 'Enable Notifications'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
