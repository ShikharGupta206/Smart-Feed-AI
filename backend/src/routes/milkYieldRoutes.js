import express from 'express'
import { logMilkYield, getMilkYieldLogs, deleteMilkYieldLog } from '../controllers/milkYieldController.js'
import { authMiddleware } from '../middlewares/auth.js'

const router = express.Router()

router.use(authMiddleware)

router.get('/', getMilkYieldLogs)           // GET /api/milk-yield?batchId=SILAGE-001
router.post('/', logMilkYield)              // POST /api/milk-yield
router.delete('/:id', deleteMilkYieldLog)   // DELETE /api/milk-yield/:id

export default router
