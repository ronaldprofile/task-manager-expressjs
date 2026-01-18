import jwt from 'jsonwebtoken'
import { TokenError } from '../errors/token-error.js'

const JWT_SECRET = process.env.JWT_SECRET
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h'

if (!JWT_SECRET) {
  throw new Error(
    'Environment variable JWT_SECRET is required but was not found.'
  )
}

export interface JWTPayload {
  userId: string
  email: string
  role: 'ADMIN' | 'MEMBER'
}

export class JWTService {
  generateToken(payload: JWTPayload): string {
    return jwt.sign(payload, JWT_SECRET! as any, {
      expiresIn: JWT_EXPIRES_IN as any
    })
  }

  verifyToken(token: string): JWTPayload {
    try {
      const decoded = jwt.verify(token, JWT_SECRET!) as JWTPayload & {
        iat: number
        exp: number
      }

      return {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role
      }
    } catch (error) {
      throw TokenError.fromJWTError(error)
    }
  }
}
