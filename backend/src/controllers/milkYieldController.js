import mongoose from 'mongoose'
import MilkYieldLog from '../models/MilkYieldLog.js'
import { isDbConnected } from '../config/db.js'
import { memoryStore } from '../utils/memoryStore.js'
import { invalidateSuggestionsCache } from '../services/personalizationService.js'

// In-memory milk yield logs for offline mode
if (!memoryStore.milkYieldLogs) {
  memoryStore.milkYieldLogs = [
    {
      _id: 'myl-001',
      farmerId: '664f1a2b3c4d5e6f7a8b9c01',
      batchId: 'SILAGE-001',
      date: '2026-05-22',
      yieldLiters: 14.5,
      cowCount: 12,
      avgPerCow: 1.21,
      notes: 'Normal feed intake',
      createdAt: new Date('2026-05-22T18:00:00Z')
    },
    {
      _id: 'myl-002',
      farmerId: '664f1a2b3c4d5e6f7a8b9c01',
      batchId: 'SILAGE-001',
      date: '2026-05-21',
      yieldLiters: 15.2,
      cowCount: 12,
      avgPerCow: 1.27,
      notes: '',
      createdAt: new Date('2026-05-21T18:00:00Z')
    },
    {
      _id: 'myl-003',
      farmerId: '664f1a2b3c4d5e6f7a8b9c01',
      batchId: 'SILAGE-003',
      date: '2026-05-19',
      yieldLiters: 9.8,
      cowCount: 12,
      avgPerCow: 0.82,
      notes: 'Decreased intake noticed — possible silage quality issue',
      createdAt: new Date('2026-05-19T18:00:00Z')
    }
  ]
}

export async function logMilkYield(req, res, next) {
  try {
    const farmerId = req.farmerId
    const { batchId, date, yieldLiters, cowCount = 12, notes = '' } = req.body

    if (!date || !yieldLiters) {
      return res.status(400).json({ error: 'date and yieldLiters are required.' })
    }

    const avgPerCow = cowCount > 0 ? Math.round((yieldLiters / cowCount) * 100) / 100 : 0

    const record = {
      _id: new mongoose.Types.ObjectId().toString(),
      farmerId,
      batchId: batchId || 'SILAGE-001',
      date,
      yieldLiters: Number(yieldLiters),
      cowCount: Number(cowCount),
      avgPerCow,
      notes,
      createdAt: new Date()
    }

    if (isDbConnected()) {
      const saved = await MilkYieldLog.create(record)
      invalidateSuggestionsCache(farmerId)
      return res.status(201).json(saved)
    } else {
      memoryStore.milkYieldLogs.unshift(record)
      invalidateSuggestionsCache(farmerId)
      return res.status(201).json(record)
    }
  } catch (err) {
    next(err)
  }
}

export async function getMilkYieldLogs(req, res, next) {
  try {
    const farmerId = req.farmerId
    const { batchId } = req.query
    const filter = { farmerId }
    if (batchId) filter.batchId = batchId

    if (isDbConnected()) {
      const logs = await MilkYieldLog.find(filter).sort({ date: -1 }).limit(30)
      return res.json(logs)
    } else {
      let logs = memoryStore.milkYieldLogs.filter(l => String(l.farmerId) === String(farmerId))
      if (!logs.length) logs = memoryStore.milkYieldLogs
      if (batchId) logs = logs.filter(l => l.batchId === batchId)
      return res.json(logs)
    }
  } catch (err) {
    next(err)
  }
}

export async function deleteMilkYieldLog(req, res, next) {
  try {
    const farmerId = req.farmerId
    const { id } = req.params

    if (isDbConnected()) {
      await MilkYieldLog.findOneAndDelete({ _id: id, farmerId })
    } else {
      memoryStore.milkYieldLogs = memoryStore.milkYieldLogs.filter(l => String(l._id) !== String(id))
    }
    invalidateSuggestionsCache(farmerId)
    return res.json({ message: 'Log deleted successfully' })
  } catch (err) {
    next(err)
  }
}
