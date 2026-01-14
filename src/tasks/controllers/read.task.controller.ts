import { Request, Response } from 'express'
import { ZodError } from 'zod'
import { TasksService } from '../service/tasks.service.js'

export const readTaskController = async (req: Request, res: Response) => {
  try {
    const tasks = await TasksService.readTasks()

    return res.status(200).json({ tasks })
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
