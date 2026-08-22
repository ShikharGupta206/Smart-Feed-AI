import { Router } from 'express'
import { getAnalyticsSummary } from '../controllers/analyticsController.js'
import { authMiddleware } from '../middlewares/auth.js'

const router = Router()

router.get('/', authMiddleware, getAnalyticsSummary)

export default router
