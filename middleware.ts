import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
  throw new Error("Please define the JWT_SECRET environment variable inside .env.local")
}

const jwtSecret = JWT_SECRET as string

// Public routes that do not require authentication
const PUBLIC_ROUTES = ["/login", "/register", "/api/auth"]

// Role-based route access map
const ROUTE_ROLES: Record<string, string[]> = {
  "/employees": ["ADMIN", "HR_PAYROLL"],
  "/payroll": ["ADMIN", "HR_PAYROLL"],
  "/payroll-rules": ["ADMIN", "HR_PAYROLL"],
  "/inventory": ["ADMIN", "INVENTORY"],
  "/dashboard": ["ADMIN", "HR_PAYROLL", "INVENTORY", "EMPLOYEE"],
  "/fiscal-years": ["ADMIN", "HR_PAYROLL"],
  "/audit-logs": ["ADMIN", "HR_PAYROLL"],
  "/settings": ["ADMIN"],
}

function getUserRoleFromToken(token: string): string | null {
  try {
    const decoded = jwt.verify(token, jwtSecret) as { role?: string }
    return decoded.role || null
  } catch {
    return null
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public routes and static assets
  if (
    PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`)) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/"
  ) {
    return NextResponse.next()
  }

  const token = request.cookies.get("token")?.value

  // No session -> redirect to login
  if (!token) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Role-based access check using JWT (server-side decode of httpOnly cookie)
  const role = getUserRoleFromToken(token)
  for (const [prefix, allowedRoles] of Object.entries(ROUTE_ROLES)) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      if (!role || !allowedRoles.includes(role)) {
        return NextResponse.redirect(new URL("/unauthorized", request.url))
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
}
