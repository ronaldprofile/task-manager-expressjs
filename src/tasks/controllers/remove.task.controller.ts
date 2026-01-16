import { Request, Response } from 'express'
import { TasksService } from '../service/tasks.service.js'

type ReqParams = {
  taskId: string
}

export const removeTaskController = async (
  req: Request<ReqParams, any, any>,
  res: Response
) => {
  const { taskId } = req.params
  await TasksService.removeTask(taskId)

  return res.status(204).json()
}
