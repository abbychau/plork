'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export default function PWAInstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if the app is already installed
    const isAppInstalled = window.matchMedia('(display-mode: standalone)').matches;
    
    if (isAppInstalled) {
      return; // Don't show install prompt if already installed
    }

    // Store the install prompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      
      // Check if we should show the prompt (not shown in last 7 days)
      const lastPromptTime = localStorage.getItem('pwa-prompt-last-shown');
      const now = Date.now();
      
      if (!lastPromptTime || (now - parseInt(lastPromptTime)) > 7 * 24 * 60 * 60 * 1000) {
        setShowPrompt(true);
        localStorage.setItem('pwa-prompt-last-shown', now.toString());
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    
    // Show the install prompt
    await installPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const choiceResult = await installPrompt.userChoice;
    
    if (choiceResult.outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    
    // Clear the saved prompt since it can't be used twice
    setInstallPrompt(null);
    setShowPrompt(false);
  };

  const handleClose = () => {
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <Dialog open={showPrompt} onOpenChange={setShowPrompt}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Install Plork App</DialogTitle>
          <DialogDescription>
            Install Plork on your device for a better experience with offline support and faster loading.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2 py-4">
          <div className="rounded-full bg-primary p-2 text-primary-foreground">
            <Download className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium">Benefits of installing:</p>
            <ul className="text-sm text-muted-foreground list-disc pl-5 mt-1">
              <li>Works offline</li>
              <li>Faster loading</li>
              <li>Full-screen experience</li>
              <li>Home screen icon</li>
            </ul>
          </div>
        </div>
        <DialogFooter className="flex sm:justify-between">
          <Button variant="outline" onClick={handleClose}>
            Not Now
          </Button>
          <Button onClick={handleInstall}>
            <Download className="mr-2 h-4 w-4" />
            Install App
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
