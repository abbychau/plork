'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Bell, BellOff, Check, X, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { requestNotificationPermission, initializeMessaging } from '@/lib/firebase';

export default function NotificationSettings() {
  const { user } = useAuth();
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [permissionState, setPermissionState] = useState<NotificationPermission>('default');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  useEffect(() => {
    // Check if Firebase messaging is supported
    const checkSupport = async () => {
      try {
        const messaging = await initializeMessaging();
        setIsSupported(!!messaging);
      } catch (error) {
        console.error('Firebase messaging not supported:', error);
        setIsSupported(false);
      }
    };

    checkSupport();

    if (user) {
      // Check current permission state
      setPermissionState(Notification.permission);
      
      // Check if user has an FCM token (subscribed)
      checkSubscriptionStatus();
    }
  }, [user]);
  const checkSubscriptionStatus = async () => {
    if (!user || !isSupported) return;

    try {
      // Check if user has a stored FCM token in our database
      const response = await fetch('/api/push/fcm-status');
      if (response.ok) {
        const { hasToken } = await response.json();
        setIsSubscribed(hasToken);
      }
    } catch (error) {
      console.error('Error checking FCM subscription status:', error);
    }
  };  const handleEnableNotifications = async () => {
    if (!isSupported || !user) return;

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('Requesting FCM notification permission...');
      
      // Request permission and get FCM token
      const token = await requestNotificationPermission();
      
      if (!token) {
        throw new Error('Failed to get FCM token');
      }

      console.log('FCM token received:', token);

      // Send token to server
      const response = await fetch('/api/push/fcm-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('FCM token save failed:', errorText);
        throw new Error('Failed to save FCM token');
      }

      console.log('FCM token saved successfully');
      setIsSubscribed(true);
      setPermissionState('granted');
      setSuccess('Push notifications enabled successfully!');
    } catch (error) {
      console.error('Error enabling FCM notifications:', error);
      let errorMessage = 'Failed to enable notifications';
      
      if (error instanceof Error) {
        if (error.message.includes('not supported')) {
          errorMessage = 'Push notifications are not supported in this browser.';
        } else if (error.message.includes('permission denied')) {
          errorMessage = 'Permission denied. You can enable notifications in your browser settings.';
        } else if (error.message.includes('FCM token')) {
          errorMessage = 'Failed to get notification token. Please try again.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  const handleDisableNotifications = async () => {
    if (!isSupported || !user) return;

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Remove FCM token from server
      const response = await fetch('/api/push/fcm-token', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('FCM token removal failed:', errorText);
        throw new Error('Failed to disable notifications');
      }

      setIsSubscribed(false);
      setSuccess('Push notifications disabled successfully!');
    } catch (error) {
      console.error('Error disabling notifications:', error);
      setError(error instanceof Error ? error.message : 'Failed to disable notifications');
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

  const getStatusIcon = () => {
    if (permissionState === 'denied') {
      return <X className="h-5 w-5 text-red-500" />;
    } else if (isSubscribed) {
      return <Check className="h-5 w-5 text-green-500" />;
    } else {
      return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusText = () => {
    if (!isSupported) {
      return 'Not supported by your browser';
    } else if (permissionState === 'denied') {
      return 'Blocked by browser settings';
    } else if (isSubscribed) {
      return 'Enabled';
    } else {
      return 'Disabled';
    }
  };

  const getStatusDescription = () => {
    if (!isSupported) {
      return 'Your browser does not support push notifications.';
    } else if (permissionState === 'denied') {
      return 'Push notifications have been blocked. You can enable them in your browser settings.';
    } else if (isSubscribed) {
      return 'You will receive push notifications for likes, comments, mentions, and follows.';
    } else {
      return 'Enable push notifications to get instant alerts for social interactions.';
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Push Notifications
          </CardTitle>
          <CardDescription>
            Get instant notifications when someone interacts with your posts or mentions you.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              {getStatusIcon()}
              <div>
                <p className="font-medium">Status: {getStatusText()}</p>
                <p className="text-sm text-muted-foreground">
                  {getStatusDescription()}
                </p>
              </div>
            </div>
            
            {isSupported && permissionState !== 'denied' && (
              <Button
                onClick={isSubscribed ? handleDisableNotifications : handleEnableNotifications}
                disabled={isLoading}
                variant={isSubscribed ? "outline" : "default"}
              >
                {isLoading ? (
                  'Processing...'
                ) : isSubscribed ? (
                  <>
                    <BellOff className="h-4 w-4 mr-2" />
                    Disable
                  </>
                ) : (
                  <>
                    <Bell className="h-4 w-4 mr-2" />
                    Enable
                  </>
                )}
              </Button>
            )}
          </div>

          <Separator />

          <div className="space-y-3">
            <Label className="text-base font-medium">You'll be notified about:</Label>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span>New likes on your posts</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span>New comments on your posts</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-500" />
                <span>When someone mentions you</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-orange-500" />
                <span>New followers</span>
              </div>
            </div>
          </div>

          {permissionState === 'denied' && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>To enable notifications:</strong>
              </p>
              <ol className="text-sm text-yellow-700 mt-2 space-y-1 list-decimal list-inside">
                <li>Click the lock or info icon in your browser's address bar</li>
                <li>Change notification permission to "Allow"</li>
                <li>Refresh this page and try again</li>
              </ol>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
