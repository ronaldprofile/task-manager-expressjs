import { ZodError } from 'zod'

export function formatZodError(error: ZodError) {
  return {
    message: 'Validation failed',
    errors: error.issues.map(issue => ({
      field: issue.path.join('.'),
      message: issue.message
    }))
  }
}
