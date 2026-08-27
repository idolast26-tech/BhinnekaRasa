/**
 * Wrapper for all admin API calls.
 * Automatically attaches the JWT token from localStorage.
 */
export function adminFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = localStorage.getItem('auth_token') || ''
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...(options.headers || {}),
    },
  })
}
