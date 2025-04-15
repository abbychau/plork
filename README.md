# Plork ActivityPub

A social networking application built with Next.js that implements the ActivityPub protocol for federated social networking.

## Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher

## Getting Started

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/plork-activitypub.git
cd plork-activitypub

# Install dependencies
npm install --legacy-peer-deps
```

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

#### Handling Type Errors

The project is configured to ignore TypeScript type errors and ESLint warnings during build via `next.config.js`. This allows you to build and deploy even when there are type issues that need to be addressed.

If you want to enforce type checking during build, modify `next.config.js` to set:

```javascript
typescript: {
  ignoreBuildErrors: false,
},
eslint: {
  ignoreDuringBuilds: false,
},
```

### Database Setup for Production

```bash
# Set the DATABASE_URL environment variable to point to the production database
# On Windows PowerShell:
$env:DATABASE_URL="file:./prod.db"

# On Linux/macOS:
# export DATABASE_URL="file:./prod.db"

# Apply migrations to production database
npx prisma migrate deploy
```

### Running Production Server

```bash
# On Windows PowerShell:
$env:DATABASE_URL="file:./prod.db"; npx next start -p 8090

# On Linux/macOS:
# export DATABASE_URL="file:./prod.db" && npx next start -p 8090
```

The production server will be available at [http://localhost:8090](http://localhost:8090).

## Project Structure

- `src/app`: Next.js app router pages and API routes
- `src/components`: React components
- `src/lib`: Utility functions and services
- `prisma`: Database schema and migrations

## Features

- User authentication (register, login, logout)
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

#### Port Already in Use

If port 8090 is already in use, you can specify a different port:

```bash
# For development
npm run dev -- -p 3000

# For production
npx next start -p 3000
```

## License

[MIT](https://choosealicense.com/licenses/mit/)
