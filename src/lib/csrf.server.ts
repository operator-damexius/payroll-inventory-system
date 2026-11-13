/**
 * CSRF protection - Server side.
 *
 * Uses double-submit cookie pattern:
 * - CSRF token stored in a cookie (httpOnly: false so JS can read it)
 * - Client must send the same token in the X-CSRF-Token header on state-changing requests
 * - Server verifies they match
 */

import { NextResponse } from "next/server"
import { cookies } from "next/headers"

const CSRF_COOKIE_NAME = "csrf_token"

export function setCsrfCookie(res: NextResponse): void {
  res.cookies.set(CSRF_COOKIE_NAME, generateCsrfToken(), {
    httpOnly: false, // JS needs to read it to send in header
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })
}

export function verifyCsrfToken(req: Request): { valid: boolean; needsCookie: boolean; response?: NextResponse } {
  const cookieStore = cookies()
  const csrfCookie = cookieStore.get(CSRF_COOKIE_NAME)?.value
  const csrfHeader = req.headers.get("x-csrf-token")

  // No cookie yet - this is the first request, allow it but indicate cookie needs to be set
  if (!csrfCookie) {
    return { valid: true, needsCookie: true }
  }

  // Cookie exists - validate the header matches
  if (!csrfHeader || csrfCookie !== csrfHeader) {
    return {
      valid: false,
      needsCookie: false,
      response: NextResponse.json({ error: "CSRF token missing or invalid" }, { status: 403 }),
    }
  }

  return { valid: true, needsCookie: false }
}

/**
 * Helper to wrap a route handler with CSRF protection and cookie setting.
 * Usage:
 *   return withCsrf(req, async () => {
 *     // ... your handler logic
 *     return NextResponse.json({ data })
 *   })
 */
export async function withCsrf(
  req: Request,
  handler: () => Promise<NextResponse>
): Promise<NextResponse> {
  const csrf = verifyCsrfToken(req)
  if (!csrf.valid) {
    return csrf.response!
  }
  const res = await handler()
  if (csrf.needsCookie) {
    setCsrfCookie(res)
  }
  return res
}

function generateCsrfToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("")
}
