import { prisma } from '../../lib/prisma.js'
import type {
  RegisterTeamInput,
  UpdateTeamInput
} from '../validators/teams.validator.js'

export class TeamService {
  static async readTeams() {
    const teams = await prisma.team.findMany()
    return teams
  }

  static async findTeam(teamId: string) {
    const team = await prisma.team.findUnique({
      where: { id: teamId }
    })
    return team
  }

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
    const existingTeam = this.findTeam(teamId)

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

  static async addUserToTeam(teamId: string, usersIds: string[]) {
    const existingTeam = this.findTeam(teamId)

    if (!existingTeam) {
      throw new Error('Team not found')
    }

    await prisma.$transaction(
      usersIds.map(user_id =>
        prisma.teamMember.create({
          data: {
            user_id,
            team_id: teamId
          }
        })
      )
    )
  }

  static async removeUser(teamId: string, usersIds: string[]) {
    const existingTeam = await this.findTeam(teamId)

    if (!existingTeam) {
      throw new Error('Team not found')
    }

    await prisma.$transaction(
      usersIds.map(user_id =>
        prisma.teamMember.delete({
          where: {
            user_id_team_id: {
              user_id,
              team_id: teamId
            }
          }
        })
      )
    )
  }
}
