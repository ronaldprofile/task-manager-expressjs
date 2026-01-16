import { Request, Response } from 'express'
import { registerTaskSchema } from '../validators/tasks.validator.js'
import { TasksService } from '../service/tasks.service.js'

type ReqParams = {
  taskId: string
}

export const updateTaskController = async (
  req: Request<ReqParams, any, any>,
  res: Response
) => {
  const { taskId } = req.params
  const data = registerTaskSchema.parse(req.body)

  const updatedTask = await TasksService.updateTask({
    data,
    taskId,
    userId: req.user?.id!,
    userRole: req.user?.role!
  })

  return res.status(200).json({ updatedTask })
}
