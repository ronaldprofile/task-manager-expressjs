import { z } from 'zod'

const taskPriority = z.enum(['HIGH', 'MEDIUM', 'LOW'])
const taskStatus = z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED'])

export const registerTaskSchema = z.object({
  title: z
    .string()
    .min(2, 'Título deve ter no mínimo 2 caracteres')
    .max(100, 'Descrição deve ter no máximo 100 caracteres'),
  description: z.string().max(100).optional(),
  priority: taskPriority.default('MEDIUM'),
  status: taskStatus.default('PENDING')
})

export type RegisterTaskInput = z.infer<typeof registerTaskSchema>
export type UpdateTaskInput = Partial<RegisterTaskInput>
