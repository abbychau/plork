'use client';

import { useState, useEffect, Suspense } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Client component that uses browser APIs
function ApiTesterContent() {
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('');
  const [headers, setHeaders] = useState('{\n  "Accept": "application/activity+json"\n}');
  const [body, setBody] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('request');
  const [baseUrl, setBaseUrl] = useState('');

  // Get the current domain/host when the component mounts
  useEffect(() => {
    // Use the current window location to determine the base URL
    const currentHost = window.location.host;
    const protocol = window.location.protocol;
    setBaseUrl(`${protocol}//${currentHost}`);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResponse('');

    try {
      // Parse headers
      const headersObj = JSON.parse(headers);

      // Prepare request options
      const options: RequestInit = {
        method,
        headers: headersObj,
      };

      // Add body for non-GET requests
      if (method !== 'GET' && body.trim()) {
        options.body = body;
      }

      // Determine the full URL
      let fullUrl = url;

      // If the URL starts with a slash, it's a relative URL, so prepend the base URL
      if (url.startsWith('/')) {
        fullUrl = `${baseUrl}${url}`;
      } else if (!url.startsWith('http')) {
        // If it doesn't start with http, assume it's relative to the current domain
        fullUrl = `${baseUrl}/${url}`;
      }

      // Make the request
      const response = await fetch(fullUrl, options);

      // Get response headers
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      // Get response body
      let responseBody: any;
      const contentType = response.headers.get('content-type') || '';

      if (contentType.includes('application/json') || contentType.includes('activity+json')) {
        responseBody = await response.json();
      } else {
        responseBody = await response.text();
      }

      // Format response
      const formattedResponse = JSON.stringify({
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
        body: responseBody,
      }, null, 2);

      setResponse(formattedResponse);
      setActiveTab('response');
    } catch (error) {
      console.error('Error making request:', error);
      setResponse(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }, null, 2));
    } finally {
      setIsLoading(false);
    }
  };

  const handlePresetSelect = (preset: string) => {
    // Extract domain from baseUrl (remove protocol)
    const domain = baseUrl.replace(/^https?:\/\//, '');

    switch (preset) {
      case 'webfinger':
        setMethod('GET');
        setUrl(`/api/.well-known/webfinger?resource=acct:username@${domain}`);
        setHeaders('{\n  "Accept": "application/json"\n}');
        setBody('');
        break;
      case 'actor':
        setMethod('GET');
        setUrl('/api/users/username');
        setHeaders('{\n  "Accept": "application/activity+json"\n}');
        setBody('');
        break;
      case 'inbox':
        setMethod('POST');
        setUrl('/api/users/username/inbox');
        setHeaders('{\n  "Content-Type": "application/activity+json"\n}');
        setBody(`{\n  "@context": "https://www.w3.org/ns/activitystreams",\n  "id": "${baseUrl}/activities/1",\n  "type": "Create",\n  "actor": "${baseUrl}/users/otheruser",\n  "object": {\n    "id": "${baseUrl}/notes/1",\n    "type": "Note",\n    "content": "Hello from ActivityPub!",\n    "attributedTo": "${baseUrl}/users/otheruser"\n  }\n}`);
        break;
      case 'outbox':
        setMethod('GET');
        setUrl('/api/users/username/outbox');
        setHeaders('{\n  "Accept": "application/activity+json"\n}');
        setBody('');
        break;
      case 'followers':
        setMethod('GET');
        setUrl('/api/users/username/followers');
        setHeaders('{\n  "Accept": "application/activity+json"\n}');
        setBody('');
        break;
      case 'following':
        setMethod('GET');
        setUrl('/api/users/username/following');
        setHeaders('{\n  "Accept": "application/activity+json"\n}');
        setBody('');
        break;
      default:
        break;
    }
  };

  return (
    <ScrollArea className="h-full">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-2">ActivityPub API Tester</h1>
        <p className="text-sm text-muted-foreground mb-2">Using domain: <code className="bg-muted px-1 py-0.5 rounded">{baseUrl}</code></p>
        <div className="p-4 border rounded-md bg-muted/20 mb-6">
          <h3 className="font-medium mb-2">How to use this tester:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Select a preset from the dropdown or enter a custom URL</li>
            <li>Replace <code className="bg-muted px-1 py-0.5 rounded">username</code> with a real username</li>
            <li>Modify headers and body as needed</li>
            <li>Click "Send Request" to test the API</li>
            <li>View the response in the Response tab</li>
          </ol>
          <p className="text-xs mt-2 text-muted-foreground">Note: For relative URLs (starting with /), the current domain will be automatically prepended.</p>
          <p className="text-xs mt-1 text-muted-foreground">Important: All ActivityPub endpoints are under the <code className="bg-muted px-1 py-0.5 rounded">/api/</code> path prefix.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>API Request</CardTitle>
          <CardDescription>
            Test ActivityPub endpoints with custom requests
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-4 items-start">
              <div className="w-1/4">
                <label className="block text-sm font-medium mb-1">Presets</label>
                <Select onValueChange={handlePresetSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a preset" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="webfinger">WebFinger</SelectItem>
                    <SelectItem value="actor">Actor</SelectItem>
                    <SelectItem value="inbox">Inbox (POST)</SelectItem>
                    <SelectItem value="outbox">Outbox</SelectItem>
                    <SelectItem value="followers">Followers</SelectItem>
                    <SelectItem value="following">Following</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="w-1/4">
                <label className="block text-sm font-medium mb-1">Method</label>
                <Select value={method} onValueChange={setMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="HTTP Method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GET">GET</SelectItem>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="DELETE">DELETE</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1">
                <label htmlFor="url" className="block text-sm font-medium mb-1">URL</label>
                <Input
                  id="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.org/users/username"
                  required
                />
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="request">Request</TabsTrigger>
                <TabsTrigger value="response">Response</TabsTrigger>
              </TabsList>

              <TabsContent value="request" className="space-y-4">
                <div>
                  <label htmlFor="headers" className="block text-sm font-medium mb-1">Headers (JSON)</label>
                  <Textarea
                    id="headers"
                    value={headers}
                    onChange={(e) => setHeaders(e.target.value)}
                    rows={5}
                    className="font-mono text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="body" className="block text-sm font-medium mb-1">
                    Body {method === 'GET' && '(ignored for GET requests)'}
                  </label>
                  <Textarea
                    id="body"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={10}
                    className="font-mono text-sm"
                    disabled={method === 'GET'}
                  />
                </div>
              </TabsContent>

              <TabsContent value="response">
                <div>
                  <label htmlFor="response" className="block text-sm font-medium mb-1">Response</label>
                  <Textarea
                    id="response"
                    value={response}
                    readOnly
                    rows={20}
                    className="font-mono text-sm"
                    placeholder="Response will appear here after sending the request"
                  />
                </div>
              </TabsContent>
            </Tabs>
          </form>
        </CardContent>

        <CardFooter className="flex justify-end">
          <Button type="submit" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send Request'}
          </Button>
        </CardFooter>
      </Card>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">ActivityPub Endpoints</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>WebFinger</CardTitle>
              <CardDescription>/api/.well-known/webfinger?resource=acct:username@domain</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Used for discovering ActivityPub actors by their username. Use the "WebFinger" preset to test with your current domain.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actor</CardTitle>
              <CardDescription>/api/users/username</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Returns information about a user/actor in ActivityPub format.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Inbox</CardTitle>
              <CardDescription>/api/users/username/inbox</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Endpoint for receiving ActivityPub activities from other servers.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Outbox</CardTitle>
              <CardDescription>/api/users/username/outbox</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Contains activities published by the user.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Followers</CardTitle>
              <CardDescription>/api/users/username/followers</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                List of users who follow this user.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Following</CardTitle>
              <CardDescription>/api/users/username/following</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                List of users this user follows.
              </p>
            </CardContent>
          </Card>
        </div>
        </div>
      </div>
    </ScrollArea>
  );
}

// Main page component with Suspense boundary
export default function ApiTesterPage() {
  return (
    <Suspense fallback={<div className="p-4">Loading API tester...</div>}>
      <ApiTesterContent />
    </Suspense>
  );
}
