# Copilot Instructions - Task Manager API

## Architecture Overview

This is an Express.js REST API with a **layered architecture**:
- **Routes** → **Controllers** → **Services** → **Repositories** → **Prisma Client**

Key principle: Business logic lives in **Services**, data access in **Repositories**. Controllers are thin, handling only HTTP concerns (parsing, status codes).

### Data Flow Example
Route defines endpoint and middleware → Controller receives request → validates input with Zod → calls Service → Service executes business logic, throws custom errors → Repository handles Prisma queries → Response returned through middleware (error handler catches failures).

## Critical Patterns

### 1. Dependency Injection (Routes Layer)
All dependencies instantiated in route files, not globally. Example from [src/routes/auth.routes.ts](src/routes/auth.routes.ts):
```typescript
const authRepository = new AuthRepository()
const authService = new AuthService(authRepository)
router.post('/auth/register', authController.signUp)
```
**Pattern**: Services receive repositories as constructor args; controllers receive services.

### 2. Error Handling
- Custom errors: [BadRequestError](src/errors/bad-request-error.ts), [UnauthorizedError](src/errors/unauthorized-error.ts)
- Catch all at [error.handler.middleware.ts](src/middlewares/error.handler.middleware.ts)
- Zod errors automatically formatted by `formatZodError()`
- **Don't use `throw new Error()`** – use custom error classes to enable proper HTTP status mapping

### 3. Authentication & Authorization
- **authenticate** middleware ([authenticate.middleware.ts](src/middlewares/authenticate.middleware.ts)): Verifies JWT, attaches `req.user` with `{id, email, role}`
- **authorize(roles)** middleware ([authorize.middleware.ts](src/middlewares/authorize.middleware.ts)): Checks if user role in allowed list
- **Record-level authorization** in Services: Members can only update own tasks (checked in [tasks.service.ts](src/services/tasks.service.ts) `update()` method)

### 4. Input Validation (Zod)
All validator schemas in [src/validators/](src/validators/). Use `schema.parse(input)` in controllers – throws ZodError if invalid (handled by error middleware).
Example: [signUpSchema](src/validators/auth.validator.ts) enforces email format, min password length.

### 5. Repository Pattern
Repositories ([src/repositories/](src/repositories/)) encapsulate all Prisma queries. Services never call prisma directly.
Example: [AuthRepository.register()](src/repositories/auth.repository.ts) handles `prisma.user.create()`.

### 6. Database & Migrations
- **Schema**: [prisma/schema.prisma](prisma/schema.prisma) – defines models (User, Team, Task, TeamMember) and relations
- **Generated types**: `/generated/prisma/client.ts` (auto-generated from schema, do not edit)
- **Workflow**: Edit schema → `npm run db:migrate "description"` → generates migration in `prisma/migrations/`
- Use `npm run db:studio` to visually inspect/manage data

### 7. Request Type Augmentation
Express Request extended with user context ([src/types/express.d.ts](src/types/express.d.ts)):
```typescript
declare namespace Express {
  export interface Request {
    user?: { id: string; email: string; role: 'ADMIN' | 'MEMBER' }
  }
}
```
Access in controllers via `req.user` after auth middleware.

## Development Workflow

| Task | Command |
|------|---------|
| **Dev server** (watch mode) | `npm run dev` – runs `tsx watch .` |
| **Build** | `npm run build` – compiles TypeScript to `dist/` |
| **Migrate DB** | `npm run db:migrate` – creates migration from schema changes |
| **Generate Prisma** | `npm run db:generate` – regenerates `/generated/prisma` |
| **View DB** | `npm run db:studio` – opens Prisma Studio UI |

**Setup checklist**: Install → `.env` config (JWT_SECRET, DATABASE_URL) → `npm run db:generate` → `npm run db:migrate dev` → `npm run dev`

## Code Patterns & Conventions

### Service Method Signature
Services take a structured input type (usually from validator):
```typescript
async register(data: RegisterTaskInput) { ... }
// or with context:
async update({ taskId, data, userId, userRole }: { ... }) { ... }
```

### Controller Pattern
1. Parse request body with Zod schema
2. Extract params/user from request
3. Call service method
4. Return response with status code
```typescript
async signUp = async (req: Request, res: Response) => {
  const { email, password, name, role } = signUpSchema.parse(req.body)
  const user = await this.authService.register({ email, password, name, role })
  const token = this.JWTService.generateToken({ userId: user.id, ... })
  return res.status(201).json({ user, token })
}
```

### Authorization in Services
Check role-based permissions:
```typescript
if (userRole === 'MEMBER' && task.assigned_to !== userId) {
  throw new UnauthorizedError('You do not have permission...')
}
```

## Key Files Reference

| File | Purpose |
|------|---------|
| [src/server.ts](src/server.ts) | Express app setup, middleware registration |
| [prisma/schema.prisma](prisma/schema.prisma) | Data model definitions |
| [src/validators/](src/validators/) | Zod input schemas (auth, tasks, teams) |
| [src/services/](src/services/) | Business logic, error throwing |
| [src/repositories/](src/repositories/) | Prisma queries only |
| [src/controllers/](src/controllers/) | HTTP handling, validation triggers |
| [src/routes/](src/routes/) | Endpoint definitions, middleware stacking, DI |
| [src/middlewares/](src/middlewares/) | Auth, authorization, error handling |
| [src/errors/](src/errors/) | Custom error classes |
| [src/lib/prisma.ts](src/lib/prisma.ts) | Prisma client singleton |

## When Adding Features

1. **New endpoint**: Create validator schema → service method → controller method → route definition
2. **New model**: Update [schema.prisma](prisma/schema.prisma) → migrate → create repository methods
3. **New error type**: Extend Error class in [src/errors/](src/errors/), update error handler if special status needed
4. **Database query**: Add to repository, never call `prisma` from controller/service directly
5. **Authorization**: Check role in middleware stack; for record ownership, check in service logic

## Role-Based Access Control

- **ADMIN**: All operations on users, teams, and tasks
- **MEMBER**: View team tasks, edit only own assigned tasks
- Middleware checks endpoint access; service checks record ownership
