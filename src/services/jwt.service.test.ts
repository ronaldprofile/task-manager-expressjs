import { TokenExpiredError } from "jsonwebtoken"
import { JWTService } from "./jwt.service.js"
import { makeJWTPayload } from "../test/factories.js"
import { TokenError } from "../errors/index.js"

const { mockSign, mockVerify } = vi.hoisted(() => ({
  mockSign: vi.fn(),
  mockVerify: vi.fn()
}))

vi.mock("jsonwebtoken", async importOriginal => {
  const actual = await importOriginal<typeof import("jsonwebtoken")>()

  return {
    ...actual,
    TokenExpiredError: actual.TokenExpiredError,
    JsonWebTokenError: actual.JsonWebTokenError,
    NotBeforeError: actual.NotBeforeError,
    default: {
      ...actual,
      sign: (...args: any[]) => mockSign(...args),
      verify: (...args: any[]) => mockVerify(...args)
    }
  }
})

describe("JWT Service", () => {
  let jwtService: JWTService

  beforeEach(() => {
    vi.clearAllMocks()

    jwtService = new JWTService()
  })

  describe("Generate", () => {
    it("should generate token", async () => {
      mockSign.mockReturnValue("fake-token")

      const payload = makeJWTPayload()
      const token = jwtService.generateToken(payload)

      expect(token).toBe("fake-token")

      // test secret and expires in from vite.config.ts options env
      expect(mockSign).toHaveBeenCalledWith(payload, "test-secret", {
        expiresIn: "24h"
      })
    })
  })

  describe("Verify", () => {
    it("should verify a valid token", async () => {
      mockSign.mockReturnValue("fake-token")
      const payload = makeJWTPayload()

      mockVerify.mockReturnValue({
        ...payload,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 86400
      })

      const token = jwtService.generateToken(payload)
      const verifiedPayload = jwtService.verifyToken(token)

      expect(verifiedPayload).toEqual(payload)
      expect(mockVerify).toHaveBeenCalledWith(token, "test-secret")
    })

    it("should throw TokenError when token is expired", async () => {
      mockVerify.mockImplementation(() => {
        throw new TokenExpiredError("jwt expired", new Date())
      })

      expect(() => jwtService.verifyToken("expired-token")).toThrow(
        "Token expired"
      )
    })

    it("should throw TokenError when token is invalid", () => {
      mockVerify.mockImplementation(() => {
        throw new Error("invalid signature")
      })

      expect(() => jwtService.verifyToken("invalid-token")).toThrow(TokenError)
    })
  })
})
