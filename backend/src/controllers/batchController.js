import mongoose from 'mongoose'
import Batch from '../models/Batch.js'
import TestResult from '../models/TestResult.js'
import MilkYieldLog from '../models/MilkYieldLog.js'
import { isDbConnected } from '../config/db.js'
import { memoryStore } from '../utils/memoryStore.js'
import { invalidateSuggestionsCache } from '../services/personalizationService.js'

function generateBatchNumber(type = 'Silage') {
  const prefix = type.toLowerCase().includes('feed') ? 'FEED' : 'SILAGE'
  const count = Math.floor(100 + Math.random() * 900)
  return `${prefix}-${count}`
}

export async function getBatches(req, res, next) {
  try {
    const farmerId = req.farmerId

    if (isDbConnected()) {
      let batches = await Batch.find({ farmerId }).sort({ createdAt: -1 })
      
      // Auto seed demo batches to MongoDB if new user
      if (batches.length === 0) {
        const seedBatches = memoryStore.batches.map(b => ({
          ...b,
          _id: new mongoose.Types.ObjectId(),
          farmerId
        }))
        batches = await Batch.insertMany(seedBatches)
      }

      return res.json(batches)
    } else {
      let batches = memoryStore.batches.filter(b => String(b.farmerId) === String(farmerId))
      if (!batches || batches.length === 0) {
        batches = memoryStore.batches
      }
      return res.json(batches)
    }
  } catch (err) {
    next(err)
  }
}

export async function getBatchDetail(req, res, next) {
  try {
    const batchId = req.params.id || req.params.batchId

    if (isDbConnected()) {
      let batch = await Batch.findOne({ $or: [{ _id: mongoose.isValidObjectId(batchId) ? batchId : null }, { id: batchId }] })
      if (!batch) {
        batch = await Batch.findOne().sort({ createdAt: -1 })
      }
      if (!batch) return res.status(404).json({ error: 'Batch not found' })

      const tests = await TestResult.find({ batchId: batch.id }).sort({ createdAt: -1 })
      const milkLogs = await MilkYieldLog.find({ batchId: batch.id }).sort({ date: 1 })

      return res.json({ batch, tests, milkLogs })
    } else {
      const batch = memoryStore.batches.find(b => String(b._id || b.id) === String(batchId) || b.id === batchId) || memoryStore.batches[0]
      const tests = memoryStore.tests.filter(t => t.batchId === batch.id)
      return res.json({ batch, tests, milkLogs: [] })
    }
  } catch (err) {
    next(err)
  }
}

export async function createBatch(req, res, next) {
  try {
    const farmerId = req.farmerId
    const { type = 'Silage', feedType = 'Maize Silage', storage = 'Covered Pit', notes = '' } = req.body

    const batchCode = generateBatchNumber(type)
    const newBatch = {
      _id: new mongoose.Types.ObjectId().toString(),
      id: batchCode,
      farmerId,
      type,
      feedType,
      storage,
      status: 'Active',
      analysesCount: 0,
      averageScore: 80,
      notes,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    if (isDbConnected()) {
      const created = await Batch.create(newBatch)
      invalidateSuggestionsCache(farmerId)
      return res.status(201).json(created)
    } else {
      memoryStore.batches.unshift(newBatch)
      invalidateSuggestionsCache(farmerId)
      return res.status(201).json(newBatch)
    }
  } catch (err) {
    next(err)
  }
}

export async function updateBatch(req, res, next) {
  try {
    const farmerId = req.farmerId
    const batchId = req.params.id
    const updates = req.body

    if (isDbConnected()) {
      const batch = await Batch.findOneAndUpdate(
        { $or: [{ _id: mongoose.isValidObjectId(batchId) ? batchId : null }, { id: batchId }] },
        { $set: updates },
        { new: true }
      )
      invalidateSuggestionsCache(farmerId)
      return res.json(batch)
    } else {
      const batch = memoryStore.batches.find(b => String(b._id || b.id) === String(batchId) || b.id === batchId)
      if (batch) Object.assign(batch, updates)
      invalidateSuggestionsCache(farmerId)
      return res.json(batch || {})
    }
  } catch (err) {
    next(err)
  }
}

export async function logMilkYield(req, res, next) {
  try {
    const farmerId = req.farmerId
    const batchId = req.params.id || req.params.batchId
    const { yieldLitersPerCow, herdSize = 10, fatPercentage = 4.2, snfPercentage = 8.5, notes = '' } = req.body

    if (!yieldLitersPerCow) {
      return res.status(400).json({ error: 'Milk yield (liters/cow) is required' })
    }

    // Get latest feed quality score
    let score = 82
    if (isDbConnected()) {
      const recentTest = await TestResult.findOne({ batchId }).sort({ createdAt: -1 })
      if (recentTest) score = recentTest.score

      const log = await MilkYieldLog.create({
        farmerId,
        batchId,
        yieldLitersPerCow: Number(yieldLitersPerCow),
        herdSize: Number(herdSize),
        totalDailyYieldLiters: Number(yieldLitersPerCow) * Number(herdSize),
        feedQualityScoreAtLog: score,
        fatPercentage: Number(fatPercentage),
        snfPercentage: Number(snfPercentage),
        notes,
        date: new Date()
      })

      return res.status(201).json(log)
    } else {
      return res.status(201).json({
        farmerId,
        batchId,
        yieldLitersPerCow: Number(yieldLitersPerCow),
        totalDailyYieldLiters: Number(yieldLitersPerCow) * Number(herdSize),
        feedQualityScoreAtLog: score,
        fatPercentage: Number(fatPercentage),
        snfPercentage: Number(snfPercentage),
        notes,
        date: new Date()
      })
    }
  } catch (err) {
    next(err)
  }
}

export async function getMilkYieldLogs(req, res, next) {
  try {
    const batchId = req.params.id || req.params.batchId

    if (isDbConnected()) {
      const logs = await MilkYieldLog.find({ batchId }).sort({ date: 1 })
      return res.json(logs)
    } else {
      return res.json([])
    }
  } catch (err) {
    next(err)
  }
}
