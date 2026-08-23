import { Router } from 'express'
import { getSuggestions, refreshSuggestions, getFarmerContextSnapshot } from '../controllers/personalizationController.js'
import { authMiddleware } from '../middlewares/auth.js'

const router = Router()

// GET /api/suggestions — for current logged-in farmer
router.get('/', authMiddleware, getSuggestions)
// GET /api/suggestions/:farmerId
router.get('/:farmerId', authMiddleware, getSuggestions)
// POST /api/suggestions/refresh — force cache invalidation & regenerate
router.post('/refresh', authMiddleware, refreshSuggestions)
// GET /api/suggestions/:farmerId/context — debug farm context snapshot
router.get('/:farmerId/context', authMiddleware, getFarmerContextSnapshot)

export default router
