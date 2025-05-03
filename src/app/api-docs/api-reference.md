# Plork ActivityPub API Documentation

## Overview

This document provides comprehensive documentation for the Plork ActivityPub API. Plork is a social platform that implements ActivityPub protocol for federated social networking.

## Authentication

Most API endpoints require authentication. Authentication is handled through cookies:
- `userId` cookie must be present for authenticated requests

## Base URL

All API endpoints are relative to your domain, e.g., `https://yourdomain.com/api/`

## API Endpoints

### Users

#### Get All Users

```
GET /api/users
```

Retrieves a list of users with pagination and search functionality.

**Query Parameters:**
- `search` (optional): Filter users by username or display name
- `limit` (optional): Number of results to return (default: 20)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
```json
[
  {
    "id": "string",
    "username": "string",
    "displayName": "string",
    "summary": "string",
    "profileImage": "string",
    "actorUrl": "string",
    "followersCount": 0,
    "followingCount": 0,
    "postsCount": 0
  }
]
```

#### Get User Profile

```
GET /api/users/[username]
```

Retrieves a specific user's profile information.

**Parameters:**
- `username`: Username of the user to retrieve

**Response:**
```json
{
  "id": "string",
  "username": "string",
  "displayName": "string",
  "summary": "string",
  "profileImage": "string",
  "actorUrl": "string",
  "followersCount": 0,
  "followingCount": 0,
  "postsCount": 0
}
```

#### Update User Profile

```
PUT /api/users/profile
```

Updates the authenticated user's profile.

**Request Body:**
```json
{
  "displayName": "string",
  "summary": "string"
}
```

**Response:** Updated user object

#### Follow a User

```
POST /api/users/[username]/follow
```

Follow or unfollow a user.

**Parameters:**
- `username`: Username of the user to follow

**Request Body:**
```json
{
  "action": "follow" | "unfollow"
}
```

**Response:**
```json
{
  "success": true
}
```

#### Check Follow Status

```
GET /api/users/[username]/follow-status
```

Check if the authenticated user is following another user.

**Parameters:**
- `username`: Username to check

**Response:**
```json
{
  "isFollowing": true | false
}
```

#### Check Pin Status

```
GET /api/users/[username]/pin-status
```

Check if a user is pinned by the authenticated user.

**Parameters:**
- `username`: Username to check

**Response:**
```json
{
  "isPinned": true | false
}
```

#### Get User Followers

```
GET /api/users/[username]/followers
```

Get a list of users who follow a specific user.

**Parameters:**
- `username`: Username whose followers to retrieve
- `limit` (query, optional): Number of results (default: 20)
- `offset` (query, optional): Pagination offset (default: 0)

#### Get User Following

```
GET /api/users/[username]/following
```

Get a list of users that a specific user follows.

**Parameters:**
- `username`: Username whose following to retrieve
- `limit` (query, optional): Number of results (default: 20)
- `offset` (query, optional): Pagination offset (default: 0)

#### Search Users

```
GET /api/users/search
```

Search for users by username or display name.

**Query Parameters:**
- `q`: Search query
- `limit` (optional): Number of results (default: 20)
- `offset` (optional): Pagination offset (default: 0)

### Posts

#### Get Timeline Posts

```
GET /api/posts
```

Get posts for the authenticated user's timeline.

**Query Parameters:**
- `username` (optional): If provided, get posts for a specific user
- `limit` (optional): Number of posts to return (default: 20)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
```json
[
  {
    "id": "string",
    "content": "string",
    "createdAt": "string",
    "author": {
      "id": "string",
      "username": "string",
      "displayName": "string",
      "profileImage": "string"
    },
    "likesCount": 0,
    "commentsCount": 0,
    "isLiked": true | false
  }
]
```

#### Create Post

```
POST /api/posts
```

Create a new post.

**Request Body:**
```json
{
  "content": "string"
}
```

**Response:** The created post object

#### Get Single Post

```
GET /api/posts/[postId]
```

Get a specific post by ID.

**Parameters:**
- `postId`: ID of the post to retrieve

**Response:** Post object

#### Delete Post

```
DELETE /api/posts/[postId]
```

Delete a specific post (only allowed for own posts).

**Parameters:**
- `postId`: ID of the post to delete

#### Get Post Comments

```
GET /api/posts/[postId]/comments
```

Get comments for a specific post.

**Parameters:**
- `postId`: ID of the post
- `limit` (query, optional): Number of comments (default: 20)
- `offset` (query, optional): Pagination offset (default: 0)

#### Add Comment

```
POST /api/posts/[postId]/comments
```

Add a comment to a post.

**Parameters:**
- `postId`: ID of the post to comment on

**Request Body:**
```json
{
  "content": "string"
}
```

#### Like/Unlike Post

```
POST /api/posts/[postId]/likes
```

Like or unlike a post.

**Parameters:**
- `postId`: ID of the post

**Request Body:**
```json
{
  "action": "like" | "unlike"
}
```

### Notifications

#### Get Notifications

```
GET /api/users/notifications
```

Get notifications for the authenticated user.

**Query Parameters:**
- `limit` (optional): Number of notifications (default: 20)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
```json
[
  {
    "id": "string",
    "type": "like" | "comment" | "follow",
    "read": true | false,
    "createdAt": "string",
    "actor": {
      "id": "string",
      "username": "string",
      "displayName": "string",
      "profileImage": "string"
    },
    "post": {
      "id": "string",
      "content": "string"
    }
  }
]
```

#### Get Unread Count

```
GET /api/users/unread-count
```

Get count of unread notifications for the authenticated user.

**Response:**
```json
{
  "count": 0
}
```

#### Mark Notifications as Read

```
POST /api/users/read-state
```

Mark notifications as read.

**Request Body:**
```json
{
  "notificationIds": ["string"]
}
```

### File Upload

#### Upload Image

```
POST /api/upload
```

Upload an image file.

**Request Body:**
- Form data with `file` field containing the image file

**Supported File Types:**
- JPEG
- PNG
- GIF
- WebP

**Response:**
```json
{
  "url": "/uploads/filename.jpg"
}
```

**Notes:**
- Images are automatically processed and resized to 300x300 pixels
- Maximum file size: 10MB

### Tags

#### Suggest Tags

```
GET /api/tags/suggest
```

Get tag suggestions based on partial input.

**Query Parameters:**
- `q`: Partial tag text to search for

**Response:**
```json
[
  {
    "name": "string",
    "count": 0
  }
]
```

### ActivityPub Endpoints

Plork implements ActivityPub protocol with the following endpoints:

#### User Inbox

```
POST /api/users/[username]/inbox
```

ActivityPub inbox for receiving activities directed at a user.

#### User Outbox

```
GET /api/users/[username]/outbox
```

ActivityPub outbox for displaying activities originating from a user.

## Response Codes

- `200 OK`: Request succeeded
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

## API Limits

- Default pagination: 20 items per page
- Maximum file upload size: 10MB

## Error Handling

All API errors follow a standard format:

```json
{
  "error": "Error message description"
}
```

---

This documentation provides a comprehensive overview of the Plork ActivityPub API. For specific implementation details or additional endpoints, please refer to the source code or contact the developers.