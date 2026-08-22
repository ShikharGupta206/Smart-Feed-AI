import { Router } from 'express'
import { signup, login, getProfile, updateProfile } from '../controllers/authController.js'
import { authMiddleware } from '../middlewares/auth.js'

const router = Router()

router.post('/signup', signup)
router.post('/login', login)
router.get('/me', authMiddleware, getProfile)
router.put('/profile', authMiddleware, updateProfile)

export default router
