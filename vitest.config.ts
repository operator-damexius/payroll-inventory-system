import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    env: {
      JWT_SECRET: 'test-jwt-secret-key-for-testing-only',
      MONGODB_URI: 'mongodb+srv://test:test@localhost:27017/test',
      NEXTAUTH_SECRET: 'test-nextauth-secret-key-for-testing-only',
      NEXTAUTH_URL: 'http://localhost:3000',
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})