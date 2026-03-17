import { prisma } from "../lib/prisma.js";
import app from "../lib/create-server.js";
import request from "supertest";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import {
  makeRegisterUserData,
  makeSignInUserData,
} from "../test/factories/index.js";
import { seedUser } from "./helpers/seed.js";

const PATH_AUTH_REGISTER = "/auth/register";
const PATH_AUTH_LOGIN = "/auth/login";
const PATH_AUTH_LOGOUT = "/auth/logout";

describe("Integration: Auth", () => {
  describe("[POST] /auth/register", () => {
    it("should return 400 when email is already registered", async () => {
      const payload = makeRegisterUserData({ email: "maria@gmail.com" });

      await prisma.user.create({ data: payload });

      const response = await request(app)
        .post(PATH_AUTH_REGISTER)
        .send(payload)
        .expect(400);

      expect(response.body).toHaveProperty("message", "Email já cadastrado");
    });

    it("should return 400 when input data is invalid", async () => {
      const response = await request(app)
        .post(PATH_AUTH_REGISTER)
        .send({
          role: "no-exists-role",
          name: "John Doe",
          email: "johndoe",
          password: "1234",
        })
        .expect(400);

      expect(response.body).toMatchObject({
        message: "Validation failed",
        errors: expect.arrayContaining([
          expect.objectContaining({ field: "email" }),
          expect.objectContaining({ field: "password" }),
          expect.objectContaining({ field: "role" }),
        ]),
      });
    });

    it("should return 201 with user details on successful register", async () => {
      const payload = makeRegisterUserData({
        name: "John Doe",
        email: "johndoe@gmail.com",
        role: "ADMIN",
      });

      const response = await request(app)
        .post(PATH_AUTH_REGISTER)
        .send(payload)
        .expect(201);

      const newUser = await prisma.user.findFirst();
      expect(newUser).not.toBeNull();

      expect(response.body.user).toMatchObject({
        role: payload.role,
        email: payload.email,
        name: payload.name,
      });
    });

    it("should return a signed JWT token in httpOnly cookie on successful register", async () => {
      const payload = makeRegisterUserData({
        email: "johndoe@gmail.com",
        role: "ADMIN",
      });

      const response = await request(app)
        .post(PATH_AUTH_REGISTER)
        .send(payload)
        .expect(201);

      const cookies = response.headers["set-cookie"];
      expect(cookies).toBeDefined();
      expect(Array.isArray(cookies)).toBe(true);

      const tokenCookie = cookies.find((cookie: string) =>
        cookie.startsWith("token="),
      );
      expect(tokenCookie).toBeDefined();
      expect(tokenCookie).toContain("HttpOnly");

      const token = tokenCookie.split(";")[0].split("=")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string);

      expect(decoded).toMatchObject({
        userId: response.body.user.id,
        email: "johndoe@gmail.com",
        role: "ADMIN",
      });
    });

    it("should store password as a bcrypt hash, not plain text", async () => {
      const user = makeRegisterUserData({ password: "123456" });

      await request(app).post(PATH_AUTH_REGISTER).send(user).expect(201);

      const userFounded = await prisma.user.findUnique({
        where: { email: user.email },
      });

      expect(userFounded?.password).not.toBe(user.password);
      expect(await bcrypt.compare(user.password, userFounded!.password)).toBe(
        true,
      );
    });
  });

  describe("[POST] /auth/login", () => {
    const user = {
      email: "maria@gmail.com",
      password: "maria1234",
    };

    beforeEach(async () => {
      await seedUser({
        email: user.email,
        password: user.password,
      });
    });

    it("should return 400 when no account exists with given email", async () => {
      const signInData = makeSignInUserData();

      const response = await request(app)
        .post(PATH_AUTH_LOGIN)
        .send(signInData)
        .expect(400);

      expect(response.body.message).toBe("Credenciais inválidas");
    });

    it("should return 400 when password does not match", async () => {
      const response = await request(app)
        .post(PATH_AUTH_LOGIN)
        .send({ email: user.email, password: "wrong-password" })
        .expect(400);

      expect(response.body.message).toBe("Credenciais inválidas");
    });

    it("should return 200 with user data and set httpOnly cookie on successful login", async () => {
      const response = await request(app)
        .post(PATH_AUTH_LOGIN)
        .send({ email: user.email, password: user.password })
        .expect(200);

      const userFounded = await prisma.user.findUnique({
        where: { email: user.email },
      });

      expect(response.body.user).toMatchObject({
        name: userFounded!.name,
        email: userFounded!.email,
        role: userFounded!.role,
      });

      const cookies = response.headers["set-cookie"];
      expect(cookies).toBeDefined();
      expect(Array.isArray(cookies)).toBe(true);

      const tokenCookie = cookies.find((cookie: string) =>
        cookie.startsWith("token="),
      );
      expect(tokenCookie).toBeDefined();
      expect(tokenCookie).toContain("HttpOnly");
    });
  });

  describe("[POST] /auth/logout", () => {
    const user = {
      email: "logout-test@gmail.com",
      password: "test1234",
    };

    beforeEach(async () => {
      await seedUser({
        email: user.email,
        password: user.password,
      });
    });

    it("should return 200 and clear the token cookie", async () => {
      const loginResponse = await request(app)
        .post(PATH_AUTH_LOGIN)
        .send({ email: user.email, password: user.password })
        .expect(200);

      const loginCookies = loginResponse.headers["set-cookie"];
      expect(loginCookies).toBeDefined();

      const logoutResponse = await request(app)
        .post(PATH_AUTH_LOGOUT)
        .set("Cookie", loginCookies)
        .expect(200);

      const logoutCookies = logoutResponse.headers["set-cookie"];
      expect(logoutCookies).toBeDefined();

      const clearedCookie = logoutCookies.find((cookie: string) =>
        cookie.startsWith("token="),
      );
      expect(clearedCookie).toBeDefined();
      expect(
        clearedCookie.includes("Max-Age=0") ||
          clearedCookie.includes("Expires=Thu, 01 Jan 1970"),
      ).toBe(true);
    });

    it("should return 200 even without a token cookie", async () => {
      await request(app).post(PATH_AUTH_LOGOUT).expect(200);
    });
  });
});
