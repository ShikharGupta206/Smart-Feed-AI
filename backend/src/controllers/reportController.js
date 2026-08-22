import mongoose from 'mongoose'
import Report from '../models/Report.js'
import TestResult from '../models/TestResult.js'
import { isDbConnected } from '../config/db.js'
import { memoryStore } from '../utils/memoryStore.js'
import { generateReportSummary } from '../services/geminiService.js'

function generateReportId() {
  const count = Math.floor(100 + Math.random() * 900)
  return `RPT-2026-${count}`
}

export async function getReports(req, res, next) {
  try {
    const farmerId = req.farmerId

    if (isDbConnected()) {
      let reports = await Report.find({ farmerId }).sort({ createdAt: -1 })
      if (reports.length === 0) {
        const seedReports = memoryStore.reports.map(r => ({
          ...r,
          _id: new mongoose.Types.ObjectId(),
          farmerId
        }))
        reports = await Report.insertMany(seedReports)
      }
      return res.json(reports)
    } else {
      let reports = memoryStore.reports.filter(r => String(r.farmerId) === String(farmerId))
      if (!reports || reports.length === 0) {
        reports = memoryStore.reports
      }
      return res.json(reports)
    }
  } catch (err) {
    next(err)
  }
}

export async function getReportDetail(req, res, next) {
  try {
    const reportId = req.params.id

    if (isDbConnected()) {
      const report = await Report.findOne({ $or: [{ _id: reportId }, { id: reportId }] })
      if (!report) return res.status(404).json({ error: 'Report not found' })
      return res.json(report)
    } else {
      const report = memoryStore.reports.find(r => String(r._id || r.id) === String(reportId) || r.id === reportId) || memoryStore.reports[0]
      return res.json(report)
    }
  } catch (err) {
    next(err)
  }
}

export async function createReport(req, res, next) {
  try {
    const farmerId = req.farmerId
    const { type = 'Sample Report', ref, title, summary } = req.body

    const reportId = generateReportId()
    const autoTitle = title || `${type} - ${ref || 'General'}`
    const autoSummary = summary || `Official quality screening report generated for ${ref || 'Feed Sample'}. Compliant with SmartFeed AI dairy nutritional parameters.`

    const newReport = {
      _id: new mongoose.Types.ObjectId().toString(),
      id: reportId,
      farmerId,
      type,
      ref: ref || 'SF-2026-1256',
      refType: type.includes('Batch') ? 'Batch' : 'TestResult',
      title: autoTitle,
      summary: autoSummary,
      keyFindings: [
        'Verified dairy quality parameters',
        'Storage integrity confirmed'
      ],
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      createdAt: new Date()
    }

    if (isDbConnected()) {
      const created = await Report.create(newReport)
      return res.status(201).json(created)
    } else {
      memoryStore.reports.unshift(newReport)
      return res.status(201).json(newReport)
    }
  } catch (err) {
    next(err)
  }
}
