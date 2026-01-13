import { Request, Response } from 'express'
import { ZodError } from 'zod'
import { registerSchema } from '../validators/register.validator.js'
import { AuthService } from '../services/auth.service.js'
import { JWTService } from '../services/jwt.service.js'

export const registerController = async (req: Request, res: Response) => {
  try {
    const result = registerSchema.parse(req.body)

    const user = await AuthService.register(result)

    const token = JWTService.generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    })

    return res.status(201).json({
      user,
      token
    })
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json(error)
    }

    if (error instanceof Error) {
      if (error.message === 'Email já cadastrado') {
        return res.status(400).json({
          message: 'Email já cadastrado'
        })
      }
    }

    return res.status(500).json({ message: 'Server internal error' })
  }
}
