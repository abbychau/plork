'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Bell, BellOff } from 'lucide-react';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface PushNotificationManagerProps {
  className?: string;
}

export default function PushNotificationManager({ className }: PushNotificationManagerProps) {
  const { user } = useAuth();
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [permissionState, setPermissionState] = useState<NotificationPermission>('default');

  useEffect(() => {
    // Check if push notifications are supported
    const supported = 'serviceWorker' in navigator && 'PushManager' in window;
    setIsSupported(supported);

    if (supported) {
      // Check current permission state
      setPermissionState(Notification.permission);
      
      // Check if user is already subscribed
      checkSubscriptionStatus();
    }
  }, [user]);

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

  const requestPermission = async () => {
    if (!isSupported) return false;

    try {
      const permission = await Notification.requestPermission();
      setPermissionState(permission);
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting permission:', error);
      return false;
    }
  };

  const subscribeToNotifications = async () => {
    if (!user || !isSupported || isLoading) return;

    setIsLoading(true);
    
    try {
      // Check permission first
      if (permissionState !== 'granted') {
        const granted = await requestPermission();
        if (!granted) {
          setIsLoading(false);
          return;
        }
      }

      // Get VAPID public key
      const vapidResponse = await fetch('/api/push/vapid-key');
      if (!vapidResponse.ok) {
        throw new Error('Failed to get VAPID key');
      }
      
      const { publicKey } = await vapidResponse.json();

      // Get service worker registration
      const registration = await navigator.serviceWorker.ready;

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      // Save subscription to server
      const saveResponse = await fetch('/api/push/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
        }),
      });

      if (!saveResponse.ok) {
        throw new Error('Failed to save subscription');
      }

      setIsSubscribed(true);
    } catch (error) {
      console.error('Error subscribing to notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const unsubscribeFromNotifications = async () => {
    if (!user || !isSupported || isLoading) return;

    setIsLoading(true);

    try {
      // Get service worker registration
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        // Unsubscribe from push service
        await subscription.unsubscribe();

        // Remove subscription from server
        await fetch('/api/push/subscriptions', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            endpoint: subscription.endpoint,
          }),
        });
      }

      setIsSubscribed(false);
    } catch (error) {
      console.error('Error unsubscribing from notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleNotifications = () => {
    if (isSubscribed) {
      unsubscribeFromNotifications();
    } else {
      if (permissionState === 'default') {
        setShowPermissionDialog(true);
      } else {
        subscribeToNotifications();
      }
    }
  };

  const handlePermissionDialogAction = () => {
    setShowPermissionDialog(false);
    subscribeToNotifications();
  };

  // Utility function to convert VAPID key
  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
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

  // Don't render if user is not logged in or push notifications not supported
  if (!user || !isSupported) {
    return null;
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleToggleNotifications}
        disabled={isLoading || permissionState === 'denied'}
        className={className}
        title={
          permissionState === 'denied'
            ? 'Push notifications blocked'
            : isSubscribed
            ? 'Disable push notifications'
            : 'Enable push notifications'
        }
      >
        {isSubscribed ? (
          <Bell className="h-5 w-5" />
        ) : (
          <BellOff className="h-5 w-5 opacity-60" />
        )}
      </Button>

      <AlertDialog open={showPermissionDialog} onOpenChange={setShowPermissionDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Enable Push Notifications</AlertDialogTitle>
            <AlertDialogDescription>
              Get notified instantly when someone likes, comments, mentions you, or follows you. 
              You can disable this at any time in your browser settings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Not now</AlertDialogCancel>
            <AlertDialogAction onClick={handlePermissionDialogAction}>
              Enable Notifications
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
