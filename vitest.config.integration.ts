// vitest.config.integration.ts
import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["**/*.integration.test.ts"],
    setupFiles: "./src/test/setup-integration.ts",
    env: {
      JWT_SECRET: "test-secret",
      JWT_EXPIRES_IN: "24h",
      DATABASE_URL: "postgresql://prisma:prisma@localhost:5433/tests"
    }
  }
})
