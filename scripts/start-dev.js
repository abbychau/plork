/**
 * Script to start the development server with the correct port
 */
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

// Try to read from .env file first
let envPort, envDomain;
try {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');

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
} catch (error) {
  console.error('Error reading .env file:', error);
}

// Parse command line arguments
const args = process.argv.slice(2);
let cmdPort;

// Check for -p or --port flag
const portIndex = args.findIndex(arg => arg === '-p' || arg === '--port');
if (portIndex !== -1 && args[portIndex + 1]) {
  cmdPort = args[portIndex + 1];
}

// Read port from command line, environment variables with fallback to 5000
const port = cmdPort || envPort || process.env.PORT || process.env.SERVER_PORT || 5000;

// Read domain name from environment variables with fallback
const domainName = envDomain || process.env.DOMAIN_NAME || `localhost:${port}`;

console.log(`Starting development server on port ${port}...`);
console.log(`Domain name: ${domainName}`);

// Start the Next.js development server with the specified port
const nextDev = spawn('next', ['dev', '-p', port], {
  stdio: 'inherit',
  shell: true
});

// Handle process exit
nextDev.on('close', (code) => {
  process.exit(code);
});
