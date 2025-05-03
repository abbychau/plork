# Plork ActivityPub

A social networking application built with Next.js that implements the ActivityPub protocol for federated social networking.

## Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher

## Getting Started

### Installation

```bash
# Clone the repository
git clone https://github.com/abbychau/plork.git
cd plork

# Install dependencies
npm install --legacy-peer-deps
```

### Environment Configuration

The application uses environment variables for configuration. Create a `.env` file in the root directory:

```bash
# Copy the example environment file
cp .env.example .env

# Edit the .env file to customize settings
# You can set the database path and server port
```

#### Firebase Setup for OAuth Authentication

1. Create a Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Add a web app to your Firebase project
3. Enable authentication providers in the Firebase console (Authentication > Sign-in method):
   - For Google authentication: Enable Google provider
   - For GitHub authentication:
     - Enable GitHub provider
     - Create a GitHub OAuth App at [GitHub Developer Settings](https://github.com/settings/developers)
     - Add the Firebase OAuth redirect URL to your GitHub OAuth App
     - Copy the Client ID and Client Secret from GitHub to Firebase
4. Copy your Firebase configuration values to the `.env` file:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

Available environment variables:

| Variable | Description | Default |
|----------|-------------|--------|
| `DATABASE_URL` | Path to the SQLite database | `file:./dev.db` |
| `PORT` | Server port for both development and production | `8090` |
| `DOMAIN_NAME` | Domain name for the application | `localhost:PORT` |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API key for Google authentication | - |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | - |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID | - |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket | - |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID | - |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID | - |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Firebase measurement ID (optional) | - |

### Database Setup

The application uses SQLite with Prisma ORM. To set up the database:

```bash
# Generate Prisma client
npx prisma generate

# Create and apply migrations to development database
npx prisma migrate dev --name init
```

### Development Server

Run the development server:

```bash
npm run dev
```

Open [http://localhost:8090](http://localhost:8090) with your browser to see the result.

## Database Management

### Creating Migrations

After making changes to the Prisma schema (prisma/schema.prisma), create a new migration:

```bash
npx prisma migrate dev --name your_migration_name
```

### Viewing Database

To explore the database with Prisma Studio:

```bash
npx prisma studio
```

## Production

### Building for Production

```bash
# Build the application
npm run build
```

### Database Setup for Production

1. edit .env.production and set the DATABASE_URL environment variable to point to the production database

```bash
# Apply migrations to production database
npx prisma migrate deploy
```

### Running Production Server

Create a `.env.production` file with your production settings:

```bash
# .env.production example
DATABASE_URL="file:./prod.db"
PORT=8090
```

Then start the production server:

```bash
# Build and start the production server
npm run build && npm run start

# Or use the combined command
npm run start:with-build

# Or just start (will build automatically if needed)
npm run start

# With environment variables (Windows PowerShell)
$env:DATABASE_URL="file:./prod.db"; $env:PORT=8090; npm run start

# With environment variables (Linux/macOS)
DATABASE_URL="file:./prod.db" PORT=8090 npm run start
```

The production server will be available at the configured port (default: [http://localhost:8090](http://localhost:8090)).

### Running as a Background Service with PM2

For production deployments, you can use PM2 to run the application as a background service:

1. First, install PM2 globally:

```bash
npm install -g pm2
```

2. Start the application using the provided PM2 configuration:

```bash
npm run start:pm2
```

3. Other PM2 commands:

```bash
# Stop the application
npm run stop:pm2

# Restart the application
npm run restart:pm2

# View logs
pm2 logs plork-activitypub

# Monitor the application
pm2 monit
```

4. To make PM2 start automatically on system boot (Windows):

```bash
# Install PM2 as a Windows service
pm2 install pm2-windows-service

# Set up the service
pm2-service-install

# Save the current PM2 configuration
pm2 save
```

## Project Structure

- `src/app`: Next.js app router pages and API routes
- `src/components`: React components
- `src/lib`: Utility functions and services
- `prisma`: Database schema and migrations

## Features

- Simplified authentication:
  - One-click sign in with Google
  - One-click sign in with GitHub
  - Automatic account creation for new users
- Create, edit, and delete posts
- Like and comment on posts
- Follow other users
- ActivityPub protocol implementation for federation
- Notifications for social interactions
- Hashtag support
- User profiles with avatars
- Tag cloud for popular topics

## Troubleshooting

### Common Issues

#### React Version Compatibility

If you encounter dependency conflicts with React 19, use the `--legacy-peer-deps` flag when installing:

```bash
npm install --legacy-peer-deps
```

#### Database Table Missing

If you see errors like `The table 'main.Notification' does not exist in the current database`, ensure you've run the migrations for the correct database:

```bash
# For development
npx prisma migrate dev

# For production
$env:DATABASE_URL="file:./prod.db"; npx prisma migrate deploy
```

#### Run Production Server

To run the production server, use the `start` script:

```bash
npm run start
```

#### Port Configuration

The default port is 8090, but you can specify a different port in several ways:

1. **Using environment variables** (recommended):

```bash
# In .env file for development
PORT=3000

# In .env.production file for production
PORT=3000

# Or directly in the command line (Windows)
$env:PORT=3000; npm run dev
$env:PORT=3000; npm run start

# Or directly in the command line (Linux/macOS)
PORT=3000 npm run dev
PORT=3000 npm run start
```

The application will automatically use the port specified in the environment variables.

## License

[MIT](https://choosealicense.com/licenses/mit/)
