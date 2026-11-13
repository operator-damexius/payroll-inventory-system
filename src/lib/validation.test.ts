import { describe, it, expect } from 'vitest'
import {
  employeeSchema,
  registerSchema,
  loginSchema,
} from '@/lib/validation'

describe('Employee Validation Schema', () => {
  it('should accept valid employee data', () => {
    const result = employeeSchema.safeParse({
      employeeNumber: 'EMP001',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@test.com',
      position: 'Developer',
      department: 'IT',
      employmentStatus: 'ACTIVE',
      basicSalary: 5000,
      hireDate: '2024-01-01T00:00:00Z',
    })

    expect(result.success).toBe(true)
  })

  it('should reject missing required fields', () => {
    const result = employeeSchema.safeParse({
      employeeNumber: '',
      firstName: '',
      lastName: '',
      email: '',
      position: '',
      department: '',
      employmentStatus: 'ACTIVE',
      basicSalary: 0,
      hireDate: '',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.errors.length).toBeGreaterThan(0)
    }
  })

  it('should reject invalid email format', () => {
    const result = employeeSchema.safeParse({
      employeeNumber: 'EMP001',
      firstName: 'John',
      lastName: 'Doe',
      email: 'not-an-email',
      position: 'Developer',
      department: 'IT',
      employmentStatus: 'ACTIVE',
      basicSalary: 5000,
      hireDate: '2024-01-01T00:00:00Z',
    })

    expect(result.success).toBe(false)
  })
})

describe('Registration Validation Schema', () => {
  it('should accept valid registration data', () => {
    const result = registerSchema.safeParse({
      email: 'test@test.com',
      password: 'Test1234!',
      name: 'John Doe',
      role: 'EMPLOYEE',
    })

    expect(result.success).toBe(true)
  })

  it('should reject weak password (too short)', () => {
    const result = registerSchema.safeParse({
      email: 'test@test.com',
      password: '123',
      name: 'John Doe',
      role: 'EMPLOYEE',
    })

    expect(result.success).toBe(false)
  })

  it('should reject weak password (no special char)', () => {
    const result = registerSchema.safeParse({
      email: 'test@test.com',
      password: 'Password123',
      name: 'John Doe',
      role: 'EMPLOYEE',
    })

    expect(result.success).toBe(false)
  })

  it('should reject invalid email', () => {
    const result = registerSchema.safeParse({
      email: 'not-an-email',
      password: 'Test1234!',
      name: 'John Doe',
      role: 'EMPLOYEE',
    })

    expect(result.success).toBe(false)
  })
})

describe('Login Validation Schema', () => {
  it('should accept valid login credentials', () => {
    const result = loginSchema.safeParse({
      email: 'test@test.com',
      password: 'Test1234!',
    })

    expect(result.success).toBe(true)
  })

  it('should reject empty email', () => {
    const result = loginSchema.safeParse({
      email: '',
      password: 'Test1234!',
    })

    expect(result.success).toBe(false)
  })

  it('should reject empty password', () => {
    const result = loginSchema.safeParse({
      email: 'test@test.com',
      password: '',
    })

    expect(result.success).toBe(false)
  })
})