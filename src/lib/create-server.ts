import express from "express"
import cors from "cors"
import { AuthRepository } from "../repositories/auth.repository.js"
import { AuthService } from "../services/auth.service.js"
import { JWTService } from "../services/jwt.service.js"
import { AuthController } from "../controllers/auth.controller.js"
import { errorHandler } from "../middlewares/error.handler.middleware.js"

const app = express()

app.use(express.json())
app.use(cors({ origin: "*" }))

const authRepository = new AuthRepository()
const authService = new AuthService(authRepository)
const jwtService = new JWTService()
const authController = new AuthController(authService, jwtService)

app.post("/auth/register", authController.signUp)
app.post("/auth/login", authController.signIn)

app.use(errorHandler)

export default app
