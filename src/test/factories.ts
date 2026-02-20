import type { JWTPayload } from "../services/jwt.service.js"

const makeRegisterUserData = (overrides = {}) => ({
  email: "test@example.com",
  name: "Test User",
  password: "password123",
  role: "MEMBER" as const,
  ...overrides
})

const makeUser = (overrides = {}) => ({
  id: "test-user-id",
  email: "test@example.com",
  name: "Test User",
  role: "MEMBER" as const,
  password: "hashed-password",
  created_at: new Date(),
  updated_at: new Date(),
  ...overrides
})

const makeJWTPayload = (overrides = {}): JWTPayload => ({
  userId: "test-user-id",
  email: "test@example.com",
  role: "MEMBER",
  ...overrides
})

export { makeRegisterUserData, makeUser, makeJWTPayload }
