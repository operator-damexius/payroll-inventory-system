import jwt from "jsonwebtoken"
import { cookies } from "next/headers"

const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
  throw new Error("Please define the JWT_SECRET environment variable inside .env.local")
}

const secret = JWT_SECRET

export type JWTPayload = {
  userId: string
  email: string
  role: string
}

export type UserRole = "ADMIN" | "HR_PAYROLL" | "INVENTORY" | "EMPLOYEE"

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, secret, { expiresIn: "7d" })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, secret) as JWTPayload
  } catch {
    return null
  }
}

/**
 * Read the JWT from the httpOnly cookie and return the decoded payload,
 * or null if there is no valid session.
 */
export function getSession(): JWTPayload | null {
  const token = cookies().get("token")?.value
  if (!token) return null
  return verifyToken(token)
}

/**
 * Server-side authorization helper. Returns true if the user's role is
 * allowed to access the resource.
 */
export function isAllowed(userRole: UserRole | undefined, allowedRoles: UserRole[]): boolean {
  if (!userRole) return false
  return allowedRoles.includes(userRole)
}
