/**
 * Script to start the production server with the correct port
 * Checks if a build exists and builds if needed
 */
import { spawn, spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Try to read from .env.production file first, then .env
let envPort, envDomain;
try {
  // First check .env.production
  const prodEnvPath = path.resolve(process.cwd(), '.env.production');
  if (fs.existsSync(prodEnvPath)) {
    const envContent = fs.readFileSync(prodEnvPath, 'utf8');

    // Extract port
    const portMatch = envContent.match(/^PORT=(\d+)/m);
    if (portMatch && portMatch[1]) {
      envPort = portMatch[1];
    }

    // Extract domain name
    const domainMatch = envContent.match(/^DOMAIN_NAME=["']?([^"'\s]+)["']?/m);
    if (domainMatch && domainMatch[1]) {
      envDomain = domainMatch[1];
    }
  }

  // If not found, check .env
  if (!envPort || !envDomain) {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');

      // Extract port if not already found
      if (!envPort) {
        const portMatch = envContent.match(/^PORT=(\d+)/m);
        if (portMatch && portMatch[1]) {
          envPort = portMatch[1];
        }
      }

      // Extract domain name if not already found
      if (!envDomain) {
        const domainMatch = envContent.match(/^DOMAIN_NAME=["']?([^"'\s]+)["']?/m);
        if (domainMatch && domainMatch[1]) {
          envDomain = domainMatch[1];
        }
      }
    }
  }
} catch (error) {
  console.error('Error reading environment files:', error);
}

// Read port from environment variables with fallback to 8090
const port = envPort || process.env.PORT || process.env.SERVER_PORT || 8090;

// Read domain name from environment variables with fallback
const domainName = envDomain || process.env.DOMAIN_NAME || `localhost:${port}`;

// Check if a production build exists
const nextDir = path.join(process.cwd(), '.next');
const buildIdPath = path.join(nextDir, 'BUILD_ID');

if (!fs.existsSync(buildIdPath)) {
  console.log('No production build found. Running next build first...');

  // Run next build synchronously
  const buildResult = spawnSync('next', ['build'], {
    stdio: 'inherit',
    shell: true
  });

  // Check if build was successful
  if (buildResult.status !== 0) {
    console.error('Build failed. Please check the errors above.');
    process.exit(1);
  }

  console.log('Build completed successfully.');
}

console.log(`Starting production server on port ${port}...`);
console.log(`Domain name: ${domainName}`);

// Start the Next.js production server with the specified port
const nextStart = spawn('next', ['start', '-p', port], {
  stdio: 'inherit',
  shell: true
});

// Handle process exit
nextStart.on('close', (code) => {
  process.exit(code);
});
