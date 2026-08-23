import mongoose from 'mongoose'
import TestResult from '../models/TestResult.js'
import Batch from '../models/Batch.js'
import Advisory from '../models/Advisory.js'
import Report from '../models/Report.js'
import { isDbConnected } from '../config/db.js'
import { memoryStore } from '../utils/memoryStore.js'
import { analyzeFeedImage, generateReportSummary } from '../services/geminiService.js'
import { invalidateSuggestionsCache } from '../services/personalizationService.js'
import { generateTestQRCode } from '../services/qrService.js'

function generateSampleId() {
  const num = Math.floor(1000 + Math.random() * 9000)
  return `SF-2026-${num}`
}

function generateReportId() {
  const num = Math.floor(100 + Math.random() * 900)
  return `RPT-2026-${num}`
}

export async function createTest(req, res, next) {
  try {
    const farmerId = req.farmerId
    const {
      image,
      imageName = 'feed_sample.jpg',
      sampleType = 'Silage',
      feedType = 'Maize Silage',
      storageDuration = 0,
      storageCondition = 'Covered Pit',
      notes = '',
      batchId,
      tempC = 32,
      humidityPct = 65,
      smell = 'Neutral'
    } = req.body

    console.log(`[TestController] Analyzing new ${sampleType} sample (${feedType}) for farmer ${farmerId}...`)

    // Invoke Gemini Vision Analysis (with automatic fallback)
    const aiAnalysis = await analyzeFeedImage(image, {
      sampleType,
      feedType,
      storageDuration: Number(storageDuration) || 0,
      storageCondition,
      notes,
      tempC: Number(tempC) || 32,
      humidityPct: Number(humidityPct) || 65,
      smell
    })

    const sampleId = generateSampleId()
    const recordId = new mongoose.Types.ObjectId().toString()

    const analyzedOn = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

    const newTest = {
      _id: recordId,
      id: sampleId,
      farmerId,
      batchId: batchId || 'SILAGE-001',
      sampleType,
      feedType,
      storageDuration: Number(storageDuration) || 0,
      storageCondition,
      tempC: Number(tempC) || 32,
      humidityPct: Number(humidityPct) || 65,
      smell,
      notes,
      imageName,
      image: image || null,
      analyzedOn,
      score: typeof aiAnalysis.score === 'number' ? aiAnalysis.score : 80,
      overallStatus: aiAnalysis.overallStatus || 'Good',
      confidence: typeof aiAnalysis.confidence === 'number' ? aiAnalysis.confidence : 91,
      confidenceInterval: (aiAnalysis.confidenceInterval &&
        typeof aiAnalysis.confidenceInterval.min === 'number' &&
        typeof aiAnalysis.confidenceInterval.max === 'number' &&
        aiAnalysis.confidenceInterval.min <= (aiAnalysis.confidence || 91) &&
        aiAnalysis.confidenceInterval.max >= (aiAnalysis.confidence || 91))
        ? aiAnalysis.confidenceInterval
        : {
            min: Math.max(0, (aiAnalysis.confidence || 91) - 4),
            max: Math.min(100, (aiAnalysis.confidence || 91) + 4)
          },
      aiExplanation: aiAnalysis.aiExplanation || '',
      heatmapRegions: aiAnalysis.heatmapRegions || [],
      mycotoxinRiskRadar: aiAnalysis.mycotoxinRiskRadar || {},
      costOfPoorQuality: aiAnalysis.costOfPoorQuality || {},
      disclaimer: aiAnalysis.disclaimer || 'Screening estimate for management decision support. Not a regulatory laboratory assay.',
      aiModelUsed: aiAnalysis.aiModelUsed || 'gemini-3.5-flash',
      parameters: aiAnalysis.parameters,
      keyIndicators: aiAnalysis.keyIndicators || [],
      advisories: aiAnalysis.advisories || [],
      recommendations: aiAnalysis.recommendations || '',
      createdAt: new Date()
    }

    if (isDbConnected()) {
      const savedTest = await TestResult.create(newTest)

      // Save advisory record
      if (newTest.advisories && newTest.advisories.length > 0) {
        await Advisory.create({
          testId: savedTest._id,
          farmerId,
          messages: newTest.advisories,
          urgency: newTest.overallStatus === 'Bad' ? 'High' : newTest.overallStatus === 'Warning' ? 'Medium' : 'Low'
        })
      }

      // Update Batch if exists
      if (batchId) {
        const batch = await Batch.findOne({ id: batchId, farmerId })
        if (batch) {
          batch.analysesCount = (batch.analysesCount || 0) + 1
          batch.averageScore = Math.round(((batch.averageScore || 80) + newTest.score) / 2)
          await batch.save()
        }
      }

      // Create Report entry
      const reportTitle = `${feedType} Screening Report - ${sampleId}`
      const reportSummary = await generateReportSummary(reportTitle, newTest)
      await Report.create({
        id: generateReportId(),
        farmerId,
        type: 'Sample Report',
        ref: sampleId,
        refType: 'TestResult',
        title: reportTitle,
        summary: reportSummary,
        keyFindings: [
          `Score: ${newTest.score}/100 (${newTest.overallStatus})`,
          `Crude Protein: ${newTest.parameters?.crude_protein?.value || 14}%`,
          `Moisture: ${newTest.parameters?.moisture?.value || 62}%`,
          `Aflatoxin: ${newTest.parameters?.aflatoxin_level?.value || 4} ppb`
        ],
        date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        metrics: { score: newTest.score, overallStatus: newTest.overallStatus }
      })

      // Invalidate suggestions cache so Dashboard refreshes proactively
      invalidateSuggestionsCache(farmerId)

      return res.status(201).json(savedTest)
    } else {
      // Memory store
      memoryStore.tests.unshift(newTest)
      invalidateSuggestionsCache(farmerId)

      if (newTest.advisories && newTest.advisories.length > 0) {
        memoryStore.advisories.unshift({
          _id: new mongoose.Types.ObjectId().toString(),
          testId: newTest._id,
          farmerId,
          messages: newTest.advisories
        })
      }

      // Update in-memory batch
      const targetBatchId = batchId || 'SILAGE-001'
      const batch = memoryStore.batches.find(b => b.id === targetBatchId)
      if (batch) {
        batch.analysesCount = (batch.analysesCount || 0) + 1
        batch.averageScore = Math.round(((batch.averageScore || 80) + newTest.score) / 2)
      }

      // Create in-memory report
      const reportTitle = `${feedType} Quality Report - ${sampleId}`
      const reportSummary = await generateReportSummary(reportTitle, newTest)
      memoryStore.reports.unshift({
        _id: new mongoose.Types.ObjectId().toString(),
        id: generateReportId(),
        farmerId,
        type: 'Sample Report',
        ref: sampleId,
        refType: 'TestResult',
        title: reportTitle,
        summary: reportSummary,
        keyFindings: [
          `Score: ${newTest.score}/100 (${newTest.overallStatus})`,
          `Crude Protein: ${newTest.parameters?.crude_protein?.value || 14}%`,
          `Moisture: ${newTest.parameters?.moisture?.value || 62}%`
        ],
        date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        createdAt: new Date()
      })

      return res.status(201).json(newTest)
    }
  } catch (err) {
    next(err)
  }
}

export async function getFarmerTests(req, res, next) {
  try {
    const targetFarmerId = req.params.farmerId || req.farmerId

    if (isDbConnected()) {
      let tests = await TestResult.find({ farmerId: targetFarmerId }).sort({ createdAt: -1 })
      if (tests.length === 0) {
        const seedTests = memoryStore.tests.map(t => ({
          ...t,
          _id: new mongoose.Types.ObjectId(),
          farmerId: targetFarmerId
        }))
        tests = await TestResult.insertMany(seedTests)
      }
      return res.json(tests)
    } else {
      let tests = memoryStore.tests.filter(t => String(t.farmerId) === String(targetFarmerId))
      // If none found for a new guest ID, return all available demo tests
      if (!tests || tests.length === 0) {
        tests = memoryStore.tests
      }
      return res.json(tests)
    }
  } catch (err) {
    next(err)
  }
}

export async function getTestDetail(req, res, next) {
  try {
    const testId = req.params.testId || req.params.id

    if (isDbConnected()) {
      let test = null
      if (mongoose.Types.ObjectId.isValid(testId)) {
        test = await TestResult.findById(testId)
      }
      if (!test) {
        test = await TestResult.findOne({ id: testId })
      }

      if (!test) {
        return res.status(404).json({ error: 'Feed screening test not found.' })
      }
      return res.json(test)
    } else {
      const test = memoryStore.tests.find(t => String(t._id || t.id) === String(testId) || t.id === testId)
      if (!test) {
        // Fallback to first test if not found
        return res.json(memoryStore.tests[0] || {})
      }
      return res.json(test)
    }
  } catch (err) {
    next(err)
  }
}

export async function deleteTest(req, res, next) {
  try {
    const testId = req.params.testId || req.params.id
    if (isDbConnected()) {
      await TestResult.findOneAndDelete({ $or: [{ _id: testId }, { id: testId }] })
      return res.json({ success: true, message: 'Test deleted successfully' })
    } else {
      const idx = memoryStore.tests.findIndex(t => String(t._id || t.id) === String(testId) || t.id === testId)
      if (idx !== -1) {
        memoryStore.tests.splice(idx, 1)
      }
      return res.json({ success: true, message: 'Test deleted' })
    }
  } catch (err) {
    next(err)
  }
}

export async function getTestQR(req, res, next) {
  try {
    const testId = req.params.testId || req.params.id
    const qr = await generateTestQRCode(testId)
    return res.json(qr)
  } catch (err) {
    next(err)
  }
}
