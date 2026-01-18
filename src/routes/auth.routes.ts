import { Router } from 'express'
import { AuthService } from '../services/auth.service.js'
import { AuthRepository } from '../repositories/auth.repository.js'
import { AuthController } from '../controllers/auth.controller.js'
import { JWTService } from '../services/jwt.service.js'

const router = Router()

const authRepository = new AuthRepository()
const authService = new AuthService(authRepository)
const jwtService = new JWTService()
const authController = new AuthController(authService, jwtService)

router.post('/auth/register', authController.signUp)
router.post('/auth/login', authController.signIn)

export default router
