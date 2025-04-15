'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ApiTesterPage() {
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('');
  const [headers, setHeaders] = useState('{\n  "Accept": "application/activity+json"\n}');
  const [body, setBody] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('request');

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
      
      // Make the request
      const response = await fetch(url, options);
      
      // Get response headers
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });
      
      // Get response body
      let responseBody;
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
    switch (preset) {
      case 'webfinger':
        setMethod('GET');
        setUrl('/.well-known/webfinger?resource=acct:username@localhost:8080');
        setHeaders('{\n  "Accept": "application/json"\n}');
        setBody('');
        break;
      case 'actor':
        setMethod('GET');
        setUrl('/users/username');
        setHeaders('{\n  "Accept": "application/activity+json"\n}');
        setBody('');
        break;
      case 'inbox':
        setMethod('POST');
        setUrl('/users/username/inbox');
        setHeaders('{\n  "Content-Type": "application/activity+json"\n}');
        setBody('{\n  "@context": "https://www.w3.org/ns/activitystreams",\n  "id": "https://example.org/activities/1",\n  "type": "Create",\n  "actor": "https://example.org/users/otheruser",\n  "object": {\n    "id": "https://example.org/notes/1",\n    "type": "Note",\n    "content": "Hello from ActivityPub!",\n    "attributedTo": "https://example.org/users/otheruser"\n  }\n}');
        break;
      case 'outbox':
        setMethod('GET');
        setUrl('/users/username/outbox');
        setHeaders('{\n  "Accept": "application/activity+json"\n}');
        setBody('');
        break;
      case 'followers':
        setMethod('GET');
        setUrl('/users/username/followers');
        setHeaders('{\n  "Accept": "application/activity+json"\n}');
        setBody('');
        break;
      case 'following':
        setMethod('GET');
        setUrl('/users/username/following');
        setHeaders('{\n  "Accept": "application/activity+json"\n}');
        setBody('');
        break;
      default:
        break;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">ActivityPub API Tester</h1>
      
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
              <CardDescription>/.well-known/webfinger?resource=acct:username@domain</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Used for discovering ActivityPub actors by their username.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Actor</CardTitle>
              <CardDescription>/users/username</CardDescription>
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
              <CardDescription>/users/username/inbox</CardDescription>
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
              <CardDescription>/users/username/outbox</CardDescription>
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
              <CardDescription>/users/username/followers</CardDescription>
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
              <CardDescription>/users/username/following</CardDescription>
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
  );
}
