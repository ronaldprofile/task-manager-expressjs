import { z } from 'zod'

export const signInSchema = z.object({
  email: z.email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória')
})

export type SignInInput = z.infer<typeof signInSchema>



export const signUpSchema = z.object({
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

export type SignUpInput = z.infer<typeof signUpSchema>