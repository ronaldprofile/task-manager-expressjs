import { z } from 'zod'

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter no mínimo 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  email: z
    .email('Email inválido')
    .max(150, 'Email deve ter no máximo 150 caracteres'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  role: z.enum(['ADMIN', 'MEMBER']).default('MEMBER')
})

export type RegisterInput = z.infer<typeof registerSchema>
