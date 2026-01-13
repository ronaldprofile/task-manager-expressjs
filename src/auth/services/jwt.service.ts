import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h'

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET não está definido nas variáveis de ambiente')
}

export interface JWTPayload {
  userId: string
  email: string
  role: 'ADMIN' | 'MEMBER'
}

export class JWTService {
  static generateToken(payload: JWTPayload): string {
    return jwt.sign(payload, JWT_SECRET!, {
      expiresIn: JWT_EXPIRES_IN
    })
  }

  static verifyToken(token: string): JWTPayload {
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
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token expirado')
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Token inválido')
      }
      throw new Error('Erro ao verificar token')
    }
  }
}
