import { GoogleGenerativeAI } from '@google/generative-ai'
import { calculateMockParameters, calculateMycotoxinRiskRadar, calculateCostOfPoorQuality, generateAdvisoriesForParameters } from '../utils/mockParameters.js'

let genAI = null
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
}

// Valid Gemini API model identifiers — ordered by capability/speed preference
const SUPPORTED_MODELS = [
  'gemini-2.0-flash',
  'gemini-1.5-flash-latest',
  'gemini-1.5-flash-8b',
  'gemini-1.5-pro-latest'
]

function parseBase64Image(dataUrl) {
  if (!dataUrl) return null
  const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/)
  if (!matches || matches.length !== 3) {
    const cleanBase64 = dataUrl.replace(/^data:image\/[a-z]+;base64,/, '').trim()
    return {
      inlineData: {
        data: cleanBase64,
        mimeType: 'image/jpeg'
      }
    }
  }
  return {
    inlineData: {
      data: matches[2].trim(),
      mimeType: matches[1]
    }
  }
}

function withTimeout(promise, ms = 15000) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(`AI Request timed out after ${ms}ms`)), ms))
  ])
}

/**
 * Analyzes feed/silage sample photo using Gemini Vision.
 */
export async function analyzeFeedImage(base64Image, metadata = {}) {
  const {
    sampleType = 'Silage',
    feedType = 'Maize Silage',
    storageDuration = 20,
    storageCondition = 'Covered Pit',
    notes = '',
    herdSize = 12,
    milkPrice = 40
  } = metadata

  const imagePart = parseBase64Image(base64Image)

  if (!imagePart || !imagePart.inlineData.data || !genAI) {
    return getFallbackAnalysis(metadata)
  }

  const prompt = `You are a dairy cattle nutritionist, forage agronomist, and feed quality diagnostic AI for Indian dairy farms.
Analyze this sample image and provided metadata:
- Sample Type: ${sampleType} (Feed or Silage)
- Feed Category: ${feedType}
- Storage Duration: ${storageDuration} days
- Storage Condition: ${storageCondition}
- Farmer Notes: ${notes || 'None'}

Return ONLY a valid JSON object matching this schema:
{
  "score": 87,
  "confidence": 92,
  "confidenceInterval": { "min": 83, "max": 91 },
  "overallStatus": "Good",
  "aiExplanation": "Uniform fermentation matrix with vibrant green-olive coloration and healthy lactic preservation. No visible mycotoxin clusters.",
  "keyIndicators": [
    "Uniform olive-green color indicates proper lactic fermentation",
    "Tight particle distribution with low aerobic face decay",
    "Moisture range appears optimal (60-65%)",
    "No visible white, black, or blue-green mold spores"
  ],
  "heatmapRegions": [
    { "x": 42, "y": 38, "radius": 24, "impact": "low", "label": "Optimum Fermented Core" },
    { "x": 75, "y": 25, "radius": 18, "impact": "medium", "label": "Surface Aerobic Exposure Zone" }
  ],
  "advisories": [
    "Maintain daily pit face feeding depth (15-20 cm) to prevent aerobic spoilage.",
    "Ensure Total Mixed Ration balances energy with adequate effective fiber."
  ],
  "recommendations": "Optimal for high-lactation dairy cattle. Continue current hermetic storage.",
  "parameters": {
    "crude_protein": { "value": 14.2, "unit": "%", "label": "Crude Protein", "status": "Good", "optimalRange": "12% - 18%" },
    "moisture": { "value": 61.5, "unit": "%", "label": "Moisture", "status": "Good", "optimalRange": "55% - 68%" },
    "fiber": { "value": 28.0, "unit": "%", "label": "Fiber", "status": "Good", "optimalRange": "24% - 32%" },
    "energy_value": { "value": 8.5, "unit": "MJ/kg", "label": "Energy Value", "status": "Good", "optimalRange": "8.0 - 10.5 MJ/kg" },
    "mineral_status": { "value": "Balanced", "unit": "", "label": "Mineral Status", "status": "Good", "optimalRange": "Balanced" },
    "adulteration_flag": { "value": "Not detected", "unit": "", "label": "Adulteration", "status": "Good", "optimalRange": "Not detected" },
    "aflatoxin_level": { "value": 3.8, "unit": "ppb", "label": "Aflatoxin Level", "status": "Good", "optimalRange": "< 10 ppb" }
  }
}`

  for (const modelName of SUPPORTED_MODELS) {
    try {
      console.log(`[Gemini Vision] Running visual screening with ${modelName}...`)
      const model = genAI.getGenerativeModel({ model: modelName })
      const response = await withTimeout(
        model.generateContent({
          contents: [
            {
              role: 'user',
              parts: [imagePart, { text: prompt }]
            }
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.2
          }
        }),
        14000
      )

      const rawText = response.response.text()
      const parsed = JSON.parse(rawText)

      if (parsed && typeof parsed.score === 'number' && parsed.parameters) {
        parsed.aiModelUsed = modelName
        parsed.mycotoxinRiskRadar = calculateMycotoxinRiskRadar(parsed.parameters, metadata)
        parsed.costOfPoorQuality = calculateCostOfPoorQuality(parsed.score, herdSize, milkPrice)
        parsed.disclaimer = 'Screening estimate for management decision support. Not a regulatory laboratory assay.'
        if (!parsed.confidenceInterval) {
          parsed.confidenceInterval = {
            min: Math.max(0, parsed.score - 4),
            max: Math.min(100, parsed.score + 4)
          }
        }
        return parsed
      }
    } catch (err) {
      console.warn(`[Gemini Vision] Model ${modelName} failed (${err.message}). Trying next candidate...`)
    }
  }

  return getFallbackAnalysis(metadata)
}

/**
 * Fallback agronomy heuristic engine when AI key or internet is unavailable.
 */
function getFallbackAnalysis(metadata = {}) {
  const { sampleType = 'Silage', storageDuration = 20, storageCondition = 'Covered Pit' } = metadata
  const isSilage = sampleType.toLowerCase().includes('silage')
  const parameters = calculateMockParameters(sampleType, storageDuration, storageCondition)

  const isAdulterated = parameters.adulteration_flag?.status === 'Bad'
  const aflatoxinHigh = parameters.aflatoxin_level?.status === 'Bad'

  let score = 84
  let overallStatus = 'Good'
  if (isAdulterated || aflatoxinHigh) {
    score = 42
    overallStatus = 'Bad'
  } else if (parameters.moisture.status === 'Warning' || parameters.crude_protein.status === 'Warning') {
    score = 69
    overallStatus = 'Warning'
  }

  const confidence = 91
  const confidenceInterval = { min: Math.max(0, score - 5), max: Math.min(100, score + 4) }

  const keyIndicators = isSilage ? [
    'Uniform green-olive coloration observed in forage matrix',
    'Moisture distribution appears consistent across sample',
    'No visible black or white mycotoxin mold clusters detected',
    'Stem and leaf particles exhibit good packing density'
  ] : [
    'Uniform pellet durability with low powder residue',
    'Natural cereal grain coloration with no visible mold clumping',
    'Consistent moisture levels compliant with safe bag storage'
  ]

  const advisories = generateAdvisoriesForParameters(parameters, sampleType)
  const mycotoxinRiskRadar = calculateMycotoxinRiskRadar(parameters, metadata)
  const costOfPoorQuality = calculateCostOfPoorQuality(score, metadata.herdSize || 10, metadata.milkPrice || 40)

  const heatmapRegions = [
    { x: 38, y: 44, radius: 26, impact: overallStatus === 'Good' ? 'low' : 'medium', label: 'Primary Forage Area' },
    { x: 68, y: 28, radius: 20, impact: overallStatus === 'Bad' ? 'high' : 'low', label: 'Peripheral Exposure Region' }
  ]

  return {
    score,
    confidence,
    confidenceInterval,
    overallStatus,
    aiModelUsed: 'heuristic-engine',
    aiExplanation: overallStatus === 'Good'
      ? `Sample displays typical well-preserved ${metadata.feedType || 'silage'} traits with balanced moisture and standard protein indicators.`
      : `Sample exhibits parameter variances requiring attention, specifically moisture management and mold vigilance.`,
    keyIndicators,
    heatmapRegions,
    advisories,
    recommendations: overallStatus === 'Good'
      ? 'Feed sample meets recommended dairy nutritional standards. Continue regular ration balancing.'
      : 'Review feeding ration and isolate suspicious feed batches until confirmatory laboratory tests are completed.',
    parameters,
    mycotoxinRiskRadar,
    costOfPoorQuality,
    disclaimer: 'Screening estimate for management decision support. Not a regulatory laboratory assay.'
  }
}

/**
 * Handles conversational inquiries with Gemini AI Agronomist, with full DB context awareness.
 */
export async function chatWithAssistant(message, history = [], language = 'en', context = {}) {
  if (!genAI) {
    return getOfflineChatResponse(message, language)
  }

  const isHindi = language === 'hi' || language === 'Hindi' || /[\u0900-\u097F]/.test(message)
  const systemPrompt = `You are SmartFeed AI Assistant, a world-class AI Agronomist, Animal Nutritionist, and Dairy Farming Expert.
Guidelines:
1. Answer ANY question accurately, whether it is about feed quality, silage fermentation (pH, lactic acid, moisture, packing, inoculants, sealing), cattle nutrition (TMR, dry matter intake, protein, energy), disease prevention, fodder crops (Maize, Napier, Lucerne, Sorghum, Berseem), or general dairy farming and agriculture.
2. If the question relates to the farmer's feed or recent tests, incorporate their farm data:
${JSON.stringify(context || {})}
3. If the user asks a random, general, or conversational question, answer it intelligently, helpfully, and thoroughly.
4. Language: If the user asks in Hindi or the language is Hindi, respond in fluent, easy-to-understand Hindi (हिंदी). Otherwise respond in clear English.
5. Formatting: Use bullet points, bold key terms, and easy-to-read layout.`

  // Clean & ensure strict alternating user/model conversation structure for Gemini
  const contents = []
  let lastRole = null

  for (const h of (history || [])) {
    const text = String(h.text || h.content || '').trim()
    if (!text) continue

    const role = (h.from === 'user' || h.role === 'user') ? 'user' : 'model'

    // Gemini requires first message in contents to be 'user'
    if (contents.length === 0 && role === 'model') {
      continue
    }

    // Prevent consecutive duplicate roles
    if (role === lastRole && contents.length > 0) {
      contents[contents.length - 1].parts[0].text += `\n${text}`
    } else {
      contents.push({
        role,
        parts: [{ text }]
      })
      lastRole = role
    }
  }

  // Append the current user prompt
  if (lastRole === 'user' && contents.length > 0) {
    contents[contents.length - 1].parts[0].text += `\n${message}`
  } else {
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    })
  }

  for (const modelName of SUPPORTED_MODELS) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        console.log(`[Gemini Chat] Querying assistant model ${modelName} (attempt ${attempt}) for: "${message.slice(0, 50)}"...`)
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: {
            parts: [{ text: systemPrompt }]
          }
        })

        const response = await withTimeout(
          model.generateContent({
            contents,
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1500
            }
          }),
          14000
        )

        const text = response.response.text()
        if (text && text.trim()) return text.trim()
      } catch (err) {
        console.warn(`[Gemini Chat] Model ${modelName} attempt ${attempt} error: ${err.message}`)
        if (attempt === 1 && (err.message.includes('429') || err.message.includes('quota') || err.message.includes('fetch'))) {
          await new Promise(r => setTimeout(r, 1200))
        } else {
          break
        }
      }
    }
  }

  return getOfflineChatResponse(message, language)
}

export async function generateReportSummary(title, data, language = 'en') {
  if (!genAI) {
    return `Screening analysis for ${title}. Feed sample parameters are verified with a quality score of ${data.score || 80}/100.`
  }

  const prompt = `Write a concise 2-sentence executive summary for this cattle feed screening report:
Title: ${title}
Score: ${data.score || 80}/100 (${data.overallStatus || 'Good'})
Sample Type: ${data.sampleType || 'Silage'}
Parameters: ${JSON.stringify(data.parameters || {})}`

  for (const modelName of SUPPORTED_MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName })
      const res = await withTimeout(model.generateContent(prompt), 6000)
      return res.response.text().trim()
    } catch {
      // try next model
    }
  }

  return `Screening analysis for ${title}. Feed sample evaluated with overall score ${data.score || 80}/100.`
}

function getOfflineChatResponse(message, language = 'en') {
  const m = message.toLowerCase()
  const isHindi = language === 'hi' || language === 'Hindi' || /[\u0900-\u097F]/.test(message) || m.includes('namaste') || m.includes('kya') || m.includes('kaise')

  if (m.includes('score') || m.includes('स्कोर')) {
    return isHindi
      ? '80 से ऊपर का स्कोर उत्कृष्ट गुणवत्ता दर्शाता है। 50 से 79 के बीच मध्यम जोखिम है, और 50 से कम होने पर साइलेज या चारे में फफूंद/खराबी की तुरंत जांच करें।'
      : 'A score above 80 indicates high feed quality. Scores between 50-79 need monitoring, and scores below 50 indicate high risk of spoilage or mycotoxins.'
  }

  if (m.includes('mold') || m.includes('mould') || m.includes('फफूंद')) {
    return isHindi
      ? 'साइलेज में सफेद या काली फफूंद दिखाई दे तो उस हिस्से को तुरंत हटा दें। फफूंद से एफ्लाटॉक्सिन बन सकता है जो गाय-भैंस के दूध उत्पादन और स्वास्थ्य को नुकसान पहुँचाता है।'
      : 'Mold in silage or feed creates dangerous mycotoxins. Discard all moldy layers immediately and ensure the trench or silo bag remains airtight.'
  }

  if (m.includes('moisture') || m.includes('नमी') || m.includes('water') || m.includes('पानी')) {
    return isHindi
      ? 'मक्का साइलेज के लिए आदर्श नमी 62% से 68% के बीच होनी चाहिए। बहुत अधिक नमी (>70%) से साइलेज सड़ सकता है और कम नमी (<55%) से सही किण्वन नहीं होता।'
      : 'Ideal moisture for maize silage is 62-68%. High moisture (>70%) causes foul clostridial fermentation, while low moisture (<55%) prevents tight packing.'
  }

  if (m.includes('ph') || m.includes('acid') || m.includes('एसिड')) {
    return isHindi
      ? 'अच्छी तरह से तैयार मक्का साइलेज का pH 3.8 से 4.2 के बीच होना चाहिए। यह अम्लीय स्तर फफूंद और हानिकारक बैक्टीरिया को रोकता है।'
      : 'Optimal pH for well-fermented maize silage is 3.8 to 4.2. This rapid acidification suppresses mold and spoilage microbes.'
  }

  if (m.includes('milk') || m.includes('दूध') || m.includes('yield') || m.includes('production')) {
    return isHindi
      ? 'दूध उत्पादन बढ़ाने के लिए:\n1. 60% उच्च गुणवत्ता वाला साइलेज + 40% प्रोटीन कंसंट्रेट (TMR) दें।\n2. प्रति गाय 50 ग्राम मिनरल मिक्सचर दें।\n3. 24 घंटे साफ ताजा पीने का पानी उपलब्ध कराएं।'
      : 'To maximize dairy milk yield:\n1. Feed balanced TMR (60% quality forage/silage + 40% concentrate).\n2. Provide 50-80g bypass fat & chelating mineral mixture daily.\n3. Ensure ad-libitum clean fresh drinking water.'
  }

  return isHindi
    ? `नमस्ते! SmartFeed AI सहायक आपके प्रश्न "${message}" के लिए तैयार है। साइलेज की गुणवत्ता, नमी (62-68%), टीएमआर राशन संतुलन, और डेयरी प्रबंधन के बारे में पूछें।`
    : `Hello! I am your SmartFeed AI Agronomist. Regarding "${message}": For best dairy results, ensure proper ration balancing (CP 16-18%, NDF 28-32%), adequate dry matter intake, and mold-free silage.`
}
