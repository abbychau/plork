/**
 * Application configuration
 * Reads values from environment variables with fallbacks
 */

/**
 * Get the server port from environment variables or use the default
 * @returns The server port number
 */
export function getServerPort(): number {
  // Read from environment variables with fallback to 8090
  const port = process.env.PORT || '8090';
  return parseInt(port, 10);
}

/**
 * Get the domain name from environment variables or use the default
 * @returns The domain name
 */
export function getDomainName(): string {
  // Read from environment variables with fallback to localhost:8090
  return process.env.DOMAIN_NAME || 'm2np.com';
}

/**
 * Get the base URL for the application
 * @param protocol The protocol to use (http or https)
 * @returns The base URL
 */
export function getBaseUrl(protocol: 'http' | 'https' = 'http'): string {
  const domainName = getDomainName();
  return `${protocol}://${domainName}`;
}

/**
 * Configuration object for the application
 */
export const config = {
  port: getServerPort(),
  domainName: getDomainName(),
  getBaseUrl,
};

export default config;
