import { Request, Response } from 'express'
import { TasksService } from '../service/tasks.service.js'

type ReqParams = {
  teamId: string
}

export const readTeamTaskController = async (
  req: Request<ReqParams, any, any>,
  res: Response
) => {
  const { teamId } = req.params
  const tasks = await TasksService.readTasksFromTeam({
    teamId,
    userId: req.user?.id!,
    userRole: req.user?.role!
  })

  return res.status(200).json({ tasks })
}
