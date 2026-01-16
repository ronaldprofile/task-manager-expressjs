import jwt from 'jsonwebtoken'

export class TokenError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'TokenError'

    Error.captureStackTrace?.(this, this.constructor)
  }

  static fromJWTError(error: unknown): TokenError {
    if (error instanceof jwt.TokenExpiredError) {
      return new TokenError('Token expired')
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return new TokenError('Token invalid')
    }

    if (error instanceof jwt.NotBeforeError) {
      return new TokenError('Token is not yet valid')
    }

    if (error instanceof Error) {
      return new TokenError(`Error to verify token: ${error.message}`)
    }

    return new TokenError('Unknown error to verify token')
  }

  static isTokenError(error: unknown): error is TokenError {
    return error instanceof TokenError
  }
}
