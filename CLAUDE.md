# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Plork is an ActivityPub-compliant social networking platform (m2np.com) built with Next.js 15, React 19, and TypeScript. It implements the ActivityPub protocol for federated social networking with features like posts, comments, likes, follows, hashtags, and push notifications.

## Development Commands

```bash
# Development
npm run dev                 # Start development server with custom start script
npm run build              # Build for production
npm run start              # Start production server with custom start script
npm run start:rebuild      # Rebuild and start production server

# Code Quality
npm run lint               # Run ESLint
npm run lint:fix          # Fix ESLint issues automatically

# PWA
npm run generate-pwa-icons # Generate PWA icons
npm run build:pwa         # Generate icons and build

# Windows Cache Clear
npm run clear-cache-windows # Clear Next.js cache on Windows
```

## Architecture

### Database Layer
- **Prisma ORM** with SQLite database
- Comprehensive ActivityPub models: User, Post, Comment, Like, Follow, InboxItem, OutboxItem
- Additional features: Notifications, CustomEmojis, ApiKeys, PushSubscriptions, PinnedUsers
- Database service layer in `src/lib/db.ts` with organized services:
  - `userService` - User CRUD, OAuth integration, authentication
  - `postService` - Posts with hashtag extraction, timeline feeds
  - `commentService` - Comments with relationships
  - `likeService` - Like/unlike functionality
  - `followService` - Follow relationships and requests
  - `activityPubService` - Inbox/outbox management
  - `apiKeyService` - API key generation and validation

### ActivityPub Implementation
- Full ActivityPub compliance with proper HTTP signatures
- Core utilities in `src/lib/activitypub.ts`
- Federated activities: Create, Follow, Accept, Like, Undo, Delete
- Actor objects (Person), Note objects with proper context
- Inbox/outbox pattern for activity distribution

### Authentication & Authorization
- Multi-provider auth: Local accounts, Google OAuth, GitHub OAuth
- Firebase Auth integration for OAuth providers
- Session-based authentication with API key support
- Context-based auth state management in `src/lib/auth-context.tsx`

### Frontend Architecture
- **Next.js 15** with App Router
- **React 19** with modern patterns
- **TypeScript** throughout
- **Tailwind CSS 4** for styling
- Component library using Radix UI primitives
- Progressive Web App (PWA) with offline support
- Push notifications with Firebase messaging

### Key Libraries & Integrations
- **Radix UI** - Accessible component primitives
- **Lucide React** & **MynaUI Icons** - Icon systems  
- **React Markdown** with syntax highlighting
- **Minio** - Object storage for file uploads
- **Web Push** - Browser push notifications
- **Firebase** - OAuth and messaging services
- **bcryptjs** - Password hashing
- **Zod** - Runtime type validation

### File Organization
- `src/app/` - Next.js App Router pages and API routes
- `src/components/` - Reusable React components + UI primitives
- `src/lib/` - Business logic, utilities, contexts, services
- `src/hooks/` - Custom React hooks
- `prisma/` - Database schema and migrations
- `scripts/` - Build and deployment utilities

### Development Patterns
- Service layer pattern for database operations
- Context providers for global state (auth, theme, pinned users)
- Custom hooks for complex state logic
- TypeScript interfaces for ActivityPub objects
- Comprehensive error handling with proper HTTP status codes

### Database Schema Highlights
- ActivityPub-compliant User model with cryptographic keys
- Posts with hashtag indexing and full-text capabilities
- Notification system with multiple trigger types
- Custom emoji system with user collections
- Push subscription management for web notifications
- Read state tracking for timeline features
- Pinned users for priority content