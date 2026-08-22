import { Router } from 'express'
import { chat, getSuggestions } from '../controllers/assistantController.js'
import { authMiddleware } from '../middlewares/auth.js'

const router = Router()

router.post('/chat', authMiddleware, chat)
router.get('/suggestions', authMiddleware, getSuggestions)

export default router
