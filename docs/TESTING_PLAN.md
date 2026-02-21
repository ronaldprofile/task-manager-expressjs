# API Testing Implementation Plan

## Overview

Implement a balanced testing strategy using **Vitest + Supertest** for integration tests (HTTP endpoints) and unit tests (services with mocked dependencies). Use an in-memory SQLite database for integration tests to avoid PostgreSQL setup complexity while maintaining realistic database behavior. Start with authentication flows, then progress to tasks/teams features.

---

## Phase 1: Setup & Infrastructure

### 1.1 Install Testing Dependencies

Add the following packages to `package.json`:

- **vitest** (test runner, faster than Jest)
- **@vitest/ui** (visual test dashboard)
- **supertest** (HTTP assertion library)
- **@types/supertest** (TypeScript definitions)
- **@prisma/internals** (for testing utilities)
- **better-sqlite3** (in-memory DB support)
- **@faker-js/faker** (realistic test data generation)

### 1.2 Configure Vitest

Create `vitest.config.ts` to:
- Set TypeScript loader
- Configure test directory pattern (`**/*.test.ts`, `**/*.spec.ts`)
- Set up in-memory database for Prisma
- Define test globals (`describe`, `it`, `expect` without imports)
- Configure code coverage thresholds (suggest 70%+ unit, 50%+ integration)

### 1.3 Setup Test Database

Create `src/test/setup.ts`:
- Initialize Prisma with SQLite in-memory database
- Run migrations on test startup
- Export test Prisma instance for reuse
- Create helper to reset database between tests

### 1.4 Add Test Scripts to package.json

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

---

## Phase 2: Test Infrastructure & Helpers

### 2.1 Create Test Utilities Directory (`src/test/`)

Files to create:
- **setup.ts** – Database initialization and cleanup
- **factories.ts** – Faker-based test data generators (createUser, createTeam, createTask)
- **helpers.ts** – Utility functions (seedDatabase, resetDatabase, createAuthToken)
- **mocks.ts** – Mock implementations for services/repositories
- **fixtures.ts** – Hardcoded test data for static scenarios

### 2.2 Implement Database Seeding Helper

Create function to:
- Generate test users (ADMIN + MEMBER roles)
- Create test teams with members
- Create tasks with various statuses/priorities
- Return IDs for test assertions

### 2.3 Implement Auth Token Helper

- Generate valid JWT tokens for authenticated requests
- Create expired tokens to test token validation
- Create malformed tokens to test error handling

---

## Phase 3: Unit Tests (Services Layer)

### 3.1 Auth Service Unit Tests

File: `src/services/auth.service.test.ts`

Test coverage:
- **Register**: Valid user creation, email uniqueness error, password hashing verification, default MEMBER role
- **Login**: Successful login, non-existent user error, wrong password error, password not returned in response
- Mock AuthRepository to isolate service logic

### 3.2 JWT Service Unit Tests

File: `src/services/jwt.service.test.ts`

Test coverage:
- **Generate token**: Payload structure, expiration (24h), timestamp accuracy
- **Verify token**: Valid token parsing, expired token rejection, malformed token rejection
- **Extract claims**: userId, email, role extraction correctness

### 3.3 Tasks Service Unit Tests

File: `src/services/tasks.service.test.ts`

Test coverage:
- **Create**: Valid creation, missing team error, assignedTo user validation, task defaults
- **Update**: Successful update, ADMIN permissions, MEMBER self-only permission, task not found error
- **Get team tasks**: ADMIN sees all, MEMBER sees only own tasks, team member validation
- Mock TaskRepository and dependencies

### 3.4 Teams Service Unit Tests

File: `src/services/teams.service.test.ts`

Test coverage:
- **Create team**: Valid creation, name/description constraints
- **Add members**: Bulk add success, user existence validation, transaction rollback on error
- **Remove members**: Bulk remove success, non-member error handling
- Mock TeamRepository and dependencies

### 3.5 Validator Unit Tests

Files: `src/validators/*.test.ts`

Test coverage:
- **signUpSchema**: Email format, password length (≥6), role enum validation
- **loginSchema**: Email required, password required
- **tasksSchema**: Title length (2-100), priority/status enums, optional description
- **teamsSchema**: Name/description length constraints

---

## Phase 4: Integration Tests (API Endpoints)

### 4.1 Authentication Integration Tests

File: `src/routes/auth.routes.test.ts`

Test coverage:
- **POST /auth/register**: Successful creation (201), duplicate email (400), invalid input (400), password hashing verification
- **POST /auth/login**: Successful login with token (200), wrong credentials (401), missing account (404)
- Test full HTTP flow: request → validation → service → response

### 4.2 Tasks Integration Tests

File: `src/routes/tasks.routes.test.ts`

Test coverage:
- **GET /tasks**: ADMIN sees all (with auth), MEMBER forbidden (403), no auth required (401)
- **GET /tasks/:teamId**: ADMIN sees all, MEMBER sees only own tasks, invalid team (404)
- **POST /tasks/:teamId/:assignedTo**: ADMIN only, creates task, validates team/user exist
- **PUT /tasks/:taskId**: ADMIN updates any, MEMBER updates own only, task not found (404)
- **DELETE /tasks/:taskId**: ADMIN only, deletes task, returns 204
- Test with real database to validate constraints

### 4.3 Teams Integration Tests

File: `src/routes/teams.routes.test.ts`

Test coverage:
- **GET /teams**: ADMIN only (requires auth)
- **GET /teams/:teamId/members**: ADMIN only, returns members list
- **POST /teams**: Creates team, validates schema, ADMIN only
- **PUT /teams/:teamId**: Updates team, ADMIN only
- **POST /teams/:teamId/member/add**: Bulk add users, validates user IDs, ADMIN only
- **DELETE /teams/:teamId/member/remove**: Bulk remove users, ADMIN only

### 4.4 Error Handling Integration Tests

File: `src/middlewares/error.handler.middleware.test.ts`

Test coverage:
- **Zod validation errors**: Returns 400 with formatted field messages
- **Custom errors** (UnauthorizedError, BadRequestError): Correct status codes
- **Unexpected errors**: Returns 500 (Internal Server Error)
- **Missing auth**: Returns 401 (Unauthorized)
- **Insufficient permissions**: Returns 403 (Forbidden)

---

## Phase 5: Test Data & Best Practices

### 5.1 Test Data Strategy

- Use **Faker.js** for realistic but random data (prevents test interdependencies)
- Create factory functions: `createUser()`, `createTeam()`, `createTaskData()`
- Use **fixtures** for edge cases: empty strings, max-length values, special characters
- Reset database before each test suite (not each test, for performance)

### 5.2 Test Organization

- One file per route/service/feature
- Group related tests with `describe()` blocks
- Use clear test names: `"should return 401 when token is expired"`
- Separate unit and integration test directories if needed

### 5.3 Assertions Structure (Pattern)

```typescript
it("should return 403 when MEMBER updates another's task", async () => {
  // Arrange: Set up prerequisites
  const member = await createUser({ role: "MEMBER" })
  const task = await createTask({ assigned_to: otherMemberId })
  
  // Act: Perform the action
  const response = await supertest(app)
    .put(`/tasks/${task.id}`)
    .set("Authorization", `Bearer ${getToken(member)}`)
    .send({ title: "Hacked" })
  
  // Assert: Verify results
  expect(response.status).toBe(403)
  expect(response.body.message).toContain("permission")
})
```

---

## Phase 6: Coverage & Documentation

### 6.1 Coverage Goals

- **Unit tests**: 80%+ coverage for services/validators (critical business logic)
- **Integration tests**: Hit all major endpoints with happy path + error cases
- Focus on high-value: authentication, authorization checks, business rule validation
- Less critical: simple getters, middleware pass-through

### 6.2 Test Documentation

Create or update `docs/TESTING.md` with:
- How to run tests locally
- How to add new tests (with examples)
- Test database setup explanation
- Common patterns and helper functions
- Debugging tips (filter tests with `it.only`)

---

## Implementation Steps (In Order)

1. **Install testing dependencies** → Add packages to `package.json` and run `npm install`
2. **Create vitest.config.ts** → Configure Vitest + TypeScript
3. **Create test setup infrastructure** → `src/test/setup.ts`, `factories.ts`, `helpers.ts`
4. **Unit tests for validators** → Fastest to run, immediate feedback
5. **Unit tests for JWT & Auth services** → Foundation for auth integration tests
6. **Integration tests for Auth routes** → Critical for entire app
7. **Unit tests for Tasks/Teams services** → Expand service coverage
8. **Integration tests for Tasks/Teams routes** → Comprehensive endpoint testing
9. **Error handling tests** → Edge cases and resilience
10. **Add code coverage checks** → Fail CI if below thresholds
11. **Create docs/TESTING.md** → Developer guide for team

---

## Verification & Commands

- **Run all tests**: `npm run test` ✓ should pass 100%
- **Check coverage**: `npm run test:coverage` ✓ should show ≥70% unit, ≥50% integration
- **Watch mode**: `npm run test:watch` ✓ allows TDD development
- **Visual dashboard**: `npm run test:ui` ✓ for browser-based test runner
- **Pre-commit hook** (optional): Run tests before git commit to prevent broken builds

---

## Essential References & Best Practices

### Official Documentation

- [Vitest Documentation](https://vitest.dev) – Complete testing framework guide
- [Supertest Documentation](https://github.com/visionmedia/supertest) – HTTP assertion library
- [Testing Library Best Practices](https://testing-library.com/docs/queries/about#priority) – Assertion priority guidelines

### API Testing Best Practices

1. **Arrange-Act-Assert Pattern**: Set up state → perform action → verify results
2. **Test Behavior, Not Implementation**: Test "user cannot update others' tasks" not "function checks userId"
3. **Isolation**: Each test should be independent; don't rely on test order
4. **Realistic Data**: Use Faker for randomness; harder to write flaky tests
5. **Clear Naming**: Test name should describe the scenario and expected outcome
6. **Focus on Authorization**: API testing must verify who can access what
7. **Error Cases First**: Write tests for failures; happy path is obvious
8. **Database State**: Reset between test suites (fast); use transactions if testing atomicity

### Common Pitfalls to Avoid

- ❌ Global state – Don't share DB connection across tests without cleanup
- ❌ Hardcoded IDs – Use generated IDs; databases might have constraints
- ❌ Sleeping in tests – Use event-driven assertions instead of `await delay(1000)`
- ❌ Testing library code – Don't verify bcrypt hashes match; trust bcrypt and verify it's called
- ❌ Skipping tests in commits – Keep codebase clean (`it.skip` should be temporary)

### Recommended Reading

- *"Testing Node.js Applications"* by Rogerio De Paula – Node-specific patterns
- *"The Practical Test Pyramid"* by Ham Vocke – Unit vs integration balance
- [Google Testing Blog](https://testing.googleblog.com) – Industry-standard patterns

---

## Testing Checklist: What's Worth Testing

### 🔴 Critical (100% coverage needed)

- ✅ **Authentication**: Register/login success, credential validation, JWT generation/verification
- ✅ **Authorization**: ADMIN/MEMBER role enforcement, record-level access (user can't edit others' tasks)
- ✅ **Input Validation**: All Zod schemas (email format, password length, enum values)
- ✅ **Error Handling**: Custom errors map to correct HTTP status codes (401/403/400/500)
- ✅ **Database Queries**: Services call repositories correctly with right parameters

### 🟡 High Value (80%+ coverage)

- ✅ **Task Ownership Check**: MEMBER can only update own assigned tasks
- ✅ **Team Member Validation**: Can't add non-existent users, can't create tasks for non-members
- ✅ **Bulk Operations**: Add/remove members with transaction handling (all-or-nothing)
- ✅ **Default Values**: Tasks default to PENDING/MEDIUM, users default to MEMBER role
- ✅ **Business Rules**: Task status/priority enums enforced, unique email constraint

### 🟢 Medium Value (70%+ coverage)

- ✅ **Happy Path Flows**: Successful CRUD operations end-to-end
- ✅ **Forbidden Access**: Correct 403 responses for unauthorized actions
- ✅ **Not Found Responses**: 404 for missing teams/users/tasks
- ✅ **Response Structure**: All endpoints return correct JSON shape
- ✅ **Status Codes**: Each endpoint returns appropriate HTTP status (201 for created, 204 for deleted, etc.)

### 🔵 Nice to Have (if time permits)

- [ ] **Performance**: Tasks complete within SLA (e.g., GET /tasks < 200ms)
- [ ] **Concurrency**: Two simultaneous task updates don't cause duplicates
- [ ] **Rate Limiting**: If implemented in future
- [ ] **API Documentation**: Verify OpenAPI/Swagger accuracy
- [ ] **Pagination**: If implemented in future (GET /tasks?limit=10&offset=20)

### 🟣 Not Worth Testing (Trust External Libraries)

- [ ] bcrypt hashing correctness – Battle-tested library
- [ ] Prisma ORM query building – Prisma's own tests verify this
- [ ] JWT signature verification – jsonwebtoken library already tested
- [ ] Express middleware chains – Express ecosystem thoroughly tested

---

## Summary: Why Vitest + Supertest + In-Memory SQLite

This approach is optimal for your project because:

1. **Fast Feedback**: Vitest is 10x faster than Jest for small-to-medium codebases
2. **Realistic Database Testing**: In-memory SQLite respects schema relationships, constraints, and migrations
3. **Zero External Dependencies**: No need to spin up PostgreSQL container—tests run instantly on dev machines
4. **Maintainable**: Balanced unit + integration tests catch bugs early without excessive mocking
5. **TypeScript-First**: Vitest and your codebase already use TypeScript; no configuration friction
6. **Industry Standard**: Supertest is the de-facto HTTP testing library for Node.js/Express APIs

---

## Next Steps

Once this plan is approved, implementation can proceed in the order specified above. Each phase builds on previous work, allowing for incremental validation and testing.