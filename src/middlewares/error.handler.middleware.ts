import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import { formatZodError } from '../utils/format-zod-error.js'

export function errorHandler(
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (error instanceof ZodError) {
    return res.status(400).json(formatZodError(error))
  }

  if (error.message) {
    return res.status(400).json({ message: error.message })
  }

  return res.status(500).json({ message: 'Internal server error' })
}
