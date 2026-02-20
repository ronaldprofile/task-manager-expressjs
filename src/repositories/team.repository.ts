import { prisma } from "../lib/prisma.js"
import type {
  RegisterTeamInput,
  UpdateTeamInput
} from "../validators/teams.validator.js"

export class TeamRepository {
  async findAll() {
    return await prisma.team.findMany({
      orderBy: {
        created_at: "desc"
      },
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
  }

  async findById(teamId: string) {
    return await prisma.team.findUnique({
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
  }

  async create(data: RegisterTeamInput) {
    const { name, description } = data

    return await prisma.team.create({
      data: {
        name,
        description
      }
    })
  }

  async update(teamId: string, data: UpdateTeamInput) {
    const { name, description } = data

    return await prisma.team.update({
      where: {
        id: teamId
      },
      data: {
        name,
        description
      }
    })
  }

  async addMembers(teamId: string, userIds: string[]) {
    await prisma.$transaction(
      userIds.map(user_id =>
        prisma.teamMember.create({
          data: {
            user_id,
            team_id: teamId
          }
        })
      )
    )
  }

  async removeMembers(teamId: string, userIds: string[]) {
    await prisma.$transaction(
      userIds.map(user_id =>
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

  async findUsersByIds(userIds: string[]) {
    return await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true }
    })
  }

  async isMemberOfTeam(teamId: string, userId: string): Promise<boolean> {
    const member = await prisma.teamMember.findUnique({
      where: {
        user_id_team_id: {
          user_id: userId,
          team_id: teamId
        }
      }
    })
    return !!member
  }
}
