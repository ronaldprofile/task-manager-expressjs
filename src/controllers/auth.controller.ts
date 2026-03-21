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

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })

    return res.status(201).json({ user: userWithoutPassword })
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

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })

    return res.status(200).json({ user })
  }

  signOut = async (req: Request, res: Response) => {
    res.clearCookie("token")
    return res.status(200).json()
  }

  me = async (req: Request, res: Response) => {
    const user = await this.authService.findById(req.user!.id)

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    const { password: _, ...userWithoutPassword } = user
    return res.status(200).json(userWithoutPassword)
  }
}
