import { Request, Response } from 'express'
import { registerTeamSchema } from '../validators/teams.validator.js'
import { TeamService } from '../service/teams.service.js'

type ReqParams = {
  teamId: string
}

export const updateTeamController = async (
  req: Request<ReqParams, any, any>,
  res: Response
) => {
  const { teamId } = req.params

  const result = registerTeamSchema.parse(req.body)

  const team = await TeamService.update(teamId, result)

  return res.status(201).json({ team })
}
