import { PrismaClient } from "../../generated/prisma/client.js"
import { mockDeep, mockReset, DeepMockProxy } from "vitest-mock-extended"
import { beforeEach, vi } from "vitest"

import { prisma } from "../lib/prisma.js"

vi.mock("../lib/prisma.js", () => ({
  prisma: mockDeep<PrismaClient>()
}))

beforeEach(() => {
  mockReset(prismaMock)
})

export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>
