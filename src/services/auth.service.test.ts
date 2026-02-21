import { AuthRepository } from "../repositories/auth.repository.js"
import { prismaMock } from "../test/setup.js"
import { makeUser, makeRegisterUserData } from "../test/index.js"
import { AuthService } from "./auth.service.js"

const HASHED_PASSWORD_PASS = "hashed-password"

const mockBcryptCompare = vi.fn()
const mockBcryptHash = vi.fn()

vi.mock("bcrypt", () => ({
  default: {
    compare: (...args: any[]) => mockBcryptCompare(...args),
    hash: (...args: any[]) => mockBcryptHash(...args)
  }
}))

const SALT_ROUNDS = 6

describe("Auth Service", () => {
  let authService: AuthService
  let authRepository: AuthRepository

  beforeEach(() => {
    vi.clearAllMocks()

    authRepository = new AuthRepository()
    authService = new AuthService(authRepository)

    mockBcryptHash.mockResolvedValue(HASHED_PASSWORD_PASS)
    mockBcryptCompare.mockResolvedValue(true)
  })

  describe("Register", () => {
    it("should encrypt the password and register user", async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(null)
      prismaMock.user.create.mockResolvedValue(
        makeUser({ password: HASHED_PASSWORD_PASS })
      )

      const registerData = makeRegisterUserData()
      const user = await authService.register(registerData)

      expect(mockBcryptHash).toHaveBeenCalledWith(
        registerData.password,
        SALT_ROUNDS
      )

      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          password: HASHED_PASSWORD_PASS
        })
      })

      expect(user.password).toBe(HASHED_PASSWORD_PASS)
    })

    it("should throw if email already exists", async () => {
      const existingEmail = "existing@example.com"

      prismaMock.user.findUnique.mockResolvedValue(
        makeUser({
          email: existingEmail
        })
      )

      await expect(
        async () =>
          await authService.register(
            makeRegisterUserData({
              email: existingEmail
            })
          )
      ).rejects.toThrow("Email já cadastrado")
    })
  })

  describe("Login", () => {
    it("should return user data on successful login", async () => {
      const loginData = {
        email: "test@example.com",
        password: "password123"
      }

      const user = makeUser({
        email: loginData.email,
        password: loginData.password
      })

      prismaMock.user.findUnique.mockResolvedValue(user)

      const result = await authService.login(loginData)

      expect(result.email).toBe(loginData.email)
    })

    it("should throw if user not found", async () => {
      prismaMock.user.findUnique.mockResolvedValue(null)

      await expect(
        async () =>
          await authService.login({
            email: "test@example.com",
            password: "password123"
          })
      ).rejects.toThrow("Credenciais inválidas")
    })

    it("should throw if password check fails", async () => {
      mockBcryptCompare.mockResolvedValue(false)

      prismaMock.user.findUnique.mockResolvedValueOnce(makeUser())

      await expect(
        async () =>
          await authService.login({
            email: "test@example.com",
            password: "password123"
          })
      ).rejects.toThrow("Credenciais inválidas")
    })
  })
})
