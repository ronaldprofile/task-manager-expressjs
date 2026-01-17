import { Request, Response } from 'express'
import type { TeamService } from '../services/teams.service.js'

type TeamParams = {
  teamId: string
}

export class TeamsController {
  constructor(private teamService: TeamService) {}

  readTeams = async (req: Request, res: Response) => {
    const teams = await this.teamService.readTeams()
    return res.status(200).json({ teams })
  }

  readTeamMembers = async (req: Request<TeamParams>, res: Response) => {
    const members = await this.teamService.readTeamMembers(req.params.teamId)
    return res.status(200).json({ members })
  }

  register = async (req: Request, res: Response) => {
    const team = await this.teamService.register(req.body)
    return res.status(201).json({ team })
  }

  update = async (req: Request<TeamParams>, res: Response) => {
    const team = await this.teamService.update(req.params.teamId, req.body)
    return res.status(200).json({ team })
  }

  addUserToTeam = async (req: Request<TeamParams>, res: Response) => {
    const { usersIds } = req.body
    await this.teamService.addUserToTeam(req.params.teamId, usersIds)
    return res.status(200).json({ message: 'User added' })
  }

  removeUser = async (req: Request<TeamParams>, res: Response) => {
    const { usersIds } = req.body
    await this.teamService.removeUser(req.params.teamId, usersIds)
    return res.status(204).send()
  }
}
