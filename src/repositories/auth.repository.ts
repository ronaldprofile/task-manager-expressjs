import type { SignUpInput } from "../validators/auth.validator.js"
import { prisma } from "../lib/prisma.js"

export class AuthRepository {
  async findByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email }
    })
  }

  async register(data: SignUpInput) {
    const { email, name, password, role } = data

    return await prisma.user.create({
      data: {
        name,
        email,
        password,
        role
      }
    })
  }
}