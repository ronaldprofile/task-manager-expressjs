import type { UserModel } from "../../../generated/prisma/models.js"
import type { JWTPayload } from "../../services/jwt.service.js"
import type { SignUpInput } from "../../validators/auth.validator.js"

export const makeRegisterUserData = (overrides?: Partial<SignUpInput>) => ({
  email: "test@example.com",
  name: "Test User",
  password: "password123",
  role: "MEMBER" as const,
  ...overrides
})

export const makeUser = (overrides?: Partial<UserModel>): UserModel => ({
  id: "test-user-id",
  email: "test@example.com",
  name: "Test User",
  role: "MEMBER" as const,
  password: "hashed-password",
  created_at: new Date(),
  updated_at: new Date(),
  ...overrides
})

export const makeJWTPayload = (
  overrides?: Partial<JWTPayload>
): JWTPayload => ({
  userId: "test-user-id",
  email: "test@example.com",
  role: "MEMBER",
  ...overrides
})
