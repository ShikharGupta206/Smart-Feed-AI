import { Router } from 'express'
import { getCoachSteps, updateCoachStep } from '../controllers/coachController.js'
import { authMiddleware } from '../middlewares/auth.js'

const router = Router()

router.get('/', authMiddleware, getCoachSteps)
router.put('/stage/:stageNumber', authMiddleware, updateCoachStep)
router.post('/stage/:stageNumber', authMiddleware, updateCoachStep)

export default router
