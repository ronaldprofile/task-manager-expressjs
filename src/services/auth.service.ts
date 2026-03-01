import bcrypt from "bcrypt"
import { BadRequestError } from "../errors/bad-request-error.js"
import type { AuthRepository } from "../repositories/auth.repository.js"
import type { SignUpInput, SignInInput } from "../validators/auth.validator.js"

const SALT_ROUNDS = 6

export class AuthService {
  constructor(private authRepository: AuthRepository) {}

  async register(data: SignUpInput) {
    const { email, name, password, role } = data
    const existingUser = await this.authRepository.findByEmail(email)

    if (existingUser) {
      throw new BadRequestError("Email já cadastrado")
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)

    const user = await this.authRepository.register({
      name,
      email,
      password: hashedPassword,
      role
    })

    return user
  }

  async login(data: SignInInput) {
    const { email, password } = data

    const user = await this.authRepository.findByEmail(email)

    if (!user) {
      throw new BadRequestError("Credenciais inválidas")
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      throw new BadRequestError("Credenciais inválidas")
    }

    const { password: _, ...userWithoutPassword } = user

    return userWithoutPassword
  }
}
