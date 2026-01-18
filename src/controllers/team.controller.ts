import { Request, Response } from 'express'
import type { TeamService } from '../services/teams.service.js'
import {
  registerTeamSchema,
  updateTeamSchema,
  type RegisterTeamInput,
  type UpdateTeamInput
} from '../validators/teams.validator.js'

type TeamParams = {
  teamId: string
}

export class TeamsController {
  constructor(private teamService: TeamService) { }

  readTeams = async (req: Request, res: Response) => {
    const teams = await this.teamService.readTeams()
    return res.status(200).json({ teams })
  }

  readTeamMembers = async (req: Request<TeamParams>, res: Response) => {
    const members = await this.teamService.readTeamMembers(req.params.teamId)
    return res.status(200).json({ members })
  }

  register = async (req: Request<any, any, RegisterTeamInput>, res: Response) => {
    const { name, description } = registerTeamSchema.parse(req.body)

    const team = await this.teamService.register({
      name,
      description
    })
    return res.status(201).json({ team })
  }

  update = async (req: Request<TeamParams, any, UpdateTeamInput>, res: Response) => {
    const { teamId } = req.params
    const { name, description } = updateTeamSchema.parse(req.body)

    const team = await this.teamService.update(teamId, {
      name,
      description
    })
    return res.status(200).json({ team })
  }

  addUserToTeam = async (req: Request<TeamParams, any, { usersIds: string[] }>, res: Response) => {
    const { teamId } = req.params
    const { usersIds } = req.body

    await this.teamService.addUserToTeam(teamId, usersIds)
    return res.status(200).json({ message: 'User added' })
  }

  removeUser = async (req: Request<TeamParams>, res: Response) => {
    const { usersIds } = req.body
    await this.teamService.removeUser(req.params.teamId, usersIds)
    return res.status(204).send()
  }
}
