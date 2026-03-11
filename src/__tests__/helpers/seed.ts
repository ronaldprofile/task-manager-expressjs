import { prisma } from "../../lib/prisma.js"
import bcrypt from "bcrypt"
import { makeRegisterUserData, makeTask } from "../../test/index.js"
import { SALT_ROUNDS } from "../../services/auth.service.js"
import { makeTeam } from "../../test/factories/team.js"

export async function seedUser(
  overrides: Parameters<typeof makeRegisterUserData>[0] = {}
) {
  const { password, ...rest } = makeRegisterUserData(overrides)
  return prisma.user.create({
    data: {
      ...rest,
      password: await bcrypt.hash(password, SALT_ROUNDS)
    }
  })
}

export async function seedTeam(overrides: Parameters<typeof makeTeam>[0] = {}) {
  const { id, ...team } = makeTeam()

  return prisma.team.create({
    data: team
  })
}

export async function seedTask(
  assigned_to: string,
  teamId: string,
  overrides: Parameters<typeof makeTask>[0] = {}
) {
  return prisma.task.create({
    data: makeTask({ assigned_to, teamId, ...overrides })
  })
}

export async function seedTeamMember(user_id: string, team_id: string) {
  return prisma.teamMember.create({
    data: { user_id, team_id }
  })
}

export async function seedUserWithTeamAndTask(
  overrides: {
    task?: Parameters<typeof makeTask>[0]
    team?: Parameters<typeof makeTeam>[0]
    user?: Parameters<typeof makeRegisterUserData>[0]
  } = {}
) {
  const user = await seedUser(overrides.user)
  const team = await seedTeam(overrides.team)

  await seedTeamMember(user.id, team.id)
  const task = await seedTask(user.id, team.id, overrides.task)

  return { user, team, task }
}
