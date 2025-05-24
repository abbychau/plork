# Core Principles & Architecture
- Application philosophy focuses on three core principles: 'Transparent logic', 'Mailbox like', and 'API'
- Feature a mailbox-like interface with 3 columns and a fixed-size app with a gray outline
- Implement fixed headers with scrollable content; layout settings (collapsed states and widths) stored in localStorage
- The application should be Fediverse compatible with ActivityPub compatibility
- Configure as a Progressive Web App (PWA) for mobile phone users (Android/iOS)

# UI Design & Theming
- Use mynaui icons and mail-reference styling for buttons and tags
- Replace plain gray background with an attractive CSS grid background for both dark and light themes
- User created custom MonokaiPro theme with both light/dark versions as a selectable option
- Dark mode should be the default theme with a toggle button on landing page and main app (next to notification bell)
- Make loading screens more smooth and attractive rather than using simple text
- The CSS transform 'translate-x-[-50%] translate-y-[-50%]' causes dialogs to be cut off on mobile devices but is needed for normal desktop views
- User prefers monospaced fonts for code/data fields and syntax highlighting for JSON content
- Add icons for different page titles in the application.
- When title matches the format '@username', display the user's avatar instead of an icon.

# Mobile Optimization
- On mobile phones, remove outer padding and inner round corners from the UI
- Ensure edit boxes and post buttons are fully visible in narrow views
- Fix 'create a new post' modal being covered by keyboard on mobile
- Fix iPhone's bottom home bar overlapping with the app's mobile navigation bar

# Navigation & Layout
- Implement Nav component with isCollapsed prop and links array for navbar styling
- Rename 'profile' to 'myposts' (My Posts) in the UI
- Add 'Liked' link below 'My Posts' with corresponding timeline API functionality
- Settings page should have navigation tabs on the left side instead of at the top
- When a user is already logged in, redirect directly to the app instead of showing the landing page
- Notification bell should be visible when the sidebar is collapsed

# Post Functionality
- Implement like/comment/share functionality; 'Share' copies post permalink
- Implement editable posts and comments using the markdown editor with emoji selector
- Implement hashtag support with backend full-text search filtering
- Implement YouTube link rendering with in-app preview and icon buttons
- Implement 'create post' as a modal instead of a new page
- Show all post tags when users click on the '+X more' button in the post list

# User Experience
- Implement infinite scrolling on timeline and explore pages
- Implement CTRL+ENTER to submit in the editor
- Post interaction buttons should be icon-only with counts and black icons
- Comment edit buttons should always be visible instead of only showing on hover
- Set browser title to show notification count and display name
- Add a refresh button in desktop view to load new posts
- When scrolling reaches the end of content, show blank areas instead of propagating scroll to parent views or body.

# User Profiles & Social Features
- Implement image upload for user avatars, cropping to a square and resizing to 300x300
- Implement a user profile popover with pinned users in the left column (limit to 5, LRU)
- Implement a notification system for social interactions, clearing counts on read
- Store last read timestamps for user-to-user and timeline interactions to track unread content

# Search & Tags
- Implement tag cloud functionality, showing only 'Trending Now' section when no tag is selected
- Implement search functionality using full-text search indexes
- Replace 'Search' nav menu with 'Tags' that shows posts by tag, includes tag search with autocomplete

# Authentication & API
- Implement OAuth-only registration (Google/GitHub) without separate account creation form
- Allow login with either username or email (with '@' indicating email input)
- Disallow '@' characters in usernames and require email during registration
- Implement API key management for users with documentation explaining endpoints
- Include Authorization headers in API requests, displayed in monospaced font with specific formatting