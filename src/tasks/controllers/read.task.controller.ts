import { Request, Response } from 'express'
import { TasksService } from '../service/tasks.service.js'

export const readTaskController = async (req: Request, res: Response) => {
  const tasks = await TasksService.readTasks()

  return res.status(200).json({ tasks })
}
