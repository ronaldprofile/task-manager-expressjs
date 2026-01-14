import { Request, Response } from 'express'
import { ZodError } from 'zod'
import { TasksService } from '../service/tasks.service.js'

type ReqParams = {
  taskId: string
}

export const removeTaskController = async (
  req: Request<ReqParams, any, any>,
  res: Response
) => {
  const { taskId } = req.params
  try {
    await TasksService.removeTask(taskId)

    return res.status(204).json()
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
