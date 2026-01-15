import { Request, Response } from 'express'
import { ZodError } from 'zod'
import { TasksService } from '../service/tasks.service.js'

type ReqParams = {
  teamId: string
}

export const readTeamTaskController = async (
  req: Request<ReqParams, any, any>,
  res: Response
) => {
  const teamId = req.params.teamId

  try {
    const tasks = await TasksService.readTasksFromTeam({
      teamId,
      userId: req.user?.id!,
      userRole: req.user?.role!
    })

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
