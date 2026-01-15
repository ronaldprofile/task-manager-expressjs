import { prisma } from '../../lib/prisma.js'
import type {
  RegisterTeamInput,
  UpdateTeamInput
} from '../validators/teams.validator.js'

export class TeamService {
  static async readTeams() {
    const teams = await prisma.team.findMany({
      include: {
        members: {
          select: {
            user: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    })
    return teams
  }

  static async readTeamMembers(teamId: string) {
    const existingTeam = await this.findTeam(teamId)

    if (!existingTeam) {
      throw new Error('Team not found')
    }

    const teamWithMembers = existingTeam.members.map(({ user }) => user)

    return teamWithMembers
  }

  static async findTeam(teamId: string) {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: {
          select: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true
              }
            }
          }
        }
      }
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
    const existingTeam = await this.findTeam(teamId)

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
    const existingTeam = await this.findTeam(teamId)

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
