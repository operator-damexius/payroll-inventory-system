export type UserRole = "ADMIN" | "HR_PAYROLL" | "INVENTORY" | "EMPLOYEE"

export interface AuthUser {
  id: string
  email: string
  role: UserRole
  name?: string
}

export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}
