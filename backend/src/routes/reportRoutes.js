import { Router } from 'express'
import {
  getReports,
  getReportDetail,
  createReport
} from '../controllers/reportController.js'
import { authMiddleware } from '../middlewares/auth.js'

const router = Router()

router.get('/', authMiddleware, getReports)
router.post('/', authMiddleware, createReport)
router.get('/:id', authMiddleware, getReportDetail)

export default router
