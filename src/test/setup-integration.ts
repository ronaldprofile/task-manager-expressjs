import { afterAll } from "vitest"
import { prisma } from "../lib/prisma.js"
import { resetDB } from "../__tests__/helpers/reset-db.js"

beforeAll(async () => {
  await prisma.$connect()
})

beforeEach(async () => {
  await resetDB()
})

afterAll(async () => {
  await prisma.$disconnect()
})
