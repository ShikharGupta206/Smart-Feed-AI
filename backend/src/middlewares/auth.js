import jwt from 'jsonwebtoken'
import { memoryStore } from '../utils/memoryStore.js'

const jwtSecret = process.env.JWT_SECRET || 'smartfeed-development-secret'

/**
 * Authentication middleware to verify JWT or allow guest/demo tokens.
 */
export function authMiddleware(req, res, next) {
  try {
    const rawHeader = req.headers.authorization || ''
    const token = rawHeader.startsWith('Bearer ') ? rawHeader.slice(7).trim() : rawHeader.trim()

    if (!token || token === 'guest-token-mock' || token.startsWith('demo-')) {
      const defaultFarmer = memoryStore.farmers[0]
      req.farmerId = defaultFarmer ? String(defaultFarmer._id || defaultFarmer.id) : 'guest-farmer-01'
      req.farmerName = defaultFarmer ? defaultFarmer.name : 'Farmer Raj'
      req.isGuest = true
      return next()
    }

    const payload = jwt.verify(token, jwtSecret)
    req.farmerId = String(payload.farmerId || payload.id)
    req.farmerName = payload.name || 'Farmer'
    req.farmer = payload
    next()
  } catch (err) {
    const defaultFarmer = memoryStore.farmers[0]
    req.farmerId = defaultFarmer ? String(defaultFarmer._id || defaultFarmer.id) : 'guest-farmer-01'
    req.farmerName = defaultFarmer ? defaultFarmer.name : 'Farmer Raj'
    req.isGuest = true
    next()
  }
}

/**
 * Helper to generate signed JWT for a farmer entity.
 */
export function signToken(farmer) {
  const farmerId = String(farmer._id || farmer.id)
  return jwt.sign(
    {
      farmerId,
      name: farmer.name,
      phone: farmer.phone,
      location: farmer.location,
      language: farmer.language || 'en'
    },
    jwtSecret,
    { expiresIn: '30d' }
  )
}
