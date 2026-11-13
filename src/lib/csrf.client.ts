/**
 * CSRF protection - Client side.
 *
 * Reads the CSRF token from the cookie set by the server.
 * Only works in browser environments.
 */

/**
 * Read CSRF token from cookie.
 */
export function getCsrfTokenFromCookie(): string | null {
  if (typeof document === "undefined") return null
  const match = document.cookie.match(
    /(?:^|; )csrf_token=([^;]*)/
  )
  return match ? match[1] : null
}
