import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { connectDB, isDbConnected } from './config/db.js'
import authRoutes from './routes/authRoutes.js'
import testRoutes from './routes/testRoutes.js'
import batchRoutes from './routes/batchRoutes.js'
import reportRoutes from './routes/reportRoutes.js'
import assistantRoutes from './routes/assistantRoutes.js'
import analyticsRoutes from './routes/analyticsRoutes.js'
import coachRoutes from './routes/coachRoutes.js'
import { getTestQR } from './controllers/testController.js'
import { generateAdvisoriesForParameters } from './utils/mockParameters.js'
import { authMiddleware } from './middlewares/auth.js'
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js'

const app = express()
const port = Number(process.env.PORT || 8000)

// Middleware setup
app.use(cors({
  origin: process.env.CLIENT_ORIGIN ? [process.env.CLIENT_ORIGIN, 'http://localhost:5173', 'http://127.0.0.1:5173'] : true,
  credentials: true
}))

// High payload limit for handling base64 feed/silage photos
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

// Request logger
app.use((req, res, next) => {
  if (process.env.NODE_ENV !== 'test' && !req.path.startsWith('/api/health')) {
    console.log(`[HTTP] ${req.method} ${req.path}`)
  }
  next()
})

// System Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    appName: 'SmartFeed AI API',
    version: '2.0.0',
    database: isDbConnected() ? 'mongodb' : 'memory-demo',
    geminiKeyConfigured: Boolean(process.env.GEMINI_API_KEY),
    geminiActiveModel: 'gemini-3.6-flash',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  })
})

// Traceability QR code direct endpoint
app.get('/api/qr/:testId', authMiddleware, getTestQR)

// Advisory calculation direct endpoint (compatibility)
app.post('/api/advisory', authMiddleware, (req, res) => {
  const params = req.body.parameters || req.body
  const messages = generateAdvisoriesForParameters(params, req.body.sampleType || 'Silage')
  res.json({ messages })
})

// API Routers
app.use('/api/auth', authRoutes)
app.use('/api/tests', testRoutes)
app.use('/api/batches', batchRoutes)
app.use('/api/reports', reportRoutes)
app.use('/api/assistant', assistantRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/silage-coach', coachRoutes)

// 404 & Error Handlers
app.use(notFoundHandler)
app.use(errorHandler)

// Initialize Database connection asynchronously (non-blocking)
connectDB()

// Start Server
const server = app.listen(port, () => {
  console.log(`=========================================`)
  console.log(` SmartFeed AI Backend running on port ${port}`)
  console.log(` API Health: http://localhost:${port}/api/health`)
  console.log(` Mode: ${process.env.NODE_ENV || 'development'}`)
  console.log(`=========================================`)
})

export default app
