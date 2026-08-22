import Farmer from '../models/Farmer.js'
import TestResult from '../models/TestResult.js'
import Batch from '../models/Batch.js'
import MilkYieldLog from '../models/MilkYieldLog.js'
import SilageCoachStep from '../models/SilageCoachStep.js'
import { isDbConnected } from '../config/db.js'
import { memoryStore } from '../utils/memoryStore.js'
import { chatWithAssistant } from '../services/geminiService.js'

export async function chat(req, res, next) {
  try {
    const { message, history = [] } = req.body
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message content is required.' })
    }

    const farmerId = req.farmerId
    let language = 'en'
    let farmerContext = {}

    // Fetch rich farmer profile, recent tests, batches, milk yield from MongoDB
    if (isDbConnected()) {
      const farmer = await Farmer.findById(farmerId)
      if (farmer) {
        language = farmer.language || 'en'
        farmerContext.farmerName = farmer.name
        farmerContext.cattleCount = farmer.cattleCount
        farmerContext.farmSize = farmer.farmSize
        farmerContext.location = farmer.location
      }

      const recentTest = await TestResult.findOne({ farmerId }).sort({ createdAt: -1 })
      if (recentTest) {
        farmerContext.lastAnalysis = {
          sampleId: recentTest.id,
          type: recentTest.sampleType,
          feedType: recentTest.feedType,
          score: recentTest.score,
          status: recentTest.overallStatus,
          advisories: recentTest.advisories
        }
      }

      const activeBatches = await Batch.find({ farmerId, status: 'Active' }).limit(3)
      if (activeBatches && activeBatches.length > 0) {
        farmerContext.activeBatches = activeBatches.map(b => ({ id: b.id, type: b.feedType, avgScore: b.averageScore }))
      }

      const recentMilkLog = await MilkYieldLog.findOne({ farmerId }).sort({ date: -1 })
      if (recentMilkLog) {
        farmerContext.latestMilkYield = {
          litersPerCow: recentMilkLog.yieldLitersPerCow,
          totalLiters: recentMilkLog.totalDailyYieldLiters,
          fatPct: recentMilkLog.fatPercentage
        }
      }

      const coachProgress = await SilageCoachStep.find({ farmerId, completed: true })
      farmerContext.silageCoachingCompletedStages = coachProgress.length
    } else {
      const farmer = memoryStore.farmers.find(f => String(f._id || f.id) === String(farmerId)) || memoryStore.farmers[0]
      if (farmer) {
        language = farmer.language || 'en'
        farmerContext.farmerName = farmer.name
        farmerContext.cattleCount = farmer.cattleCount
      }
      const recentTest = memoryStore.tests[0]
      if (recentTest) {
        farmerContext.lastAnalysis = {
          sampleId: recentTest.id,
          type: recentTest.sampleType,
          feedType: recentTest.feedType,
          score: recentTest.score,
          status: recentTest.overallStatus
        }
      }
    }

    console.log(`[AI Assistant] Processing chat for farmer (${language}): "${message.slice(0, 60)}..."`)
    const responseText = await chatWithAssistant(message, history, language, farmerContext)

    return res.json({
      text: responseText,
      language
    })
  } catch (err) {
    next(err)
  }
}

export async function getSuggestions(req, res) {
  const language = req.query.lang || 'en'
  const isHindi = language === 'hi' || language === 'Hindi'

  const suggestions = isHindi ? [
    'मक्का साइलेज में नमी की सही मात्रा कितनी होनी चाहिए?',
    'साइलेज में सफेद फफूंद दिखने पर क्या करना चाहिए?',
    'गाय का दूध बढ़ाने के लिए संतुलित आहार (TMR) कैसे बनाएं?',
    'एफ्लाटॉक्सिन (Aflatoxin) से पशुओं को कैसे बचाएं?',
    'खराब साइलेज की पहचान के मुख्य लक्षण क्या हैं?'
  ] : [
    'What is the ideal moisture range for maize silage?',
    'How do I prevent mold growth on open silage pit faces?',
    'What should I feed a high-yielding HF cow (25L/day)?',
    'How do I test feed for dangerous aflatoxins?',
    'How do I calculate dry matter intake for dairy cattle?'
  ]

  return res.json({ suggestions })
}
