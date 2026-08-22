import { Router } from 'express'
import {
  createTest,
  getFarmerTests,
  getTestDetail,
  deleteTest,
  getTestQR
} from '../controllers/testController.js'
import { authMiddleware } from '../middlewares/auth.js'

const router = Router()

router.post('/', authMiddleware, createTest)
router.post('/demo', authMiddleware, createTest)
router.get('/', authMiddleware, getFarmerTests)
router.get('/:testId/detail', authMiddleware, getTestDetail)
router.get('/:testId/qr', authMiddleware, getTestQR)
router.get('/:farmerId', authMiddleware, getFarmerTests)
router.delete('/:testId', authMiddleware, deleteTest)

export default router
