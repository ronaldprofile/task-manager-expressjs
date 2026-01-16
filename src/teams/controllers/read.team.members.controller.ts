import { Request, Response } from 'express'
import { TeamService } from '../service/teams.service.js'

type ReqParams = {
  teamId: string
}

export const readTeamMembersController = async (
  req: Request<ReqParams, any, any>,
  res: Response
) => {
  const members = await TeamService.readTeamMembers(req.params.teamId)

  return res.status(200).json({ members })
}
