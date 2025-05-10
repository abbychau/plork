/**
 * Script to start the production server with the correct port
 * Checks if a build exists and builds if needed
 *
 * Arguments:
 *   --rebuild, -r: Delete the .next directory and force a rebuild
 */
import { spawn, spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Parse command line arguments
const args = process.argv.slice(2);
const shouldRebuild = args.includes('--rebuild') || args.includes('-r');

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

// If rebuild flag is set, delete the .next directory
if (shouldRebuild && fs.existsSync(nextDir)) {
  console.log('Rebuild flag detected. Deleting existing .next directory...');
  try {
    fs.rmSync(nextDir, { recursive: true, force: true });
    console.log('.next directory deleted successfully.');
  } catch (error) {
    console.error('Error deleting .next directory:', error);
    process.exit(1);
  }
}

if (!fs.existsSync(buildIdPath)) {
  const buildReason = shouldRebuild ? 'Rebuild requested.' : 'No production build found.';
  console.log(`${buildReason} Running next build...`);

  // Run next build synchronously with webpack (not turbopack)
  const buildResult = spawnSync('next', ['build'], {
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, NEXT_TURBO: 'false' }
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
  shell: true,
  env: { ...process.env, NEXT_TURBO: 'false' }
});

// Handle process exit
nextStart.on('close', (code) => {
  process.exit(code);
});
