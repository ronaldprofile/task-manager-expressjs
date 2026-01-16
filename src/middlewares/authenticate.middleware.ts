import { Request, Response, NextFunction } from 'express'
import { JWTService } from '../auth/services/jwt.service.js'

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader) {
      return res.status(401).json({ message: 'Token not provided' })
    }

    const parts = authHeader.split(' ')

    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ message: 'Invalid token format' })
    }

    const token = parts[1]

    try {
      const payload = JWTService.verifyToken(token)

      req.user = {
        id: payload.userId,
        email: payload.email,
        role: payload.role
      }

      next()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Token invalid or expired'
      return res.status(401).json({ message })
    }
  } catch (error) {
    return res.status(500).json({ message: 'Server internal error' })
  }
}
