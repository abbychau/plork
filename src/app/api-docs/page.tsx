'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Clipboard } from 'lucide-react';
import { getBaseUrl } from '@/lib/config';

export default function ApiDocsPage() {
  const { user } = useAuth();
  const [copied, setCopied] = useState('');
  const baseUrl = getBaseUrl();

  const handleCopy = (text: string, endpoint: string) => {
    navigator.clipboard.writeText(text);
    setCopied(endpoint);
    setTimeout(() => setCopied(''), 2000);
  };

  const endpoints = [
    {
      id: 'auth',
      name: 'Authentication',
      description: 'Endpoints for authentication and user management',
      apis: [
        {
          name: 'Get Current User',
          method: 'GET',
          path: '/api/auth/me',
          description: 'Get information about the currently authenticated user',
          authentication: 'Required',
          response: `{
  "id": "user_id",
  "username": "username",
  "displayName": "Display Name",
  "profileImage": "https://example.com/profile.jpg"
}`,
        },
      ],
    },
    {
      id: 'posts',
      name: 'Posts',
      description: 'Endpoints for managing posts',
      apis: [
        {
          name: 'Get Posts',
          method: 'GET',
          path: '/api/posts',
          description: 'Get posts for the timeline',
          authentication: 'Required',
          response: `[
  {
    "id": "post_id",
    "content": "Post content",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "author": {
      "id": "user_id",
      "username": "username",
      "displayName": "Display Name",
      "profileImage": "https://example.com/profile.jpg"
    },
    "likes": [...],
    "comments": [...]
  }
]`,
        },
        {
          name: 'Create Post',
          method: 'POST',
          path: '/api/posts',
          description: 'Create a new post',
          authentication: 'Required',
          request: `{
  "content": "Post content"
}`,
          response: `{
  "id": "post_id",
  "content": "Post content",
  "createdAt": "2023-01-01T00:00:00.000Z",
  "author": {
    "id": "user_id",
    "username": "username",
    "displayName": "Display Name"
  }
}`,
        },
        {
          name: 'Get Post by ID',
          method: 'GET',
          path: '/api/posts/[postId]',
          description: 'Get a specific post by ID',
          authentication: 'Required',
          response: `{
  "id": "post_id",
  "content": "Post content",
  "createdAt": "2023-01-01T00:00:00.000Z",
  "author": {
    "id": "user_id",
    "username": "username",
    "displayName": "Display Name"
  },
  "likes": [...],
  "comments": [...]
}`,
        },
      ],
    },
    {
      id: 'comments',
      name: 'Comments',
      description: 'Endpoints for managing comments',
      apis: [
        {
          name: 'Create Comment',
          method: 'POST',
          path: '/api/comments?postId=[postId]',
          description: 'Create a new comment on a post',
          authentication: 'Required',
          request: `{
  "content": "Comment content"
}`,
          response: `{
  "id": "comment_id",
  "content": "Comment content",
  "createdAt": "2023-01-01T00:00:00.000Z",
  "author": {
    "id": "user_id",
    "username": "username",
    "displayName": "Display Name"
  }
}`,
        },
      ],
    },
    {
      id: 'likes',
      name: 'Likes',
      description: 'Endpoints for managing likes',
      apis: [
        {
          name: 'Like Post',
          method: 'POST',
          path: '/api/posts/[postId]/like',
          description: 'Like a post',
          authentication: 'Required',
          response: `{
  "success": true
}`,
        },
        {
          name: 'Unlike Post',
          method: 'DELETE',
          path: '/api/posts/[postId]/like',
          description: 'Unlike a post',
          authentication: 'Required',
          response: `{
  "success": true
}`,
        },
      ],
    },
    {
      id: 'users',
      name: 'Users',
      description: 'Endpoints for user information',
      apis: [
        {
          name: 'Get User Profile',
          method: 'GET',
          path: '/api/users/[username]',
          description: 'Get information about a user',
          authentication: 'Optional',
          response: `{
  "id": "user_id",
  "username": "username",
  "displayName": "Display Name",
  "summary": "User bio",
  "profileImage": "https://example.com/profile.jpg",
  "followersCount": 10,
  "followingCount": 20,
  "postsCount": 30
}`,
        },
        {
          name: 'Follow User',
          method: 'POST',
          path: '/api/users/[username]/follow',
          description: 'Follow a user',
          authentication: 'Required',
          response: `{
  "success": true
}`,
        },
        {
          name: 'Unfollow User',
          method: 'DELETE',
          path: '/api/users/[username]/follow',
          description: 'Unfollow a user',
          authentication: 'Required',
          response: `{
  "success": true
}`,
        },
      ],
    },
    {
      id: 'api-keys',
      name: 'API Keys',
      description: 'Endpoints for managing API keys',
      apis: [
        {
          name: 'List API Keys',
          method: 'GET',
          path: '/api/api-keys',
          description: 'Get all API keys for the current user',
          authentication: 'Required',
          response: `[
  {
    "id": "key_id",
    "name": "Key name",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "lastUsed": "2023-01-02T00:00:00.000Z",
    "expiresAt": "2024-01-01T00:00:00.000Z"
  }
]`,
        },
        {
          name: 'Create API Key',
          method: 'POST',
          path: '/api/api-keys',
          description: 'Create a new API key',
          authentication: 'Required',
          request: `{
  "name": "Key name",
  "expiresAt": "2024-01-01T00:00:00.000Z" // Optional
}`,
          response: `{
  "id": "key_id",
  "name": "Key name",
  "key": "api_key_value", // Only returned once when created
  "createdAt": "2023-01-01T00:00:00.000Z",
  "expiresAt": "2024-01-01T00:00:00.000Z"
}`,
        },
        {
          name: 'Revoke API Key',
          method: 'DELETE',
          path: '/api/api-keys/[keyId]',
          description: 'Revoke an API key',
          authentication: 'Required',
          response: `{
  "success": true
}`,
        },
      ],
    },
  ];

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">API Documentation</h1>
      <p className="text-muted-foreground mb-6">
        Use these endpoints to interact with the Plork API programmatically.
      </p>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Authentication</CardTitle>
          <CardDescription>
            How to authenticate your API requests
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            There are two ways to authenticate with the Plork API:
          </p>
          
          <div className="space-y-2">
            <h3 className="font-medium">1. Cookie Authentication</h3>
            <p className="text-sm text-muted-foreground">
              When you're logged in through the web interface, your browser automatically sends cookies with your requests.
              This works for testing in the browser but isn't suitable for programmatic access.
            </p>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-medium">2. API Key Authentication</h3>
            <p className="text-sm text-muted-foreground">
              For programmatic access, use an API key in the Authorization header:
            </p>
            <div className="bg-muted p-3 rounded-md">
              <code className="text-sm">Authorization: Bearer YOUR_API_KEY</code>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 ml-2"
                onClick={() => handleCopy('Authorization: Bearer YOUR_API_KEY', 'auth-header')}
              >
                <Clipboard className="h-4 w-4" />
              </Button>
              {copied === 'auth-header' && (
                <span className="text-xs text-green-600 ml-2">Copied!</span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              You can create and manage API keys in your <a href="/settings" className="text-primary hover:underline">account settings</a>.
            </p>
          </div>

          <div className="space-y-2 mt-4">
            <h3 className="font-medium">Example Request (using curl)</h3>
            <div className="bg-muted p-3 rounded-md overflow-x-auto">
              <code className="text-sm whitespace-pre">
                curl -X GET "{baseUrl}/api/posts" \\
                  -H "Authorization: Bearer YOUR_API_KEY" \\
                  -H "Content-Type: application/json"
              </code>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 ml-2"
                onClick={() => handleCopy(`curl -X GET "${baseUrl}/api/posts" \\\n  -H "Authorization: Bearer YOUR_API_KEY" \\\n  -H "Content-Type: application/json"`, 'curl-example')}
              >
                <Clipboard className="h-4 w-4" />
              </Button>
              {copied === 'curl-example' && (
                <span className="text-xs text-green-600 ml-2">Copied!</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue={endpoints[0].id} className="w-full">
        <TabsList className="mb-4 flex flex-wrap">
          {endpoints.map(endpoint => (
            <TabsTrigger key={endpoint.id} value={endpoint.id}>
              {endpoint.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {endpoints.map(endpoint => (
          <TabsContent key={endpoint.id} value={endpoint.id}>
            <Card>
              <CardHeader>
                <CardTitle>{endpoint.name}</CardTitle>
                <CardDescription>
                  {endpoint.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {endpoint.apis.map((api, index) => (
                    <div key={index} className="border-b pb-6 last:border-b-0 last:pb-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 text-xs font-bold rounded ${
                          api.method === 'GET' ? 'bg-blue-100 text-blue-800' :
                          api.method === 'POST' ? 'bg-green-100 text-green-800' :
                          api.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {api.method}
                        </span>
                        <h3 className="text-lg font-medium">{api.name}</h3>
                      </div>
                      
                      <div className="mb-4">
                        <Label className="text-sm text-muted-foreground">Endpoint</Label>
                        <div className="flex items-center mt-1">
                          <Input
                            value={`${baseUrl}${api.path}`}
                            readOnly
                            className="font-mono text-sm"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            className="ml-2"
                            onClick={() => handleCopy(`${baseUrl}${api.path}`, `endpoint-${endpoint.id}-${index}`)}
                          >
                            <Clipboard className="h-4 w-4" />
                          </Button>
                          {copied === `endpoint-${endpoint.id}-${index}` && (
                            <span className="text-xs text-green-600 ml-2">Copied!</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <Label className="text-sm text-muted-foreground">Description</Label>
                          <p className="mt-1">{api.description}</p>
                        </div>
                        <div>
                          <Label className="text-sm text-muted-foreground">Authentication</Label>
                          <p className="mt-1">{api.authentication}</p>
                        </div>
                      </div>
                      
                      {api.request && (
                        <div className="mb-4">
                          <Label className="text-sm text-muted-foreground">Request Body</Label>
                          <pre className="mt-1 p-3 bg-muted rounded-md overflow-x-auto text-sm">
                            {api.request}
                          </pre>
                        </div>
                      )}
                      
                      <div>
                        <Label className="text-sm text-muted-foreground">Response</Label>
                        <pre className="mt-1 p-3 bg-muted rounded-md overflow-x-auto text-sm">
                          {api.response}
                        </pre>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
