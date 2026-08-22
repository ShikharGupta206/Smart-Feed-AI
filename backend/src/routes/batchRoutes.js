import { Router } from 'express'
import {
  getBatches,
  getBatchDetail,
  createBatch,
  updateBatch,
  logMilkYield,
  getMilkYieldLogs
} from '../controllers/batchController.js'
import { authMiddleware } from '../middlewares/auth.js'

const router = Router()

router.get('/', authMiddleware, getBatches)
router.post('/', authMiddleware, createBatch)
router.get('/:id', authMiddleware, getBatchDetail)
router.put('/:id', authMiddleware, updateBatch)
router.get('/:id/milk-logs', authMiddleware, getMilkYieldLogs)
router.post('/:id/milk-logs', authMiddleware, logMilkYield)

export default router
