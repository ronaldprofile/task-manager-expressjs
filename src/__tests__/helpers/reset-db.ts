import { prisma } from "../../lib/prisma.js"

export async function resetDB() {
  await prisma.$transaction([
    prisma.task.deleteMany(),
    prisma.teamMember.deleteMany(),
    prisma.team.deleteMany(),
    prisma.user.deleteMany()
  ])
}
