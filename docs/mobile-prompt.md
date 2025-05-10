# Plork Mobile App Development Prompt

## Project Overview

Create a mobile application for Plork, a social networking platform that implements the ActivityPub protocol for federated social networking. The mobile app should maintain the core principles and functionality of the web application while providing a native mobile experience.

## Core Principles

1. **Transparent Logic**: Maintain clear, understandable application flow and user interactions
2. **Mailbox-like Interface**: Adapt the 3-column layout of the web app into a mobile-friendly format
3. **API-First**: Utilize Plork's RESTful API for all data operations
4. **Fediverse Compatible**: Support ActivityPub compatibility features

## Authentication Requirements

1. **OAuth Authentication**:
   - Implement Google and GitHub authentication using Firebase Authentication
   - No separate account creation form - use OAuth providers only
   - Automatically create accounts for new users upon first login
   - Store authentication tokens securely for API requests

2. **API Key Support**:
   - Include ability to use and manage API keys
   - Support both `Authorization: Bearer [token]` and `x-api-key` header formats
   - Securely store API keys on the device

## UI/UX Requirements

1. **Design System**:
   - Use a design system compatible with mynaui icons
   - Support both light and dark themes, including MonokaiPro theme variants
   - Implement a theme toggle button in a prominent location
   - Use monospaced fonts for code/data fields and syntax highlighting for JSON content

2. **Layout**:
   - For phones: Adapt the 3-column layout into a tab-based or swipeable interface
   - For tablets: Consider a split-view approach that shows more of the desktop layout
   - Ensure smooth transitions between views
   - Store layout preferences in device storage

3. **Navigation**:
   - Bottom navigation bar for primary sections (Timeline, Explore, My Posts, Liked, etc.)
   - Side drawer for additional options and settings
   - Ensure notification counts are visible in the navigation elements

## Post Functionality

1. **Viewing Posts**:
   - Implement infinite scrolling for timelines
   - Support for rendering markdown content
   - Embed YouTube previews when links are shared
   - Display post tags with option to see all tags
   - Show post interaction counts (likes, comments)

2. **Creating and Editing Posts**:
   - Rich text editor with markdown support
   - Emoji selector integration
   - Image upload capability
   - Hashtag support with autocomplete
   - Draft saving functionality

3. **Post Interactions**:
   - Like/unlike functionality
   - Comment creation and viewing
   - Share posts (generate and share permalinks)
   - Edit own posts and comments

## Social Features

1. **User Profiles**:
   - View user profiles with their posts
   - Profile image upload and cropping
   - Pin users (limit to 5, LRU)
   - Follow/unfollow functionality

2. **Notifications**:
   - Push notifications for social interactions
   - In-app notification center
   - Clear notification counts on read
   - Track unread content with timestamps

3. **Search & Discovery**:
   - Tag-based search with autocomplete
   - Full-text search for posts
   - Trending tags section
   - User search functionality

## API Integration

1. **Endpoints to Implement**:
   - Authentication: `/api/auth/google`, `/api/auth/github`, `/api/auth/logout`
   - User: `/api/users/me`, `/api/users/[username]`
   - Posts: `/api/posts`, `/api/posts/[postId]`
   - Interactions: `/api/likes`, `/api/comments`
   - API Keys: `/api/api-keys`

2. **Authentication Headers**:
   - Include proper authentication in all API requests
   - Support both cookie-based auth and API key auth
   - Handle token refresh and expiration

3. **Error Handling**:
   - Graceful error handling for API failures
   - Offline mode support where possible
   - Retry mechanisms for failed requests

## Technical Requirements

1. **Mobile Framework**:
   - Choose either React Native or Flutter for cross-platform development
   - Ensure the app works on both iOS and Android platforms

2. **State Management**:
   - Implement efficient state management for posts, user data, and authentication
   - Consider using Redux, MobX, or a similar state management library

3. **Performance Optimization**:
   - Lazy loading of images and content
   - Efficient caching strategies
   - Minimize network requests

4. **Security**:
   - Secure storage of authentication tokens
   - Implement proper HTTPS communication
   - Follow platform-specific security best practices

## Additional Features

1. **Offline Support**:
   - Cache viewed posts for offline reading
   - Queue created posts for sending when online
   - Indicate offline status to users

2. **Accessibility**:
   - Support screen readers
   - Implement proper contrast ratios
   - Support dynamic text sizes

3. **Localization**:
   - Prepare the app structure for future localization
   - Use string resources instead of hardcoded text

## Development Process

1. **Milestones**:
   - Authentication and user profile setup
   - Timeline and post viewing
   - Post creation and interaction
   - Social features and notifications
   - Search and discovery features
   - Polish and optimization

2. **Testing**:
   - Unit tests for core functionality
   - Integration tests for API communication
   - UI tests for critical user flows
   - Beta testing phase before release

3. **Documentation**:
   - Code documentation
   - API integration documentation
   - User guide for the mobile app

## Deliverables

1. Complete source code for the mobile application
2. Build files for iOS and Android platforms
3. Documentation for setup, configuration, and maintenance
4. User guide explaining app features and functionality

## References

- Plork web application codebase
- Plork API documentation
- ActivityPub protocol specification
- Mobile platform design guidelines (iOS Human Interface Guidelines, Material Design)
