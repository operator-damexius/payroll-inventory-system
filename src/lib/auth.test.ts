import { describe, it, expect } from 'vitest'
import { signToken, verifyToken } from '@/lib/auth'

describe('Auth Helpers', () => {
  it('should sign and verify token correctly', () => {
    const payload = {
      userId: '1',
      email: 'test@test.com',
      role: 'ADMIN',
    }

    const token = signToken(payload)
    const decoded = verifyToken(token)

    expect(decoded).not.toBeNull()
    expect(decoded?.userId).toBe('1')
    expect(decoded?.email).toBe('test@test.com')
    expect(decoded?.role).toBe('ADMIN')
  })

  it('should return null for invalid token', () => {
    const result = verifyToken('invalid-token-string')
    expect(result).toBeNull()
  })

  it('should return null for empty token', () => {
    const result = verifyToken('')
    expect(result).toBeNull()
  })
})