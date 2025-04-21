'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clipboard, ExternalLink } from 'lucide-react';
import { getBaseUrl } from '@/lib/config';
import { useToast } from '@/components/ui/use-toast';
import { copyToClipboard } from '@/lib/clipboard';

export default function ActivityPubPage() {
  const { user } = useAuth();
  const [baseUrl, setBaseUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Get the base URL of the site from the config
    // Use the current protocol (http or https)
    const protocol = window.location.protocol === 'https:' ? 'https' : 'http';
    setBaseUrl(getBaseUrl(protocol));
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
      <div className="container max-w-4xl p-8">
      <h1 className="text-3xl font-bold mb-6">ActivityPub Information</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>What is ActivityPub?</CardTitle>
          <CardDescription>
            ActivityPub is a decentralized social networking protocol that powers the Fediverse.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            ActivityPub allows users on different servers to interact with each other, similar to how email works.
            This means you can follow and interact with users on other ActivityPub-compatible platforms like Mastodon,
            Pleroma, and others.
          </p>
          <p>
            This platform implements ActivityPub, making it part of the Fediverse - a network of interconnected servers
            running on open protocols.
          </p>
        </CardContent>
      </Card>

      <Tabs defaultValue="endpoints" className="mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="endpoints">ActivityPub Endpoints</TabsTrigger>
          <TabsTrigger value="testing">Testing Tools</TabsTrigger>
        </TabsList>

        <TabsContent value="endpoints">
          <Card>
            <CardHeader>
              <CardTitle>Your ActivityPub Endpoints</CardTitle>
              <CardDescription>
                These are the endpoints that other ActivityPub servers can use to interact with your account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {user ? (
                <>
                  <div>
                    <h3 className="text-sm font-medium mb-2">WebFinger</h3>
                    <div className="flex items-center gap-2">
                      <Input
                        value={`${baseUrl}/.well-known/webfinger?resource=acct:${user.username}@${baseUrl.replace(/^https?:\/\//, '')}`}
                        readOnly
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleCopy(`${baseUrl}/.well-known/webfinger?resource=acct:${user.username}@${baseUrl.replace(/^https?:\/\//, '')}`)}
                      >
                        <Clipboard className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-2">Profile</h3>
                    <div className="flex items-center gap-2">
                      <Input
                        value={`${baseUrl}/users/${user.username}`}
                        readOnly
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleCopy(`${baseUrl}/users/${user.username}`)}
                      >
                        <Clipboard className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-2">Inbox</h3>
                    <div className="flex items-center gap-2">
                      <Input
                        value={`${baseUrl}/api/users/${user.username}/inbox`}
                        readOnly
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleCopy(`${baseUrl}/api/users/${user.username}/inbox`)}
                      >
                        <Clipboard className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-2">Outbox</h3>
                    <div className="flex items-center gap-2">
                      <Input
                        value={`${baseUrl}/api/users/${user.username}/outbox`}
                        readOnly
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleCopy(`${baseUrl}/api/users/${user.username}/outbox`)}
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
        </TabsContent>

        <TabsContent value="testing">
          <Card>
            <CardHeader>
              <CardTitle>ActivityPub Testing Tools</CardTitle>
              <CardDescription>
                Use these tools to test ActivityPub functionality.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">WebFinger Tester</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Test WebFinger discovery for your account.
                </p>
                <Button asChild variant="outline">
                  <a href="https://webfinger.net/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                    Open WebFinger Tester <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>How to Connect</CardTitle>
          <CardDescription>
            Connect with users on other ActivityPub servers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            To follow someone from another server, use their full ActivityPub address:
          </p>
          <div className="bg-muted p-3 rounded-md mb-4">
            <code>username@m2np.com</code>
          </div>
          <p>
            For example, to follow a Mastodon user with the username &quot;user&quot; on mastodon.social,
            you would enter: <code>user@mastodon.social</code>
          </p>
        </CardContent>
      </Card>
      </div>
    </ScrollArea>
  );
}
