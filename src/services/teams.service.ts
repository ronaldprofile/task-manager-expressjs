import { BadRequestError } from '../errors/bad-request-error.js'
import { TeamRepository } from '../repositories/team.repository.js'
import type {
  RegisterTeamInput,
  UpdateTeamInput
} from '../validators/teams.validator.js'

export class TeamService {
  constructor(private teamRepository: TeamRepository) {}

  async readTeams() {
    return await this.teamRepository.findAll()
  }

  async readTeamMembers(teamId: string) {
    const existingTeam = await this.findTeam(teamId)

    return existingTeam.members.map(({ user }) => user)
  }

  async findTeam(teamId: string) {
    const team = await this.teamRepository.findById(teamId)

    if (!team) {
      throw new BadRequestError('Team not found')
    }

    return team
  }

  async register(data: RegisterTeamInput) {
    const { name, description } = data
    return await this.teamRepository.create({ name, description })
  }

  async update(teamId: string, data: UpdateTeamInput) {
    await this.findTeam(teamId)

    const { name, description } = data
    return await this.teamRepository.update(teamId, { name, description })
  }

  async addUserToTeam(teamId: string, usersIds: string[]) {
    await this.findTeam(teamId)

    await this.teamRepository.addMembers(teamId, usersIds)
  }

  async removeUser(teamId: string, usersIds: string[]) {
    await this.findTeam(teamId)

    const users = await this.teamRepository.findUsersByIds(usersIds)
    const foundUserIds = users.map(u => u.id)
    const missingUserIds = usersIds.filter(id => !foundUserIds.includes(id))

    if (missingUserIds.length > 0) {
      throw new BadRequestError(
        `Failed to remove user(s): ${missingUserIds.join(', ')}`
      )
    }

    await this.teamRepository.removeMembers(teamId, usersIds)
  }
}
