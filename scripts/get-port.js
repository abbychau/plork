/**
 * Script to get the port from environment variables with a fallback
 * This is used in package.json scripts to ensure cross-platform compatibility
 */

// Read port from environment variables with fallback to 8090
const port = process.env.PORT || process.env.SERVER_PORT || 8090;

// Output just the port number
console.log(port);
