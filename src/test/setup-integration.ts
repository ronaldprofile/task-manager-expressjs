import { afterEach, afterAll } from "vitest"
import { prisma } from "../lib/prisma.js"
import { resetDB } from "../__tests__/helpers/reset-db.js"

afterEach(async () => {
  await resetDB()
})

afterAll(async () => {
  await prisma.$disconnect()
})
