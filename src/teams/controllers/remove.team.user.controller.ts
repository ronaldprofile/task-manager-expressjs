import { Request, Response } from 'express'
import { TeamService } from '../service/teams.service.js'

type ReqParams = { teamId: string }
type ReqBody = { usersIds: string[] }

export const removeUserTeamController = async (
  req: Request<ReqParams, any, ReqBody>,
  res: Response
) => {
  const { teamId } = req.params
  const { usersIds } = req.body

  await TeamService.removeUser(teamId, usersIds)

  return res.status(204).json()
}
