import { Request, Response } from 'express'
import { registerTeamSchema } from '../validators/teams.validator.js'
import { TeamService } from '../service/teams.service.js'

export const registerTeamController = async (req: Request, res: Response) => {
  const result = registerTeamSchema.parse(req.body)

  const team = await TeamService.register(result)

  return res.status(201).json({ team })
}
