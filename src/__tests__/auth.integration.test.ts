import { prisma } from "../lib/prisma.js"
import app from "../lib/create-server.js"
import request from "supertest"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

import { makeRegisterUserData } from "../test/factories/index.js"

const PATH = "/auth/register"

describe("Integration: Auth", () => {
  describe("[POST] /auth/register", () => {
    it("should return `400` status when duplicate email", async () => {
      const payload = makeRegisterUserData({
        email: "maria@gmail.com"
      })

      await prisma.user.create({
        data: payload
      })

      const response = await request(app).post(PATH).send(payload).expect(400)

      expect(response.body).toHaveProperty("message", "Email já cadastrado")
    })

    it("should return `400` status when input is invalid", async () => {
      const response = await request(app)
        .post(PATH)
        .send({
          role: "no-exists-role",
          name: "John Doe",
          email: "johndoe",
          password: "1234"
        })
        .expect(400)

      expect(response.body).toMatchObject({
        message: "Validation failed",
        errors: expect.arrayContaining([
          expect.objectContaining({ field: "email" }),
          expect.objectContaining({ field: "password" }),
          expect.objectContaining({ field: "role" })
        ])
      })
    })

    it("should return `201` status and user details", async () => {
      const payload = makeRegisterUserData({
        name: "John Doe",
        email: "johndoe@gmail.com",
        role: "ADMIN"
      })

      const response = await request(app).post(PATH).send(payload).expect(201)

      const newUser = await prisma.user.findFirst()

      expect(newUser).not.toBeNull()

      expect(response.body.user).toMatchObject({
        role: payload.role,
        email: payload.email,
        name: payload.name
      })
    })

    it("should return valid session token", async () => {
      const payload = makeRegisterUserData({
        email: "johndoe@gmail.com",
        role: "ADMIN"
      })

      const { body } = await request(app).post(PATH).send(payload).expect(201)

      expect(body.token).toBeDefined()

      const decoded = jwt.verify(body.token, process.env.JWT_SECRET as string)

      expect(decoded).toMatchObject({
        userId: body.user.id,
        email: "johndoe@gmail.com",
        role: "ADMIN"
      })
    })

    it("should return valid session token", async () => {
      const user = makeRegisterUserData({
        password: "123456"
      })

      await request(app).post(PATH).send(user).expect(201)

      const userFounded = await prisma.user.findUnique({
        where: { email: user.email }
      })

      expect(userFounded?.password).not.toBe(user.password)

      expect(await bcrypt.compare(user.password, userFounded!.password)).toBe(
        true
      )
    })
  })
})
