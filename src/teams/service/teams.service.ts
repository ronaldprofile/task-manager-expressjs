import { prisma } from '../../lib/prisma.js'
import type {
  RegisterTeamInput,
  UpdateTeamInput
} from '../validators/teams.validator.js'

export class TeamService {
  static async register(data: RegisterTeamInput) {
    const { name, description } = data

    const team = await prisma.team.create({
      data: {
        name,
        description
      }
    })

    return team
  }

  static async update(teamId: string, data: UpdateTeamInput) {
    const existingTeam = await prisma.team.findUnique({ where: { id: teamId } })

    if (!existingTeam) {
      throw new Error('Team not found')
    }

    const { name, description } = data

    const team = await prisma.team.update({
      where: {
        id: teamId
      },
      data: {
        name,
        description
      }
    })

    return team
  }
}
