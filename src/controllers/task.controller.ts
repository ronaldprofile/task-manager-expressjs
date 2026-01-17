import { Request, Response } from 'express'
import type { TasksService } from '../services/tasks.service.js'

type TaskParams = {
  taskId: string
  teamId: string
}

export class TasksController {
  constructor(private taskService: TasksService) {}

  readTasks = async (req: Request, res: Response) => {
    const tasks = await this.taskService.readTasks()
    return res.status(200).json({ tasks })
  }

  findTask = async (req: Request<TaskParams>, res: Response) => {
    const task = await this.taskService.findTask(req.params.taskId)
    return res.status(200).json({ task })
  }

  register = async (req: Request, res: Response) => {
    const task = await this.taskService.register(req.body)
    return res.status(201).json({ task })
  }

  update = async (req: Request<TaskParams>, res: Response) => {
    const { user } = req
    const { taskId } = req.params

    const task = await this.taskService.update({
      data: req.body,
      taskId,
      userId: user?.id!,
      userRole: user?.role!
    })
    return res.status(200).json({ task })
  }

  readTasksFromTeam = async (req: Request<TaskParams>, res: Response) => {
    const { user } = req
    const { teamId } = req.params

    const tasks = await this.taskService.readTasksFromTeam({
      teamId,
      userId: user?.id!,
      userRole: user?.role!
    })

    return res.status(200).json({ tasks })
  }

  remove = async (req: Request<TaskParams>, res: Response) => {
    await this.taskService.remove(req.params.taskId)
    return res.status(204).send()
  }
}
