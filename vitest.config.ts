import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: "./src/test/setup.ts",
    include: ["src/**/*.test.ts"],
    exclude: ["**/*.integration.test.ts", "node_modules"],

    env: {
      JWT_SECRET: "test-secret",
      JWT_EXPIRES_IN: "24h"
    }
  },
  resolve: {
    alias: {
      lib: "./src/lib",
      controllers: "./src/controllers",
      middlewares: "./src/middlewares",
      repositories: "./src/repositories",
      services: "./src/services",
      validators: "./src/validators",
      errors: "./src/errors"
    }
  }
})
