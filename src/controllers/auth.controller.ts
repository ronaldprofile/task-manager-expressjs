import { Request, Response } from "express"

import { AuthService } from "../services/auth.service.js"
import { JWTService } from "../services/jwt.service.js"
import { signInSchema, signUpSchema } from "../validators/auth.validator.js"

export class AuthController {
  constructor(
    private authService: AuthService,
    private JWTService: JWTService
  ) {}

  signUp = async (req: Request, res: Response) => {
    const { email, password, role, name } = signUpSchema.parse(req.body)

    const user = await this.authService.register({
      email,
      password,
      name,
      role
    })

    const { password: _, ...userWithoutPassword } = user

    const token = this.JWTService.generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    })

    return res.status(201).json({ user: userWithoutPassword, token })
  }

  signIn = async (req: Request, res: Response) => {
    const { email, password } = signInSchema.parse(req.body)

    const user = await this.authService.login({
      email,
      password
    })

    const token = this.JWTService.generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    })

    return res.status(201).json({ user, token })
  }
}
