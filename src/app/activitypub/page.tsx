'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

import { Clipboard, ExternalLink, Activity, Globe, Users } from 'lucide-react';
import { getBaseUrl } from '@/lib/config';
import { useToast } from '@/components/ui/use-toast';
import { copyToClipboard } from '@/lib/clipboard';
import logo from '@/app/favicon.svg';

export default function ActivityPubPage() {
  const { user } = useAuth();
  const [baseUrl, setBaseUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Get the base URL from the browser window location
    const protocol = window.location.protocol;
    const host = window.location.host;
    setBaseUrl(`${protocol}//${host}`);
    setIsMounted(true);
  }, []);

  const handleCopy = async (text: string) => {
    const success = await copyToClipboard(text);

    if (success) {
      setCopied(true);
      toast({
        title: "Copied to clipboard",
        description: "The URL has been copied to your clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast({
        title: "Failed to copy",
        description: "Could not copy the URL to clipboard",
        variant: "destructive"
      });
    }
  };

  return (
    <ScrollArea className="h-full">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center mb-4">
          <Link href="/" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mr-4">
            <img src={logo.src} alt="Plork" className="h-4 w-4 inline-block mr-1" />
            Back to Home
          </Link>
        </div>
        <h1 className="text-2xl font-bold mb-2">ActivityPub Information</h1>
        <p className="text-muted-foreground mb-6">
          Connect with users across the Fediverse using ActivityPub protocol
        </p>

      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          <div>
            <CardTitle>What is ActivityPub?</CardTitle>
            <CardDescription>
              ActivityPub is a decentralized social networking protocol that powers the Fediverse.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <Globe className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <h3 className="text-sm font-medium mb-1">Decentralized Communication</h3>
              <p className="text-sm text-muted-foreground">
                ActivityPub allows users on different servers to interact with each other, similar to how email works.
                This means you can follow and interact with users on other ActivityPub-compatible platforms like Mastodon,
                Pleroma, and others.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <h3 className="text-sm font-medium mb-1">Part of the Fediverse</h3>
              <p className="text-sm text-muted-foreground">
                This platform implements ActivityPub, making it part of the Fediverse - a network of interconnected servers
                running on open protocols. Your content can reach a wider audience beyond just this platform.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          <div>
            <CardTitle>Your ActivityPub Endpoints</CardTitle>
            <CardDescription>
              These are the endpoints that other ActivityPub servers can use to interact with your account.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {user ? (
            <>
              <div>
                <h3 className="text-sm font-medium mb-2">WebFinger</h3>
                <div className="flex items-center gap-2">
                  <Input
                    value={isMounted
                      ? `${baseUrl}/.well-known/webfinger?resource=acct:${user.username}@${baseUrl.replace(/^https?:\/\//, '')}`
                      : `/.well-known/webfinger?resource=acct:${user.username}@example.com`}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleCopy(isMounted
                      ? `${baseUrl}/.well-known/webfinger?resource=acct:${user.username}@${baseUrl.replace(/^https?:\/\//, '')}`
                      : `/.well-known/webfinger?resource=acct:${user.username}@example.com`)}
                  >
                    <Clipboard className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Profile</h3>
                <div className="flex items-center gap-2">
                  <Input
                    value={isMounted ? `${baseUrl}/users/${user.username}` : `/users/${user.username}`}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleCopy(isMounted ? `${baseUrl}/users/${user.username}` : `/users/${user.username}`)}
                  >
                    <Clipboard className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Inbox</h3>
                <div className="flex items-center gap-2">
                  <Input
                    value={isMounted ? `${baseUrl}/api/users/${user.username}/inbox` : `/api/users/${user.username}/inbox`}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleCopy(isMounted ? `${baseUrl}/api/users/${user.username}/inbox` : `/api/users/${user.username}/inbox`)}
                  >
                    <Clipboard className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Outbox</h3>
                <div className="flex items-center gap-2">
                  <Input
                    value={isMounted ? `${baseUrl}/api/users/${user.username}/outbox` : `/api/users/${user.username}/outbox`}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleCopy(isMounted ? `${baseUrl}/api/users/${user.username}/outbox` : `/api/users/${user.username}/outbox`)}
                  >
                    <Clipboard className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground mb-4">You need to be logged in to see your ActivityPub endpoints.</p>
              <Button asChild>
                <a href="/login">Log In</a>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          <div>
            <CardTitle>How to Connect</CardTitle>
            <CardDescription>
              Connect with users on other ActivityPub servers.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-sm font-medium mb-2">Following Users</h3>
            <p className="text-sm text-muted-foreground mb-4">
              To follow someone from another server, use their full ActivityPub address:
            </p>
            <div className="bg-muted p-3 rounded-md mb-4">
              <code className="font-mono">username@m2np.com</code>
            </div>
            <p className="text-sm text-muted-foreground">
              For example, to follow a Mastodon user with the username &quot;user&quot; on mastodon.social,
              you would enter: <code className="font-mono">user@mastodon.social</code>
            </p>
          </div>

          <div className="pt-2 border-t">
            <h3 className="text-sm font-medium mb-2">Testing Tools</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Use these tools to test ActivityPub functionality and verify your account is discoverable.
            </p>
            <Button asChild variant="outline" className="flex items-center gap-2">
              <a href="https://webfinger.net/" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-1" />
                WebFinger Tester
              </a>
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Enter your ActivityPub address (e.g., <code className="font-mono">{user ? user.username : 'username'}@{isMounted ? baseUrl.replace(/^https?:\/\//, '') : 'example.com'}</code>) to test discovery.
            </p>
          </div>
        </CardContent>
      </Card>
      </div>
    </ScrollArea>
  );
}
