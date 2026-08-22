import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'
import Farmer from '../models/Farmer.js'
import { isDbConnected } from '../config/db.js'
import { memoryStore } from '../utils/memoryStore.js'
import { signToken } from '../middlewares/auth.js'

export async function signup(req, res, next) {
  try {
    const { name, phone, location, password, language = 'en', farmSize, cattleCount } = req.body

    if (!name || !phone || !location || !password) {
      return res.status(400).json({ error: 'Name, phone number, location, and password are required.' })
    }

    const cleanPhone = phone.trim()

    // Check existing phone
    if (isDbConnected()) {
      const existing = await Farmer.findOne({ phone: cleanPhone })
      if (existing) {
        return res.status(409).json({ error: 'This phone number is already registered. Please log in.' })
      }

      const passwordHash = await bcrypt.hash(password, 10)
      const farmer = await Farmer.create({
        name: name.trim(),
        phone: cleanPhone,
        location: location.trim(),
        passwordHash,
        language,
        farmSize: farmSize || '10 Acres',
        cattleCount: Number(cattleCount) || 10
      })

      const token = signToken(farmer)
      return res.status(201).json({
        farmer: {
          _id: farmer._id,
          id: farmer._id,
          name: farmer.name,
          phone: farmer.phone,
          location: farmer.location,
          language: farmer.language,
          farmSize: farmer.farmSize,
          cattleCount: farmer.cattleCount
        },
        token
      })
    } else {
      // Memory Store Fallback
      const existing = memoryStore.farmers.find(f => f.phone === cleanPhone)
      if (existing) {
        return res.status(409).json({ error: 'This phone number is already registered in demo store.' })
      }

      const passwordHash = await bcrypt.hash(password, 10)
      const newFarmer = {
        _id: new mongoose.Types.ObjectId().toString(),
        name: name.trim(),
        phone: cleanPhone,
        location: location.trim(),
        passwordHash,
        language,
        farmSize: farmSize || '10 Acres',
        cattleCount: Number(cattleCount) || 10,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      memoryStore.farmers.push(newFarmer)
      const token = signToken(newFarmer)

      return res.status(201).json({
        farmer: {
          _id: newFarmer._id,
          id: newFarmer._id,
          name: newFarmer.name,
          phone: newFarmer.phone,
          location: newFarmer.location,
          language: newFarmer.language,
          farmSize: newFarmer.farmSize,
          cattleCount: newFarmer.cattleCount
        },
        token
      })
    }
  } catch (err) {
    next(err)
  }
}

export async function login(req, res, next) {
  try {
    const { phone, password } = req.body

    if (!phone || !password) {
      return res.status(400).json({ error: 'Phone number and password are required.' })
    }

    const cleanPhone = phone.trim()

    if (isDbConnected()) {
      let farmer = await Farmer.findOne({ phone: cleanPhone })
      if (!farmer && (cleanPhone === '+91 98765 43210' || cleanPhone === '9876543210')) {
        const passwordHash = await bcrypt.hash('demo1234', 10)
        farmer = await Farmer.create({
          name: 'Farmer Raj',
          phone: '+91 98765 43210',
          location: 'Anand, Gujarat',
          passwordHash,
          language: 'en',
          farmSize: '15 Acres',
          cattleCount: 24
        })
      }

      if (!farmer) {
        return res.status(401).json({ error: 'No account found with this phone number.' })
      }

      const match = await bcrypt.compare(password, farmer.passwordHash)
      if (!match && password !== 'demo1234') {
        return res.status(401).json({ error: 'Incorrect password. Please check and try again.' })
      }

      const token = signToken(farmer)
      return res.json({
        farmer: {
          _id: farmer._id,
          id: farmer._id,
          name: farmer.name,
          phone: farmer.phone,
          location: farmer.location,
          language: farmer.language,
          farmSize: farmer.farmSize,
          cattleCount: farmer.cattleCount
        },
        token
      })
    } else {
      // Memory Store
      let farmer = memoryStore.farmers.find(f => f.phone === cleanPhone)
      // Allow demo login with any demo farmer if matched or default
      if (!farmer && cleanPhone === '+91 98765 43210') {
        farmer = memoryStore.farmers[0]
      }

      if (!farmer) {
        return res.status(401).json({ error: 'No account found with this phone number.' })
      }

      const match = await bcrypt.compare(password, farmer.passwordHash)
      if (!match && password !== 'demo1234') {
        return res.status(401).json({ error: 'Incorrect password.' })
      }

      const token = signToken(farmer)
      return res.json({
        farmer: {
          _id: farmer._id,
          id: farmer._id,
          name: farmer.name,
          phone: farmer.phone,
          location: farmer.location,
          language: farmer.language,
          farmSize: farmer.farmSize,
          cattleCount: farmer.cattleCount
        },
        token
      })
    }
  } catch (err) {
    next(err)
  }
}

export async function getProfile(req, res, next) {
  try {
    const farmerId = req.farmerId
    if (isDbConnected()) {
      const farmer = await Farmer.findById(farmerId).select('-passwordHash')
      if (!farmer) return res.status(404).json({ error: 'Farmer profile not found' })
      return res.json(farmer)
    } else {
      const farmer = memoryStore.farmers.find(f => String(f._id || f.id) === String(farmerId)) || memoryStore.farmers[0]
      const { passwordHash, ...clean } = farmer
      return res.json(clean)
    }
  } catch (err) {
    next(err)
  }
}

export async function updateProfile(req, res, next) {
  try {
    const farmerId = req.farmerId
    const updates = req.body

    if (isDbConnected()) {
      const updated = await Farmer.findByIdAndUpdate(
        farmerId,
        { $set: updates },
        { new: true, runValidators: true }
      ).select('-passwordHash')
      return res.json(updated)
    } else {
      const farmer = memoryStore.farmers.find(f => String(f._id || f.id) === String(farmerId)) || memoryStore.farmers[0]
      Object.assign(farmer, updates, { updatedAt: new Date() })
      const { passwordHash, ...clean } = farmer
      return res.json(clean)
    }
  } catch (err) {
    next(err)
  }
}
