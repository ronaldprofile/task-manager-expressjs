import { prisma } from "../lib/prisma.js"
import app from "../lib/create-server.js"
import request from "supertest"
import jwt from "jsonwebtoken"

const PATH = "/auth/register"

describe("Integration: Auth", () => {
  describe("Register", () => {
    it("should return `201` status and user details", async () => {
      const response = await request(app).post(PATH).send({
        role: "ADMIN",
        name: "Ronald Tomaz",
        email: "canuto@gmail.com",
        password: "123456"
      })

      const newUser = await prisma.user.findFirst()

      expect(newUser).not.toBeNull()

      expect(response.status).toBe(201)

      expect(response.body.user).toHaveProperty("email", "canuto@gmail.com")
      expect(response.body.user).toHaveProperty("role", "ADMIN")
    })

    it("should return valid session token", async () => {
      const { body } = await request(app).post(PATH).send({
        role: "ADMIN",
        name: "Ronald Tomaz",
        email: "canuto@gmail.com",
        password: "123456"
      })

      expect(body.token).toBeDefined()

      const decoded = jwt.verify(body.token, process.env.JWT_SECRET as string)

      expect(decoded).toMatchObject({
        userId: expect.any(String),
        email: "canuto@gmail.com",
        role: "ADMIN"
      })
    })
  })
})
