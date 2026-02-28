import { prisma } from "../../lib/prisma.js"

export async function resetDB() {
  await prisma.$transaction([
    prisma.user.deleteMany(),
    prisma.task.deleteMany(),
    prisma.team.deleteMany(),
    prisma.teamMember.deleteMany()
  ])
}
