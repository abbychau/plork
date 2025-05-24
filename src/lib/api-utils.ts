/**
 * Utility functions for API requests
 */

/**
 * Make an authenticated fetch request with credentials included
 * @param url URL to fetch
 * @param options Fetch options
 * @returns Fetch response
 */
export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  // Always include credentials to send cookies with the request
  const fetchOptions: RequestInit = {
    ...options,
    credentials: 'include',
  };

  return fetch(url, fetchOptions);
}
