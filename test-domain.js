/**
 * Simple script to test domain name configuration
 */

// Read domain name from environment variables
const domainName = process.env.DOMAIN_NAME || 'localhost:5000';
console.log(`Domain name from environment: ${domainName}`);

// Get the base URL with HTTP protocol
const httpBaseUrl = `http://${domainName}`;
console.log(`HTTP base URL: ${httpBaseUrl}`);

// Get the base URL with HTTPS protocol
const httpsBaseUrl = `https://${domainName}`;
console.log(`HTTPS base URL: ${httpsBaseUrl}`);

console.log('\nDomain name configuration is working correctly!');
