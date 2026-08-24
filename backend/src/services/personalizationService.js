import mongoose from 'mongoose'
import { GoogleGenerativeAI } from '@google/generative-ai'
import Farmer from '../models/Farmer.js'
import TestResult from '../models/TestResult.js'
import MilkYieldLog from '../models/MilkYieldLog.js'
import SilageCoachStep from '../models/SilageCoachStep.js'
import Batch from '../models/Batch.js'
import { isDbConnected } from '../config/db.js'
import { memoryStore } from '../utils/memoryStore.js'

let genAI = null
function getGenAIClient() {
  if (!genAI && process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  }
  return genAI
}

// Valid Gemini API model identifiers — ordered by availability preference (most stable first)
const SUPPORTED_MODELS = [
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.7-flash',
  'gemini-3.6-flash',
  'gemini-flash-latest'
]

// In-memory suggestions cache with 15-minute TTL for real-time personalization
const suggestionsCache = new Map()
const CACHE_TTL_MS = 15 * 60 * 1000 // 15 minutes

export function invalidateSuggestionsCache(farmerId) {
  if (farmerId) {
    const key = String(farmerId)
    suggestionsCache.delete(key)
    console.log(`[Personalization] Cache invalidated for farmer ${key}`)
  } else {
    suggestionsCache.clear()
    console.log(`[Personalization] Cache cleared for all farmers`)
  }
}

/**
 * Collects rich farm context from MongoDB or MemoryStore
 */
export async function collectFarmerContext(farmerId) {
  const context = {
    farmerId: String(farmerId || 'demo-farmer'),
    farmerName: 'Farmer Raj',
    cattleCount: 24,
    location: 'Anand, Gujarat',
    language: 'en',
    totalTests: 0,
    averageScore: 80,
    scoreTrend: 'Stable',
    recentTests: [],
    dominantFeedType: 'Maize Silage',
    highMoistureFlags: 0,
    moldWarnings: 0,
    milkYieldTrend: 'Stable (14.5 L/cow/day)',
    currentCoachStage: 'Stage 3: Inoculation & Packing',
    activeBatchesCount: 2
  }

  if (isDbConnected()) {
    try {
      const farmerObjId = mongoose.isValidObjectId(farmerId) ? new mongoose.Types.ObjectId(farmerId) : null
      const farmerFilter = farmerObjId 
        ? { $or: [{ farmerId }, { farmerId: String(farmerId) }, { farmerId: farmerObjId }] }
        : { $or: [{ farmerId }, { farmerId: String(farmerId) }] }

      if (farmerObjId) {
        const farmer = await Farmer.findById(farmerObjId)
        if (farmer) {
          context.farmerName = farmer.name || context.farmerName
          context.cattleCount = farmer.cattleCount || context.cattleCount
          context.location = farmer.location || context.location
          context.language = farmer.language || context.language
        }
      }

      const tests = await TestResult.find(farmerFilter).sort({ createdAt: -1 }).limit(10)
      if (tests && tests.length > 0) {
        context.totalTests = tests.length
        const scores = tests.map(t => t.score || 80)
        context.averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)

        if (scores.length >= 2) {
          const delta = scores[0] - scores[scores.length - 1]
          if (delta > 5) context.scoreTrend = `Improving (+${delta} pts)`
          else if (delta < -5) context.scoreTrend = `Degrading (${delta} pts)`
          else context.scoreTrend = 'Stable'
        }

        const feedCounts = {}
        tests.forEach(t => {
          const ft = t.feedType || 'Maize Silage'
          feedCounts[ft] = (feedCounts[ft] || 0) + 1
          const moisture = Number(t.parameters?.get ? t.parameters.get('moisture')?.value : t.parameters?.moisture?.value)
          if (moisture > 68) context.highMoistureFlags++
          if (t.overallStatus === 'Bad' || t.overallStatus === 'Warning') context.moldWarnings++
        })

        context.dominantFeedType = Object.entries(feedCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Maize Silage'
        context.recentTests = tests.slice(0, 5).map(t => ({
          id: t.id,
          feedType: t.feedType,
          score: t.score,
          status: t.overallStatus,
          date: t.createdAt
        }))
      }

      const milkLogs = await MilkYieldLog.find(farmerFilter).sort({ date: -1 }).limit(5)
      if (milkLogs && milkLogs.length > 0) {
        const latest = milkLogs[0]
        context.milkYieldTrend = `${latest.yieldLitersPerCow || 14.5} L/cow/day (Fat: ${latest.fatPercentage || 4.2}%)`
      }

      const coachSteps = await SilageCoachStep.find(farmerFilter).sort({ stageNumber: 1 })
      if (coachSteps && coachSteps.length > 0) {
        const stuck = coachSteps.find(s => !s.completed)
        if (stuck) {
          context.currentCoachStage = `Stage ${stuck.stageNumber}: ${stuck.title}`
        } else {
          context.currentCoachStage = 'All Silage Stages Completed'
        }
      }

      const activeBatches = await Batch.find({ ...farmerFilter, status: 'Active' })
      context.activeBatchesCount = activeBatches?.length || 1
    } catch (e) {
      console.warn(`[Personalization Context DB] Error: ${e.message}. Using memory fallback.`)
    }
  } else {
    // Memory store context
    const tests = memoryStore.tests || []
    context.totalTests = tests.length
    if (tests.length > 0) {
      const scores = tests.map(t => t.score || 80)
      context.averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      context.scoreTrend = 'Improving (+8 pts)'
      context.dominantFeedType = 'Maize Silage'
      context.highMoistureFlags = tests.filter(t => (t.parameters?.moisture?.value || 0) > 68).length
      context.moldWarnings = tests.filter(t => t.overallStatus === 'Warning' || t.overallStatus === 'Bad').length
      context.recentTests = tests.slice(0, 5).map(t => ({ id: t.id, feedType: t.feedType, score: t.score, status: t.overallStatus }))
    }
  }

  return context
}

/**
 * Generates proactive, context-aware suggestions for the farmer.
 */
export async function getFarmerSuggestions(farmerId, language = 'en', forceRefresh = false) {
  const isHindi = language === 'hi' || language === 'Hindi' || language === 'हिंदी' || String(language).toLowerCase().includes('hi')
  const cacheKey = `${String(farmerId || 'demo-farmer')}_${isHindi ? 'hi' : 'en'}`
  const cached = suggestionsCache.get(cacheKey)

  if (!forceRefresh && cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
    console.log(`[Personalization] Returning cached suggestions for farmer ${cacheKey} (${cached.suggestions.length} items)`)
    return {
      source: 'cache',
      cachedAt: new Date(cached.timestamp).toISOString(),
      farmerContext: cached.farmerContext,
      suggestions: cached.suggestions
    }
  }

  const context = await collectFarmerContext(farmerId)
  if (context.language === 'hi') {
    // respect farmer's profile preference if set
  }

  const client = getGenAIClient()
  if (client) {
    const prompt = `You are the proactive AI Farm Advisor for SmartFeed AI.
Analyze this dairy farmer's exact farm profile and recent feed quality trend:
${JSON.stringify(context, null, 2)}

Task:
Generate 3 to 5 highly personalized, high-impact, actionable suggestions tailored to this farmer's specific challenges (e.g. moisture variances, milk yield correlation, pit face aerobic spoilage, Silage Coach stage progression, cost-effective TMR ration balancing).

Output ONLY a valid JSON array of suggestions conforming to this schema:
[
  {
    "id": "sugg-1",
    "title": "Short catchy actionable title",
    "description": "2-3 clear sentences explaining what to do, why it matters, and exact dosages/remedies.",
    "priority": "high",
    "category": "Fermentation",
    "actionLabel": "Take Action / View Detail",
    "actionLink": "/coach"
  }
]
${isHindi ? 'IMPORTANT: Generate title, description, and actionLabel entirely in clear, encouraging, practical Hindi (हिंदी).' : 'Note: Generate in clear, professional English.'}`

    for (const modelName of SUPPORTED_MODELS) {
      try {
        console.log(`[Personalization] Generating suggestions using ${modelName} for farmer ${cacheKey}...`)
        const model = client.getGenerativeModel({
          model: modelName,
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.3
          }
        })

        const res = await Promise.race([
          model.generateContent(prompt),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Suggestions generation timeout')), 14000))
        ])

        const rawJson = res.response.text()
        const parsed = JSON.parse(rawJson)
        const suggestionsList = Array.isArray(parsed) ? parsed : (parsed.suggestions || [])

        if (suggestionsList.length >= 3) {
          const finalSuggestions = suggestionsList.map((s, idx) => ({
            id: s.id || `sugg-${idx + 1}`,
            title: s.title || (isHindi ? `कृषि सलाह #${idx + 1}` : `Farm Advisory #${idx + 1}`),
            description: s.description || '',
            priority: ['high', 'medium', 'low'].includes(String(s.priority).toLowerCase()) ? String(s.priority).toLowerCase() : 'medium',
            category: s.category || 'Nutrition',
            actionLabel: s.actionLabel || (isHindi ? 'विवरण देखें' : 'View Action'),
            actionLink: s.actionLink || '/dashboard'
          }))

          suggestionsCache.set(cacheKey, {
            timestamp: Date.now(),
            farmerContext: context,
            suggestions: finalSuggestions
          })

          console.log(`[Personalization] Successfully generated ${finalSuggestions.length} suggestions with ${modelName}`)
          return {
            source: 'gemini',
            model: modelName,
            cachedAt: new Date().toISOString(),
            farmerContext: context,
            suggestions: finalSuggestions
          }
        }
      } catch (err) {
        console.error(`[Personalization] Model ${modelName} failed: ${err.message}`)
      }
    }
  }

  // Agronomic Contextual Fallback
  console.log(`[Personalization] Generating contextual heuristic suggestions for farmer ${cacheKey}`)
  const fallbackSuggestions = getContextualFallbackSuggestions(context, isHindi)

  suggestionsCache.set(cacheKey, {
    timestamp: Date.now(),
    farmerContext: context,
    suggestions: fallbackSuggestions
  })

  return {
    source: 'heuristic-engine',
    cachedAt: new Date().toISOString(),
    farmerContext: context,
    suggestions: fallbackSuggestions
  }
}

function getContextualFallbackSuggestions(context, isHindi = false) {
  const list = []

  // Suggestion 1: Based on Moisture / Fermentation
  if (context.highMoistureFlags > 0) {
    list.push({
      id: 'sugg-1',
      title: isHindi ? 'साइलेज नमी सुधार व भूसा संतुलन' : 'Optimize High Silage Moisture with Dry Straw',
      description: isHindi
        ? 'आपके हाल के परीक्षणों में नमी 68% से अधिक पाई गई है। ब्यूटायरिक किण्वन रोकने के लिए खिलाते समय 10% सूखा गेहूं का भूसा मिलाएं।'
        : `Recent test results indicated elevated moisture (>68%). Mix 10% chopped dry wheat straw into the daily TMR to prevent clostridial fermentation.`,
      priority: 'high',
      category: 'Fermentation',
      actionLabel: isHindi ? 'नया परीक्षण करें' : 'Test Pit Face',
      actionLink: '/analysis/new'
    })
  } else {
    list.push({
      id: 'sugg-1',
      title: isHindi ? 'दैनिक साइलेज फेस प्रबंधन' : 'Maintain Daily Pit Face Hygiene',
      description: isHindi
        ? 'साइलेज फेस से रोजाना 15-20 सेमी परत एकसमान रूप से निकालें और बाकी हिस्से को प्लास्टिक से कसकर ढकें।'
        : 'Feed 15-20 cm evenly across the silo pit face daily and seal the tarp with sandbags to prevent secondary aerobic heating.',
      priority: 'medium',
      category: 'Fermentation',
      actionLabel: isHindi ? 'साइलेज कोच देखें' : 'View Silage Coach',
      actionLink: '/coach'
    })
  }

  // Suggestion 2: Milk Yield & Ration Optimization
  list.push({
    id: 'sugg-2',
    title: isHindi ? 'दूध उत्पादन व बाईपास फैट सप्लीमेंट' : 'Boost Milk Yield with Rumen-Protected Bypass Fat',
    description: isHindi
      ? `वर्तमान उत्पादन ${context.milkYieldTrend} के आधार पर, प्रति गाय 80-100 ग्राम बाईपास फैट और 50 ग्राम चेलेटेड मिनरल मिक्सचर दें।`
      : `Based on your herd production (${context.milkYieldTrend}), supplement 80-100g rumen-protected bypass fat and 50g chelated mineral mixture daily.`,
    priority: 'high',
    category: 'Milk Yield',
    actionLabel: isHindi ? 'दूध लॉग दर्ज करें' : 'Log Milk Production',
    actionLink: '/milk-yield'
  })

  // Suggestion 3: Silage Coach Progression
  list.push({
    id: 'sugg-3',
    title: isHindi ? `साइलेज कोच: ${context.currentCoachStage}` : `Advance ${context.currentCoachStage}`,
    description: isHindi
      ? 'साइलेज निर्माण की गुणवत्ता बनाए रखने के लिए अपने वर्तमान चरण के सभी चेकलिस्ट कार्य पूरे करें।'
      : 'Verify your compaction density and anaerobic airtight cover to lock in lactic preservation for high nutrient retention.',
    priority: 'medium',
    category: 'Storage',
    actionLabel: isHindi ? 'चरण पूरा करें' : 'Continue Coach',
    actionLink: '/coach'
  })

  // Suggestion 4: Cost of Poor Quality & Alternative TMR
  list.push({
    id: 'sugg-4',
    title: isHindi ? 'स्थानीय सस्ते चारे से राशन संतुलन' : 'Cost-Effective Local TMR Substitution',
    description: isHindi
      ? 'महंगे कमर्शियल दाने की जगह 1.5 किग्रा बिनौला खल (Cottonseed Cake) + 0.5 किग्रा मक्का दलिया मिलाकर ₹25/गाय/दिन बचाएं।'
      : 'Substitute 1.5kg commercial pellets with 1.2kg cottonseed cake + 0.5kg crushed maize to save ₹25-30/cow/day while maintaining 16% CP.',
    priority: 'low',
    category: 'Cost Saving',
    actionLabel: isHindi ? 'बैच देखें' : 'View Batches',
    actionLink: '/batches'
  })

  return list
}
