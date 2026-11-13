/**
 * Standardized API response helpers.
 * Ensures consistent response format across all API routes.
 */

import { NextResponse } from "next/server"

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  details?: any
  message?: string
  total?: number
  page?: number
  limit?: number
  totalPages?: number
}

export function successResponse<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(
    { success: true, data },
    { status }
  )
}

export function errorResponse(
  message: string,
  status = 500,
  details?: any
): NextResponse {
  return NextResponse.json(
    { success: false, error: message, details },
    { status }
  )
}

export function createdResponse<T>(data: T): NextResponse {
  return NextResponse.json(
    { success: true, data },
    { status: 201 }
  )
}

export function notFoundResponse(message = "Resource not found"): NextResponse {
  return NextResponse.json(
    { success: false, error: message },
    { status: 404 }
  )
}

export function unauthorizedResponse(message = "Unauthorized"): NextResponse {
  return NextResponse.json(
    { success: false, error: message },
    { status: 403 }
  )
}

export function validationErrorResponse(details: any): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: "Validation failed",
      details,
    },
    { status: 400 }
  )
}

export function paginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): NextResponse {
  return NextResponse.json({
    success: true,
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  })
}
