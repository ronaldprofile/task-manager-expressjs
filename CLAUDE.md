# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Task Manager API - A RESTful API for managing tasks, teams, and users built with Express.js, TypeScript, PostgreSQL, and Prisma ORM. See [README.md](README.md) for full feature documentation.

## Commands

See @package.json for available npm commands for this project

**Setup**: `npm install` → copy `.env.example` to `.env` → `npm run db:generate` → `npm run db:migrate` → `npm run dev`

## Architecture

**Layered architecture**: Routes → Controllers → Services → Repositories → Prisma Client

- **Routes** (`src/routes/`): Endpoint definitions, middleware stacking, dependency injection
- **Controllers** (`src/controllers/`): HTTP concerns only - parse request with Zod, call service, return response
- **Services** (`src/services/`): Business logic, role-based authorization checks, throws custom errors
- **Repositories** (`src/repositories/`): All Prisma queries - services never call Prisma directly
- **Validators** (`src/validators/`): Zod schemas for input validation
- **Middlewares** (`src/middlewares/`): `authenticate` (JWT verification, attaches `req.user`), `authorize(roles)` (role checking), error handler
- **Errors** (`src/errors/`): Custom error classes (`BadRequestError`, `UnauthorizedError`, `TokenError`)

### Dependency Injection Pattern

Dependencies are instantiated in route files, not globally:

```typescript
const authRepository = new AuthRepository()
const authService = new AuthService(authRepository)
const authController = new AuthController(authService)
```

### Error Handling

Use custom error classes from `src/errors/` - never use bare `throw new Error()`. The error handler middleware maps custom errors to appropriate HTTP status codes. Zod errors are automatically formatted by `formatZodError()`.

### Authorization

- Endpoint-level: `authorize(['ADMIN'])` middleware
- Record-level: Services check ownership (e.g., members can only edit their own tasks)

## Data Models

Defined in `prisma/schema.prisma`. Generated client output: `generated/prisma/`

- **User**: id, name, email, password, role (ADMIN/MEMBER)
- **Team**: id, name, description
- **TeamMember**: Composite key (user_id, team_id)
- **Task**: id, title, description, status (PENDING/IN_PROGRESS/COMPLETED), priority (HIGH/MEDIUM/LOW), assigned_to, teamId

## Testing

- **Unit tests**: `src/**/*.test.ts` - mocked dependencies, uses `vitest-mock-extended`
- **Integration tests**: `src/__tests__/*.integration.test.ts` - real PostgreSQL via Docker
- **Test factories**: `src/test/factories/` - helpers for creating test data
- **Integration test helpers**: `src/__tests__/helpers/` - auth helpers, DB reset, seeding
