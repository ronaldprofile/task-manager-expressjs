import { Request, Response } from 'express'
import { TeamService } from '../service/teams.service.js'

export const readTeamsController = async (req: Request, res: Response) => {
  const teams = await TeamService.readTeams()

  return res.status(200).json({ teams })
}
