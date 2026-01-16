import bcrypt from 'bcrypt'
import { RegisterInput } from '../validators/register.validator.js'
import { LoginInput } from '../validators/login.validator.js'
import { prisma } from '../../lib/prisma.js'
import { BadRequestError } from '../../errors/bad-request-error.js'

const SALT_ROUNDS = 6

export class AuthService {
  static async register(data: RegisterInput) {
    const { email, name, password, role } = data
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      throw new BadRequestError('Email já cadastrado')
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role
      }
    })

    return user
  }

  static async login(data: LoginInput) {
    const { email, password } = data
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      throw new BadRequestError('Credenciais inválidas')
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      throw new BadRequestError('Credenciais inválidas')
    }

    const { password: _, ...userWithoutPassword } = user

    return userWithoutPassword
  }
}
