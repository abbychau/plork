'use client';

import { useState, useEffect, Suspense } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clipboard, Send, Play } from 'lucide-react';

// Define endpoint categories and their APIs
const endpointCategories = [
  {
    id: 'auth',
    name: 'Authentication',
    endpoints: [
      {
        name: 'Get Current User',
        method: 'GET',
        path: '/api/auth/me',
        description: 'Get information about the currently authenticated user',
        requestBody: null
      }
    ]
  },
  {
    id: 'posts',
    name: 'Posts',
    endpoints: [
      {
        name: 'Get Posts',
        method: 'GET',
        path: '/api/posts',
        description: 'Get posts for the timeline',
        requestBody: null
      },
      {
        name: 'Create Post',
        method: 'POST',
        path: '/api/posts',
        description: 'Create a new post',
        requestBody: `{
  "content": "Post content"
}`
      },
      {
        name: 'Get Post by ID',
        method: 'GET',
        path: '/api/posts/{postId}',
        description: 'Get a specific post by ID',
        requestBody: null
      }
    ]
  },
  {
    id: 'comments',
    name: 'Comments',
    endpoints: [
      {
        name: 'Create Comment',
        method: 'POST',
        path: '/api/comments?postId={postId}',
        description: 'Create a new comment on a post',
        requestBody: `{
  "content": "Comment content"
}`
      }
    ]
  },
  {
    id: 'likes',
    name: 'Likes',
    endpoints: [
      {
        name: 'Like Post',
        method: 'POST',
        path: '/api/posts/{postId}/like',
        description: 'Like a post',
        requestBody: null
      },
      {
        name: 'Unlike Post',
        method: 'DELETE',
        path: '/api/posts/{postId}/like',
        description: 'Unlike a post',
        requestBody: null
      }
    ]
  },
  {
    id: 'users',
    name: 'Users',
    endpoints: [
      {
        name: 'Get User Profile',
        method: 'GET',
        path: '/api/users/{username}',
        description: 'Get information about a user',
        requestBody: null
      },
      {
        name: 'Follow User',
        method: 'POST',
        path: '/api/users/{username}/follow',
        description: 'Follow a user',
        requestBody: null
      },
      {
        name: 'Unfollow User',
        method: 'DELETE',
        path: '/api/users/{username}/follow',
        description: 'Unfollow a user',
        requestBody: null
      }
    ]
  },
  {
    id: 'api-keys',
    name: 'API Keys',
    endpoints: [
      {
        name: 'List API Keys',
        method: 'GET',
        path: '/api/api-keys',
        description: 'Get all API keys for the current user',
        requestBody: null
      },
      {
        name: 'Create API Key',
        method: 'POST',
        path: '/api/api-keys',
        description: 'Create a new API key',
        requestBody: `{
  "name": "Key name",
  "expiresAt": "2024-01-01T00:00:00.000Z" // Optional
}`
      },
      {
        name: 'Revoke API Key',
        method: 'DELETE',
        path: '/api/api-keys/{keyId}',
        description: 'Revoke an API key',
        requestBody: null
      }
    ]
  },
  {
    id: 'activitypub',
    name: 'ActivityPub',
    endpoints: [
      {
        name: 'WebFinger',
        method: 'GET',
        path: '/api/.well-known/webfinger?resource=acct:{username}@{domain}',
        description: 'Discover ActivityPub actors by username',
        requestBody: null
      },
      {
        name: 'Actor',
        method: 'GET',
        path: '/api/users/{username}',
        description: 'Get information about a user/actor in ActivityPub format',
        requestBody: null,
        headers: '{\n  "Accept": "application/activity+json"\n}'
      },
      {
        name: 'Inbox',
        method: 'POST',
        path: '/api/users/{username}/inbox',
        description: 'Endpoint for receiving ActivityPub activities',
        requestBody: `{
  "@context": "https://www.w3.org/ns/activitystreams",
  "id": "https://example.org/activities/1",
  "type": "Create",
  "actor": "https://example.org/users/otheruser",
  "object": {
    "id": "https://example.org/notes/1",
    "type": "Note",
    "content": "Hello from ActivityPub!",
    "attributedTo": "https://example.org/users/otheruser"
  }
}`,
        headers: '{\n  "Content-Type": "application/activity+json"\n}'
      },
      {
        name: 'Outbox',
        method: 'GET',
        path: '/api/users/{username}/outbox',
        description: 'Contains activities published by the user',
        requestBody: null,
        headers: '{\n  "Accept": "application/activity+json"\n}'
      },
      {
        name: 'Followers',
        method: 'GET',
        path: '/api/users/{username}/followers',
        description: 'List of users who follow this user',
        requestBody: null,
        headers: '{\n  "Accept": "application/activity+json"\n}'
      },
      {
        name: 'Following',
        method: 'GET',
        path: '/api/users/{username}/following',
        description: 'List of users this user follows',
        requestBody: null,
        headers: '{\n  "Accept": "application/activity+json"\n}'
      }
    ]
  }
];

// Client component that uses browser APIs
function ApiTesterContent() {
  const [selectedCategory, setSelectedCategory] = useState(endpointCategories[0].id);
  const [selectedEndpoint, setSelectedEndpoint] = useState(endpointCategories[0].endpoints[0]);
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('');
  const [headers, setHeaders] = useState('{\n  "Content-Type": "application/json"\n}');
  const [body, setBody] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [baseUrl, setBaseUrl] = useState('');
  const [pathParams, setPathParams] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState('');

  // Get the current domain/host when the component mounts
  useEffect(() => {
    // Use the current window location to determine the base URL
    const currentHost = window.location.host;
    const protocol = window.location.protocol;
    setBaseUrl(`${protocol}//${currentHost}`);
  }, []);

  // Update the selected endpoint when category changes
  useEffect(() => {
    const category = endpointCategories.find(c => c.id === selectedCategory);
    if (category && category.endpoints.length > 0) {
      setSelectedEndpoint(category.endpoints[0]);
    }
  }, [selectedCategory]);

  // Update form values when selected endpoint changes
  useEffect(() => {
    if (selectedEndpoint) {
      setMethod(selectedEndpoint.method);
      setUrl(selectedEndpoint.path);
      setBody(selectedEndpoint.requestBody || '');

      // Extract path parameters
      const paramMatches = selectedEndpoint.path.match(/{([^}]+)}/g) || [];
      const initialParams: Record<string, string> = {};
      paramMatches.forEach(match => {
        const param = match.replace(/{|}/g, '');
        initialParams[param] = '';
      });
      setPathParams(initialParams);

      // Set headers
      if (selectedEndpoint.headers) {
        setHeaders(selectedEndpoint.headers);
      } else {
        setHeaders('{\n  "Content-Type": "application/json"\n}');
      }
    }
  }, [selectedEndpoint]);

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(''), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResponse('');

    try {
      // Parse headers
      let headersObj = JSON.parse(headers);

      // Add API key to headers if provided
      if (apiKey) {
        headersObj = {
          ...headersObj,
          'Authorization': `Bearer ${apiKey}`
        };
      }

      // Prepare request options
      const options: RequestInit = {
        method,
        headers: headersObj,
      };

      // Add body for non-GET requests
      if (method !== 'GET' && body.trim()) {
        options.body = body;
      }

      // Replace path parameters in URL
      let processedUrl = url;
      Object.entries(pathParams).forEach(([key, value]) => {
        processedUrl = processedUrl.replace(`{${key}}`, value);
      });

      // Determine the full URL
      let fullUrl = processedUrl;

      // If the URL starts with a slash, it's a relative URL, so prepend the base URL
      if (processedUrl.startsWith('/')) {
        fullUrl = `${baseUrl}${processedUrl}`;
      } else if (!processedUrl.startsWith('http')) {
        // If it doesn't start with http, assume it's relative to the current domain
        fullUrl = `${baseUrl}/${processedUrl}`;
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
    } catch (error) {
      console.error('Error making request:', error);
      setResponse(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }, null, 2));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollArea className="h-full">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-3xl font-bold mb-2">API Tester</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Test the Plork API endpoints with your API key
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left column - Endpoint selection and parameters */}
          <div>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>API Endpoints</CardTitle>
                <CardDescription>
                  Select an endpoint to test
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="category" className="mb-2 block">Category</Label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {endpointCategories.map(category => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="endpoint" className="mb-2 block">Endpoint</Label>
                    <Select
                      value={selectedEndpoint?.name}
                      onValueChange={(value) => {
                        const category = endpointCategories.find(c => c.id === selectedCategory);
                        if (category) {
                          const endpoint = category.endpoints.find(e => e.name === value);
                          if (endpoint) {
                            setSelectedEndpoint(endpoint);
                          }
                        }
                      }}
                    >
                      <SelectTrigger id="endpoint">
                        <SelectValue placeholder="Select an endpoint" />
                      </SelectTrigger>
                      <SelectContent>
                        {endpointCategories
                          .find(c => c.id === selectedCategory)
                          ?.endpoints.map(endpoint => (
                            <SelectItem key={endpoint.name} value={endpoint.name}>
                              <span className={`inline-block w-14 text-xs font-bold mr-2 ${
                                endpoint.method === 'GET' ? 'text-blue-600' :
                                endpoint.method === 'POST' ? 'text-green-600' :
                                endpoint.method === 'PUT' ? 'text-yellow-600' :
                                'text-red-600'
                              }`}>
                                {endpoint.method}
                              </span>
                              {endpoint.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="apiKey" className="mb-2 block">API Key (Optional)</Label>
                    <Input
                      id="apiKey"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="Enter your API key"
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      If provided, will be sent as: Authorization: Bearer {apiKey || 'YOUR_API_KEY'}
                    </p>
                  </div>

                  {Object.keys(pathParams).length > 0 && (
                    <div className="space-y-3">
                      <Label className="mb-2 block">Path Parameters</Label>
                      {Object.entries(pathParams).map(([key, value]) => (
                        <div key={key}>
                          <Label htmlFor={`param-${key}`} className="text-sm mb-2 block">
                            {key}
                          </Label>
                          <Input
                            id={`param-${key}`}
                            value={value}
                            onChange={(e) => {
                              setPathParams(prev => ({
                                ...prev,
                                [key]: e.target.value
                              }));
                            }}
                            placeholder={`Enter ${key}`}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  <div>
                    <Label htmlFor="headers" className="mb-2 block">Headers (JSON)</Label>
                    <Textarea
                      id="headers"
                      value={headers}
                      onChange={(e) => setHeaders(e.target.value)}
                      rows={5}
                      className="font-mono text-sm"
                    />
                  </div>

                  {method !== 'GET' && selectedEndpoint?.requestBody && (
                    <div>
                      <Label htmlFor="body" className="mb-2 block">Request Body</Label>
                      <Textarea
                        id="body"
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        rows={8}
                        className="font-mono text-sm"
                      />
                    </div>
                  )}

                  <Button
                    type="submit"
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? 'Sending...' : 'Send Request'}
                    <Send className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right column - Response */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Response</CardTitle>
                <CardDescription>
                  {selectedEndpoint?.description || 'API response will appear here'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-bold rounded ${
                        method === 'GET' ? 'bg-blue-100 text-blue-800' :
                        method === 'POST' ? 'bg-green-100 text-green-800' :
                        method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {method}
                      </span>
                      <span className="text-sm font-mono truncate max-w-[300px]">
                        {url}
                      </span>
                    </div>
                    {url && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Replace path parameters in URL
                          let processedUrl = url;
                          Object.entries(pathParams).forEach(([key, value]) => {
                            processedUrl = processedUrl.replace(`{${key}}`, value || `{${key}}`);
                          });
                          handleCopy(`${baseUrl}${processedUrl.startsWith('/') ? '' : '/'}${processedUrl}`, 'url');
                        }}
                      >
                        <Clipboard className="h-4 w-4 mr-1" />
                        {copied === 'url' ? 'Copied!' : 'Copy URL'}
                      </Button>
                    )}
                  </div>

                  <div>
                    <Textarea
                      value={response}
                      readOnly
                      rows={20}
                      className="font-mono text-sm"
                      placeholder="Response will appear here after sending the request"
                    />
                  </div>

                  {response && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopy(response, 'response')}
                      className="w-full"
                    >
                      <Clipboard className="h-4 w-4 mr-1" />
                      {copied === 'response' ? 'Copied!' : 'Copy Response'}
                    </Button>
                  )}
                </div>
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
