# Plork API Reference for Mobile Development

This document provides concrete examples of API endpoints, authentication methods, and response formats to use when implementing the Plork mobile application.

## Authentication Methods

### 1. OAuth Authentication Flow

#### Google Authentication

```
POST /api/auth/google
Content-Type: application/json

{
  "idToken": "firebase-id-token-from-google-auth",
  "displayName": "User's Display Name",
  "email": "user@example.com",
  "photoURL": "https://example.com/profile.jpg"
}
```

**Response:**
```json
{
  "id": "user_id_string",
  "username": "username",
  "displayName": "User's Display Name",
  "profileImage": "https://example.com/profile.jpg"
}
```

#### GitHub Authentication

```
POST /api/auth/github
Content-Type: application/json

{
  "idToken": "firebase-id-token-from-github-auth",
  "displayName": "User's Display Name",
  "email": "user@example.com",
  "photoURL": "https://example.com/profile.jpg"
}
```

**Response:**
```json
{
  "id": "user_id_string",
  "username": "username",
  "displayName": "User's Display Name",
  "profileImage": "https://example.com/profile.jpg"
}
```

### 2. API Key Authentication

API requests can be authenticated using either:

1. **Bearer Token in Authorization header:**
```
Authorization: Bearer your_api_key_here
```

2. **X-API-Key header:**
```
X-API-Key: your_api_key_here
```

## Core API Endpoints

### User Endpoints

#### Get Current User

```
GET /api/users/me
Authorization: Bearer your_api_key_here
```

**Response:**
```json
{
  "id": "user_id_string",
  "username": "username",
  "displayName": "User's Display Name",
  "profileImage": "https://example.com/profile.jpg",
  "summary": "User's bio text"
}
```

#### Get User Profile

```
GET /api/users/username
```

**Response:**
```json
{
  "id": "user_id_string",
  "username": "username",
  "displayName": "User's Display Name",
  "summary": "User bio",
  "profileImage": "https://example.com/profile.jpg",
  "followersCount": 10,
  "followingCount": 20,
  "postsCount": 30
}
```

#### Follow User

```
POST /api/users/username/follow
Authorization: Bearer your_api_key_here
```

**Response:**
```json
{
  "success": true
}
```

#### Unfollow User

```
DELETE /api/users/username/follow
Authorization: Bearer your_api_key_here
```

**Response:**
```json
{
  "success": true
}
```

### Post Endpoints

#### Get Timeline Posts

```
GET /api/posts
Authorization: Bearer your_api_key_here
```

**Response:**
```json
[
  {
    "id": "post_id_string",
    "content": "Post content with #hashtags and formatting",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "author": {
      "id": "user_id_string",
      "username": "username",
      "displayName": "User's Display Name",
      "profileImage": "https://example.com/profile.jpg"
    },
    "likes": [
      {
        "id": "like_id_string",
        "userId": "user_id_string",
        "user": {
          "id": "user_id_string",
          "username": "username"
        }
      }
    ],
    "comments": [
      {
        "id": "comment_id_string",
        "content": "Comment content",
        "createdAt": "2023-01-01T01:00:00.000Z",
        "author": {
          "id": "user_id_string",
          "username": "username",
          "displayName": "User's Display Name",
          "profileImage": "https://example.com/profile.jpg"
        }
      }
    ],
    "hashtags": "hashtag1,hashtag2"
  }
]
```

#### Create Post

```
POST /api/posts
Content-Type: application/json
Authorization: Bearer your_api_key_here

{
  "content": "Post content with #hashtags and formatting"
}
```

**Response:**
```json
{
  "id": "post_id_string",
  "content": "Post content with #hashtags and formatting",
  "createdAt": "2023-01-01T00:00:00.000Z",
  "author": {
    "id": "user_id_string",
    "username": "username",
    "displayName": "User's Display Name",
    "profileImage": "https://example.com/profile.jpg"
  }
}
```

#### Get Single Post

```
GET /api/posts/post_id_string
```

**Response:**
```json
{
  "id": "post_id_string",
  "content": "Post content with #hashtags and formatting",
  "createdAt": "2023-01-01T00:00:00.000Z",
  "author": {
    "id": "user_id_string",
    "username": "username",
    "displayName": "User's Display Name",
    "profileImage": "https://example.com/profile.jpg"
  },
  "likes": [...],
  "comments": [...]
}
```

#### Update Post

```
PUT /api/posts/post_id_string
Content-Type: application/json
Authorization: Bearer your_api_key_here

{
  "content": "Updated post content"
}
```

**Response:**
```json
{
  "id": "post_id_string",
  "content": "Updated post content",
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-02T00:00:00.000Z",
  "author": {
    "id": "user_id_string",
    "username": "username",
    "displayName": "User's Display Name",
    "profileImage": "https://example.com/profile.jpg"
  }
}
```

### Interaction Endpoints

#### Like a Post

```
POST /api/posts/post_id_string/likes
Authorization: Bearer your_api_key_here
```

**Response:**
```json
{
  "id": "like_id_string",
  "userId": "user_id_string",
  "postId": "post_id_string",
  "createdAt": "2023-01-01T00:00:00.000Z"
}
```

#### Unlike a Post

```
DELETE /api/posts/post_id_string/likes
Authorization: Bearer your_api_key_here
```

**Response:**
```json
{
  "success": true
}
```

#### Add Comment

```
POST /api/posts/post_id_string/comments
Content-Type: application/json
Authorization: Bearer your_api_key_here

{
  "content": "Comment content with formatting"
}
```

**Response:**
```json
{
  "id": "comment_id_string",
  "content": "Comment content with formatting",
  "createdAt": "2023-01-01T00:00:00.000Z",
  "author": {
    "id": "user_id_string",
    "username": "username",
    "displayName": "User's Display Name",
    "profileImage": "https://example.com/profile.jpg"
  },
  "postId": "post_id_string"
}
```

### API Key Management

#### List API Keys

```
GET /api/api-keys
Authorization: Bearer your_api_key_here
```

**Response:**
```json
[
  {
    "id": "key_id_string",
    "name": "Key name",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "lastUsed": "2023-01-02T00:00:00.000Z",
    "expiresAt": "2024-01-01T00:00:00.000Z"
  }
]
```

#### Create API Key

```
POST /api/api-keys
Content-Type: application/json
Authorization: Bearer your_api_key_here

{
  "name": "Mobile App Key",
  "expiresAt": "2024-01-01T00:00:00.000Z"
}
```

**Response:**
```json
{
  "id": "key_id_string",
  "name": "Mobile App Key",
  "key": "actual_api_key_value_only_shown_once",
  "createdAt": "2023-01-01T00:00:00.000Z",
  "expiresAt": "2024-01-01T00:00:00.000Z"
}
```

#### Revoke API Key

```
DELETE /api/api-keys/key_id_string
Authorization: Bearer your_api_key_here
```

**Response:**
```json
{
  "success": true
}
```

## Error Response Format

All API errors follow this format:

```json
{
  "error": "Error message describing what went wrong"
}
```

Common HTTP status codes:
- 400: Bad Request (invalid input)
- 401: Unauthorized (authentication required)
- 403: Forbidden (insufficient permissions)
- 404: Not Found (resource doesn't exist)
- 500: Internal Server Error (server-side issue)
