/**
 * Authentication wrapper for API routes.
 * Standardizes authentication and authorization checks across all API routes.
 *
 * Usage:
 *   export async function GET(req: Request) {
 *     return withAuth(req, async (session) => {
      await dbConnect()
      const data = await MyModel.find()
      return successResponse({ data })
    })
   */
import { NextResponse } from "next/server"
import { getSession, isAllowed } from "@/lib/auth"
import type { UserRole } from "@/types"
import { errorResponse } from "@/lib/api-response"

interface WithAuthOptions {
  allowedRoles?: UserRole[]
  requireAuth?: boolean
}

export async function withAuth(
  req: Request,
  handler: (session: { userId: string; email: string; role: string }) => Promise<NextResponse>,
  options: WithAuthOptions = {}
) {
  const { allowedRoles, requireAuth = true } = options

  const session = getSession()

  if (requireAuth && !session) {
    return errorResponse("Not authenticated. Please log in.", 401)
  }

  if (session && allowedRoles && !isAllowed(session.role as UserRole, allowedRoles)) {
    return errorResponse(
      "Unauthorized. Insufficient permissions.",
      403
    )
  }

  if (!session) {
    return errorResponse("Not authenticated.", 401)
  }

  return handler(session)
}

export function getAuthSession(req: Request) {
  const session = getSession()
  if (!session) {
    return { session: null, error: errorResponse("Not authenticated.", 401) }
  }
  return { session, error: null }
}
