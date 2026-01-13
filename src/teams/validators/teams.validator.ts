import { z } from 'zod'

export const registerTeamSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter no mínimo 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  description: z
    .string()
    .min(2, 'Descrição deve ter no mínimo 2 caracteres')
    .max(100, 'Email deve ter no máximo 150 caracteres')
})

export type RegisterTeamInput = z.infer<typeof registerTeamSchema>

export type UpdateTeamInput = Partial<RegisterTeamInput>
