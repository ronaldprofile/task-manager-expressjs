import { Request, Response } from 'express'
import { ZodError } from 'zod'
import { loginSchema } from '../validators/login.validator.js'
import { AuthService } from '../services/auth.service.js'
import { JWTService } from '../services/jwt.service.js'

export const loginController = async (req: Request, res: Response) => {
  try {
    const validatedData = loginSchema.parse(req.body)

    const user = await AuthService.login(validatedData)

    const token = JWTService.generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    })

    return res.status(200).json({
      user,
      token
    })
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json(error)
    }

    if (error instanceof Error) {
      if (error.message === 'Credenciais inválidas') {
        return res.status(401).json({
          message: 'Credenciais inválidas'
        })
      }
    }

    return res.status(500).json({ message: 'Erro interno do servidor' })
  }
}
