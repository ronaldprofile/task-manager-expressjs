import { Request, Response } from 'express'
import { ZodError } from 'zod'
import { registerTaskSchema } from '../validators/tasks.validator.js'
import { TasksService } from '../service/tasks.service.js'

type ReqParams = {
  teamId: string
  assignedTo: string
}

export const registerTaskController = async (
  req: Request<ReqParams, any, any>,
  res: Response
) => {
  const { assignedTo, teamId } = req.params

  try {
    const data = registerTaskSchema.parse(req.body)

    const task = await TasksService.register({
      data,
      assignedTo,
      teamId
    })

    return res.status(201).json({ task })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message) {
        return res.status(400).json({ message: error.message })
      }
    }

    if (error instanceof ZodError) {
      return res.status(400).json(error)
    }

    return res.status(500).json({ message: 'Server internal error' })
  }
}
