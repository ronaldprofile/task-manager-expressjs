import { Request, Response, NextFunction } from 'express'
import { JWTService } from '../services/jwt.service.js'

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization
    const cookieToken = req.cookies?.token

    let token: string | undefined

    if (authHeader) {
      const parts = authHeader.split(' ')
      if (parts.length === 2 && parts[0] === 'Bearer') {
        token = parts[1]
      }
    }

    if (!token && cookieToken) {
      token = cookieToken
    }

    if (!token) {
      return res.status(401).json({ message: 'Token not provided' })
    }

    try {
      const jwtService = new JWTService()
      const payload = jwtService.verifyToken(token)

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
