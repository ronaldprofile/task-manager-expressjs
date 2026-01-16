import { Request, Response } from 'express'
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
  const data = registerTaskSchema.parse(req.body)

  const task = await TasksService.register({
    data,
    assignedTo,
    teamId
  })

  return res.status(201).json({ task })
}
