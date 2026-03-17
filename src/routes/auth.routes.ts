import { Router } from 'express'
import { AuthService } from '../services/auth.service.js'
import { AuthRepository } from '../repositories/auth.repository.js'
import { AuthController } from '../controllers/auth.controller.js'
import { JWTService } from '../services/jwt.service.js'
import { authenticate } from '../middlewares/authenticate.middleware.js'

const router = Router()

const authRepository = new AuthRepository()
const authService = new AuthService(authRepository)
const jwtService = new JWTService()
const authController = new AuthController(authService, jwtService)

router.post('/auth/register', authController.signUp)
router.post('/auth/login', authController.signIn)
router.post('/auth/logout', authController.signOut)
router.get('/auth/me', authenticate, async (req, res) => {
  res.json({ user: req.user })
})

export default router
