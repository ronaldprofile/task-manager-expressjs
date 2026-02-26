import { prismaMock } from "../../test/setup.js"

export async function resetDB() {
  await prismaMock.$transaction([
    prismaMock.user.deleteMany(),
    prismaMock.task.deleteMany(),
    prismaMock.team.deleteMany(),
    prismaMock.teamMember.deleteMany()
  ])
}
