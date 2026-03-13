import app from "../lib/create-server.js"
import request from "supertest"
import { makeAuthToken } from "./helpers/auth.js"
import { seedTeam, seedTeamMember, seedUser } from "./helpers/seed.js"
import { makeRegisterTeam } from "../test/index.js"

const PATH_TEAMS = "/teams"

describe("Integration: Teams", () => {
  it("should return 401 when user is not authenticated", async () => {
    const { body } = await request(app).get(PATH_TEAMS).expect(401)
    expect(body.message).toBe("Token not provided")
  })

  it("should return 401 when token is invalid", async () => {
    const { body } = await request(app)
      .get(PATH_TEAMS)
      .auth("invalid-token", { type: "bearer" })
      .expect(401)
    expect(body.message).toBe("Token invalid")
  })

  describe("when user role is MEMBER", () => {
    const testCases = [
      ["get", "/teams", false],
      ["get", "/teams/:teamId/members", true],
      ["post", "/teams", false],
      ["put", "/teams/:teamId", true],
      ["post", "/teams/:teamId/member/add", true],
      ["delete", "/teams/:teamId/member/remove", true]
    ] as const

    it.each(testCases)(
      "[%s] %s should return 403 with access denied message",
      async (method, path, needsTeamId) => {
        const team = needsTeamId ? await seedTeam() : null
        const token = makeAuthToken({ role: "MEMBER" })

        const url = needsTeamId ? path.replace(":teamId", team!.id) : path

        const req = request(app)[method](url).auth(token, { type: "bearer" })

        if (method === "post" || method === "put" || method === "delete") {
          req.send({ name: "Test", description: "Test", usersIds: ["id"] })
        }

        const { body } = await req.expect(403)
        expect(body.message).toBe("Access denied")
      }
    )
  })

  describe("when team does not exist", () => {
    it.each([
      ["get", "/teams/non-existing-id/members"],
      ["put", "/teams/non-existing-id"],
      ["post", "/teams/non-existing-id/member/add"],
      ["delete", "/teams/non-existing-id/member/remove"]
    ] as const)(
      "[%s] %s should return 400 with team not found message",
      async (method, path) => {
        const admin = await seedUser({ role: "ADMIN" })
        const token = makeAuthToken({
          userId: admin.id,
          email: admin.email,
          role: admin.role
        })

        const req = request(app)[method](path).auth(token, { type: "bearer" })

        if (method === "put" || method === "post" || method === "delete") {
          req.send({ name: "Test", description: "Test", usersIds: ["id"] })
        }

        const { body } = await req.expect(400)
        expect(body.message).toBe("Team not found")
      }
    )
  })

  describe("[GET] /teams", () => {
    it("should return 200 with empty array when no teams exist", async () => {
      const user = await seedUser({ role: "ADMIN" })
      const token = makeAuthToken({
        userId: user.id,
        email: user.email,
        role: user.role
      })

      const { body } = await request(app)
        .get(PATH_TEAMS)
        .auth(token, { type: "bearer" })
        .expect(200)

      expect(body.teams).toEqual([])
    })

    it("should return 200 with all teams", async () => {
      const admin = await seedUser({ role: "ADMIN" })
      await seedTeam({ name: "Team Alpha" })
      await seedTeam({ name: "Team Beta" })

      const token = makeAuthToken({
        userId: admin.id,
        email: admin.email,
        role: admin.role
      })

      const { body } = await request(app)
        .get(PATH_TEAMS)
        .auth(token, { type: "bearer" })
        .expect(200)

      expect(body.teams).toHaveLength(2)
      expect(body.teams).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: "Team Alpha" }),
          expect.objectContaining({ name: "Team Beta" })
        ])
      )
    })
  })

  describe("[GET] /teams/:teamId/members", () => {
    it("should return 200 with empty array when team has no members", async () => {
      const admin = await seedUser({ role: "ADMIN" })
      const team = await seedTeam()
      const token = makeAuthToken({
        userId: admin.id,
        email: admin.email,
        role: admin.role
      })

      const { body } = await request(app)
        .get(`${PATH_TEAMS}/${team.id}/members`)
        .auth(token, { type: "bearer" })
        .expect(200)

      expect(body.members).toEqual([])
    })

    it("should return 200 with all team members", async () => {
      const admin = await seedUser({ role: "ADMIN" })
      const member1 = await seedUser({
        role: "MEMBER",
        email: "member1@test.com"
      })
      const member2 = await seedUser({
        role: "MEMBER",
        email: "member2@test.com"
      })
      const team = await seedTeam()
      await seedTeamMember(member1.id, team.id)
      await seedTeamMember(member2.id, team.id)

      const token = makeAuthToken({
        userId: admin.id,
        email: admin.email,
        role: admin.role
      })

      const { body } = await request(app)
        .get(`${PATH_TEAMS}/${team.id}/members`)
        .auth(token, { type: "bearer" })
        .expect(200)

      expect(body.members).toHaveLength(2)
      expect(body.members).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: member1.id, email: member1.email }),
          expect.objectContaining({ id: member2.id, email: member2.email })
        ])
      )
    })
  })

  describe("[POST] /teams", () => {
    it("should return 400 when name is missing", async () => {
      const admin = await seedUser({ role: "ADMIN" })
      const token = makeAuthToken({
        userId: admin.id,
        email: admin.email,
        role: admin.role
      })

      const { body } = await request(app)
        .post(PATH_TEAMS)
        .auth(token, { type: "bearer" })
        .send({ description: "Valid description" })
        .expect(400)

      expect(body.message).toBe("Validation failed")
    })

    it("should return 400 when name is too short", async () => {
      const admin = await seedUser({ role: "ADMIN" })
      const token = makeAuthToken({
        userId: admin.id,
        email: admin.email,
        role: admin.role
      })

      const { body } = await request(app)
        .post(PATH_TEAMS)
        .auth(token, { type: "bearer" })
        .send({ name: "A", description: "Valid description" })
        .expect(400)

      expect(body.message).toBe("Validation failed")
    })

    it("should return 400 when description is missing", async () => {
      const admin = await seedUser({ role: "ADMIN" })
      const token = makeAuthToken({
        userId: admin.id,
        email: admin.email,
        role: admin.role
      })

      const { body } = await request(app)
        .post(PATH_TEAMS)
        .auth(token, { type: "bearer" })
        .send({ name: "Valid Name" })
        .expect(400)

      expect(body.message).toBe("Validation failed")
    })

    it("should return 201 with created team", async () => {
      const admin = await seedUser({ role: "ADMIN" })
      const token = makeAuthToken({
        userId: admin.id,
        email: admin.email,
        role: admin.role
      })
      const payload = makeRegisterTeam({
        name: "Engineering Team",
        description: "Backend development team"
      })

      const { body } = await request(app)
        .post(PATH_TEAMS)
        .auth(token, { type: "bearer" })
        .send(payload)
        .expect(201)

      expect(body.team).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          name: "Engineering Team",
          description: "Backend development team"
        })
      )
    })
  })

  describe("[PUT] /teams/:teamId", () => {
    it("should return 400 when name is too short", async () => {
      const admin = await seedUser({ role: "ADMIN" })
      const team = await seedTeam()
      const token = makeAuthToken({
        userId: admin.id,
        email: admin.email,
        role: admin.role
      })

      const { body } = await request(app)
        .put(`${PATH_TEAMS}/${team.id}`)
        .auth(token, { type: "bearer" })
        .send({ name: "A", description: "Valid description" })
        .expect(400)

      expect(body.message).toBe("Validation failed")
    })

    it("should return 200 with updated team", async () => {
      const admin = await seedUser({ role: "ADMIN" })
      const team = await seedTeam({ name: "Original Name" })
      const token = makeAuthToken({
        userId: admin.id,
        email: admin.email,
        role: admin.role
      })

      const { body } = await request(app)
        .put(`${PATH_TEAMS}/${team.id}`)
        .auth(token, { type: "bearer" })
        .send({ name: "Updated Name", description: "Updated description" })
        .expect(200)

      expect(body.team).toEqual(
        expect.objectContaining({
          id: team.id,
          name: "Updated Name",
          description: "Updated description"
        })
      )
    })
  })

  describe("[POST] /teams/:teamId/member/add", () => {
    it("should return 200 when single user is added to team", async () => {
      const admin = await seedUser({ role: "ADMIN" })
      const member = await seedUser({
        role: "MEMBER",
        email: "member@test.com"
      })
      const team = await seedTeam()
      const token = makeAuthToken({
        userId: admin.id,
        email: admin.email,
        role: admin.role
      })

      const { body } = await request(app)
        .post(`${PATH_TEAMS}/${team.id}/member/add`)
        .auth(token, { type: "bearer" })
        .send({ usersIds: [member.id] })
        .expect(200)

      expect(body.message).toBe("User added")
    })

    it("should return 200 when multiple users are added to team", async () => {
      const admin = await seedUser({ role: "ADMIN" })
      const member1 = await seedUser({
        role: "MEMBER",
        email: "member1@test.com"
      })
      const member2 = await seedUser({
        role: "MEMBER",
        email: "member2@test.com"
      })
      const team = await seedTeam()
      const token = makeAuthToken({
        userId: admin.id,
        email: admin.email,
        role: admin.role
      })

      const { body } = await request(app)
        .post(`${PATH_TEAMS}/${team.id}/member/add`)
        .auth(token, { type: "bearer" })
        .send({ usersIds: [member1.id, member2.id] })
        .expect(200)

      expect(body.message).toBe("User added")
    })
  })

  describe("[DELETE] /teams/:teamId/member/remove", () => {
    it("should return 400 when user to remove does not exist", async () => {
      const admin = await seedUser({ role: "ADMIN" })
      const team = await seedTeam()
      const token = makeAuthToken({
        userId: admin.id,
        email: admin.email,
        role: admin.role
      })

      const { body } = await request(app)
        .delete(`${PATH_TEAMS}/${team.id}/member/remove`)
        .auth(token, { type: "bearer" })
        .send({ usersIds: ["non-existing-user-id"] })
        .expect(400)

      expect(body.message).toContain("Failed to remove user(s)")
    })

    it("should return 204 when user is removed from team", async () => {
      const admin = await seedUser({ role: "ADMIN" })
      const member = await seedUser({
        role: "MEMBER",
        email: "member@test.com"
      })
      const team = await seedTeam()
      await seedTeamMember(member.id, team.id)

      const token = makeAuthToken({
        userId: admin.id,
        email: admin.email,
        role: admin.role
      })

      await request(app)
        .delete(`${PATH_TEAMS}/${team.id}/member/remove`)
        .auth(token, { type: "bearer" })
        .send({ usersIds: [member.id] })
        .expect(204)
    })

    it("should return 204 when multiple users are removed from team", async () => {
      const admin = await seedUser({ role: "ADMIN" })
      const member1 = await seedUser({
        role: "MEMBER",
        email: "member1@test.com"
      })
      const member2 = await seedUser({
        role: "MEMBER",
        email: "member2@test.com"
      })
      const team = await seedTeam()
      await seedTeamMember(member1.id, team.id)
      await seedTeamMember(member2.id, team.id)

      const token = makeAuthToken({
        userId: admin.id,
        email: admin.email,
        role: admin.role
      })

      await request(app)
        .delete(`${PATH_TEAMS}/${team.id}/member/remove`)
        .auth(token, { type: "bearer" })
        .send({ usersIds: [member1.id, member2.id] })
        .expect(204)
    })
  })
})
