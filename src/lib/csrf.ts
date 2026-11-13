/**
 * CSRF protection - Re-exports for convenience.
 *
 * Server-side: import from '@/lib/csrf.server'
 * Client-side: import from '@/lib/csrf.client'
 */

export { setCsrfCookie, verifyCsrfToken } from "@/lib/csrf.server"
export { getCsrfTokenFromCookie } from "@/lib/csrf.client"
