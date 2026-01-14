import { Request, Response } from 'express'
import { ZodError } from 'zod'
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

  try {
    const data = registerTaskSchema.parse(req.body)

    const updatedTask = await TasksService.updateTask({
      data,
      taskId,
      userId: req.user?.id!,
      userRole: req.user?.role!
    })

    return res.status(200).json({ updatedTask })
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
