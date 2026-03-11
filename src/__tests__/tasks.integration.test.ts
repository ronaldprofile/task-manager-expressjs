import app from "../lib/create-server.js"
import request from "supertest"
import { makeAuthToken } from "./helpers/auth.js"
import {
  seedTask,
  seedTeam,
  seedTeamMember,
  seedUser,
  seedUserWithTeamAndTask
} from "./helpers/seed.js"
import { makeRegisterTask, makeUpdatedTask } from "../test/index.js"

const PATH_TASKS = "/tasks"

describe("Integration: Tasks", () => {
  it("should return 401 when user is not authenticated", async () => {
    const { body } = await request(app).get(PATH_TASKS).expect(401)
    expect(body.message).toBe("Token not provided")
  })

  it("should return 401 when token is invalid", async () => {
    const { body } = await request(app)
      .get(PATH_TASKS)
      .expect(401)
      .auth("token-invalid", {
        type: "bearer"
      })
    expect(body.message).toBe("Token invalid")
  })

  describe("when task does not exist", () => {
    it.each(["put", "delete"] as const)(
      "[%s] should return 400 when task not found",
      async method => {
        const user = await seedUser({ role: "ADMIN" })
        const token = makeAuthToken({
          userId: user.id,
          email: user.email,
          role: user.role
        })

        const req = request(app)
          [method](`${PATH_TASKS}/no-existing-task-id`)
          .auth(token, { type: "bearer" })

        if (method === "put") {
          req.send(makeUpdatedTask())
        }

        const { body } = await req.expect(400)

        expect(body.message).toBe("Task not found")
      }
    )
  })

  describe("[GET] /tasks", () => {
    it("should return 403 when user role not allowed", async () => {
      const token = makeAuthToken({
        role: "MEMBER"
      })

      const { body } = await request(app)
        .get(PATH_TASKS)
        .auth(token, {
          type: "bearer"
        })
        .expect(403)

      expect(body.message).toBe("Access denied")
    })

    it("should return 400 when team not found", async () => {
      const token = makeAuthToken({
        role: "MEMBER"
      })

      const { body } = await request(app)
        .get(`${PATH_TASKS}/no-existing-team-id`)
        .auth(token, {
          type: "bearer"
        })
        .expect(400)

      expect(body.message).toBe("Team not found")
    })

    it("should return all tasks assigned to the user", async () => {
      const { user, task, team } = await seedUserWithTeamAndTask()

      const token = makeAuthToken({
        userId: user.id,
        email: user.email,
        role: user.role
      })

      const { body } = await request(app)
        .get(`${PATH_TASKS}/${team.id}`)
        .auth(token, { type: "bearer" })
        .expect(200)

      expect(body.tasks).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: task.id, title: task.title })
        ])
      )
    })
  })

  describe("[POST] /tasks", () => {
    it("should return 403 when user role not allowed", async () => {
      const team = await seedTeam()
      const user = await seedUser({
        role: "MEMBER"
      })

      const token = makeAuthToken({
        userId: user.id,
        email: user.email,
        role: user.role
      })

      const payload = makeRegisterTask()
      const { body } = await request(app)
        .post(`${PATH_TASKS}/${team.id}/${user.id}`)
        .auth(token, { type: "bearer" })
        .send(payload)
        .expect(403)

      expect(body.message).toBe("Access denied")
    })

    it("should return 201 with task created", async () => {
      const team = await seedTeam()
      const user = await seedUser({
        role: "ADMIN"
      })

      const token = makeAuthToken({
        userId: user.id,
        email: user.email,
        role: user.role
      })

      const payload = makeRegisterTask()
      const { body } = await request(app)
        .post(`${PATH_TASKS}/${team.id}/${user.id}`)
        .auth(token, { type: "bearer" })
        .send(payload)
        .expect(201)

      expect(body.task).toEqual(
        expect.objectContaining({
          title: payload.title,
          description: payload.description,
          status: payload.status,
          priority: payload.priority,
          assigned_to: user.id
        })
      )
    })
  })

  describe("[PUT] /tasks", () => {
    it("should not allow a MEMBER to update a task assigned to another user", async () => {
      const taskOwner = await seedUser({ role: "MEMBER" })
      const team = await seedTeam()

      await seedTeamMember(taskOwner.id, team.id)
      const task = await seedTask(taskOwner.id, team.id, {
        status: "PENDING",
        priority: "MEDIUM"
      })

      const unauthorizedMember = await seedUser({
        role: "MEMBER",
        email: "unauthorized-user@gmail.com"
      })
      await seedTeamMember(unauthorizedMember.id, team.id)

      const token = makeAuthToken({
        userId: unauthorizedMember.id,
        email: unauthorizedMember.email,
        role: unauthorizedMember.role
      })

      const payload = makeUpdatedTask({
        status: "IN_PROGRESS",
        priority: "HIGH"
      })

      const { body } = await request(app)
        .put(`${PATH_TASKS}/${task.id}`)
        .auth(token, { type: "bearer" })
        .send(payload)
        .expect(403)

      expect(body.message).toBe(
        "You do not have permission to update this task"
      )
    })

    it("should update a task when the user is the assignee", async () => {
      const { user, task } = await seedUserWithTeamAndTask({
        task: {
          status: "PENDING",
          priority: "MEDIUM"
        },
        user: {
          role: "MEMBER"
        }
      })

      const token = makeAuthToken({
        userId: user.id,
        email: user.email,
        role: user.role
      })

      const payload = makeUpdatedTask({
        status: "IN_PROGRESS",
        priority: "HIGH"
      })

      const { body } = await request(app)
        .put(`${PATH_TASKS}/${task.id}`)
        .auth(token, { type: "bearer" })
        .send(payload)
        .expect(200)

      expect(body.task).toEqual(
        expect.objectContaining({
          status: "IN_PROGRESS",
          priority: "HIGH"
        })
      )
    })
  })

  describe("[DELETE] /tasks", () => {
    it("should return 204 when task is deleted successfully", async () => {
      const user = await seedUser({
        role: "ADMIN"
      })

      const team = await seedTeam()
      const task = await seedTask(user.id, team.id)

      const token = makeAuthToken({
        userId: user.id,
        email: user.email,
        role: user.role
      })

      await request(app)
        .delete(`${PATH_TASKS}/${task.id}`)
        .auth(token, { type: "bearer" })
        .expect(204)
    })
  })
})
