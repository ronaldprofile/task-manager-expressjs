import { Request, Response } from 'express'
import { TeamService } from '../service/teams.service.js'

type ReqParams = { teamId: string }
type ReqBody = { usersIds: string[] }

export const addUserTeamController = async (
  req: Request<ReqParams, any, ReqBody>,
  res: Response
) => {
  const { teamId } = req.params
  const { usersIds } = req.body

  await TeamService.addUserToTeam(teamId, usersIds)

  return res.status(201).json()
}
