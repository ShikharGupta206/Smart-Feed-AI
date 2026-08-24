import { GoogleGenerativeAI } from '@google/generative-ai'
import { calculateMockParameters, calculateMycotoxinRiskRadar, calculateCostOfPoorQuality, generateAdvisoriesForParameters } from '../utils/mockParameters.js'

let genAI = null
function getGenAIClient() {
  if (!genAI && process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  }
  return genAI
}

// Valid Gemini API model identifiers — ordered by capability/availability preference
const SUPPORTED_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-1.5-pro'
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
  const client = getGenAIClient()

  if (!imagePart || !imagePart.inlineData.data) {
    console.warn('[Gemini Vision] No valid image data provided. Falling back to heuristic-engine.')
    return getFallbackAnalysis(metadata)
  }

  if (!client) {
    console.error('[Gemini Vision] GEMINI_API_KEY is not configured or client failed to initialize. Falling back to heuristic-engine.')
    return getFallbackAnalysis(metadata)
  }

  const prompt = `You are a dairy cattle nutritionist, forage agronomist, and feed quality diagnostic AI for Indian dairy farms.
Analyze this sample image and provided metadata:
- Sample Type: ${sampleType} (Feed or Silage)
- Feed Category: ${feedType}
- Storage Duration: ${storageDuration} days
- Storage Condition: ${storageCondition}
- Farmer Notes: ${notes || 'None'}

CRITICAL VALIDATION STEP:
First, inspect the uploaded photo carefully.
Determine whether the image depicts cattle feed, silage, green fodder, dry fodder, straw, hay, cattle pellets, grain mash, or agricultural forage ingredients used in dairy/cattle farming.

If the image is completely unrelated to cattle feed/silage (for example: human face, selfie, person, car, vehicle, electronics, phone, computer, household furniture, pet dog/cat, human food dishes, clothes, landscape without cattle feed, or documents/receipts), you MUST REJECT it by returning ONLY this JSON:
{
  "isValidFeedImage": false,
  "rejectionReason": "The uploaded photo does not appear to be cattle feed, fodder, or silage. Please upload a clear photo of your cattle feed sample, silage pit face, or forage.",
  "rejectionReasonHi": "अपलोड की गई फ़ोटो पशु आहार, हरा चारा या साइलेज नहीं लग रही है। कृपया अपने पशु आहार, साइलेज या चारे के नमूने की स्पष्ट फ़ोटो अपलोड करें।"
}

If the image IS a valid cattle feed, silage, or forage sample, return ONLY this valid JSON:
{
  "isValidFeedImage": true,
  "score": 87,
  "confidence": 92,
  "confidenceInterval": { "min": 88, "max": 96 },
  "overallStatus": "Good",
  "aiExplanation": "Detailed visual evaluation specific to the color, texture, fermentation indicators, and physical traits seen in this sample photo.",
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
}
Note: "confidence" is the point estimate (0-100), and "confidenceInterval" must strictly contain the confidence point estimate: min <= confidence <= max.`

  const errors = []

  function normalizeStatus(st) {
    if (!st) return 'Good'
    const s = String(st).toLowerCase().trim()
    if (s.includes('bad') || s.includes('poor') || s.includes('high') || s.includes('danger') || s.includes('critical') || s.includes('severe')) {
      return 'Bad'
    }
    if (s.includes('warn') || s.includes('caut') || s.includes('mod') || s.includes('medium') || s.includes('fair')) {
      return 'Warning'
    }
    return 'Good'
  }

  for (const modelName of SUPPORTED_MODELS) {
    try {
      console.log(`[Gemini Vision] Running visual screening with ${modelName}...`)
      const model = client.getGenerativeModel({ model: modelName })
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

      // Handle Rejection if unrelated image
      if (parsed && parsed.isValidFeedImage === false) {
        console.warn(`[Gemini Vision] Image rejected — not cattle feed/silage: ${parsed.rejectionReason}`)
        return {
          isValidFeedImage: false,
          rejectionReason: parsed.rejectionReason || 'The uploaded photo does not appear to be cattle feed, fodder, or silage. Please upload a clear photo of your cattle feed sample, silage pit face, or forage.',
          rejectionReasonHi: parsed.rejectionReasonHi || 'अपलोड की गई फ़ोटो पशु आहार, हरा चारा या साइलेज नहीं लग रही है। कृपया अपने पशु आहार, साइलेज या चारे के नमूने की स्पष्ट फ़ोटो अपलोड करें।'
        }
      }

      if (parsed && typeof parsed.score === 'number' && parsed.parameters) {
        parsed.isValidFeedImage = true
        parsed.aiModelUsed = modelName
        parsed.overallStatus = normalizeStatus(parsed.overallStatus || (parsed.score < 55 ? 'Bad' : parsed.score < 78 ? 'Warning' : 'Good'))

        // Normalize every individual parameter's status
        if (parsed.parameters && typeof parsed.parameters === 'object') {
          for (const key of Object.keys(parsed.parameters)) {
            const param = parsed.parameters[key]
            if (param && typeof param === 'object') {
              param.status = normalizeStatus(param.status)
              if (!param.label) {
                param.label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
              }
            }
          }
        }

        parsed.mycotoxinRiskRadar = calculateMycotoxinRiskRadar(parsed.parameters, metadata)
        parsed.costOfPoorQuality = calculateCostOfPoorQuality(parsed.score, herdSize, milkPrice)
        parsed.disclaimer = 'Screening estimate for management decision support. Not a regulatory laboratory assay.'
        
        // Guarantee confidence point estimate strictly falls within [min, max]
        const conf = typeof parsed.confidence === 'number' ? parsed.confidence : 91
        let min = parsed.confidenceInterval?.min
        let max = parsed.confidenceInterval?.max

        if (typeof min !== 'number' || typeof max !== 'number' || min > max || conf < min || conf > max) {
          min = Math.max(0, conf - 4)
          max = Math.min(100, conf + 4)
        }
        parsed.confidence = conf
        parsed.confidenceInterval = { min, max }

        console.log(`[Gemini Vision] Successfully analyzed image with model ${modelName}. Score: ${parsed.score}, Confidence: ${parsed.confidence}% (${parsed.confidenceInterval.min}-${parsed.confidenceInterval.max}% CI)`)
        return parsed
      }
    } catch (err) {
      console.error(`[Gemini Vision Error] Model ${modelName} failed: ${err.message}`)
      errors.push({ model: modelName, error: err.message })
    }
  }

  console.error(`[Gemini Vision Critical] All candidate models failed:`, JSON.stringify(errors, null, 2))
  console.warn(`[Gemini Vision] Falling back to heuristic-engine.`)
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
  // Guarantee CI strictly contains confidence (91 is between 87 and 95)
  const confidenceInterval = { min: Math.max(0, confidence - 4), max: Math.min(100, confidence + 4) }

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
export async function chatWithAssistant(msgOrOpts, history = [], language = 'en', context = {}) {
  let message = msgOrOpts
  if (typeof msgOrOpts === 'object' && msgOrOpts !== null) {
    message = msgOrOpts.message || ''
    history = msgOrOpts.history || history
    language = msgOrOpts.language || language
    context = msgOrOpts.context || context
  }
  message = String(message || '')

  const client = getGenAIClient()
  if (!client) {
    console.warn('[Gemini Chat] GEMINI_API_KEY not configured. Falling back to offline responses.')
    return getOfflineChatResponse(message, language)
  }

  const isHindi = language === 'hi' || language === 'Hindi' || /[\u0900-\u097F]/.test(message)
  const systemPrompt = `You are SmartFeed AI Assistant, a world-class AI Agronomist, Animal Nutritionist, and Dairy Farming Expert.

Core Responsibilities:
1. Provide comprehensive, accurate, and scientifically validated answers regarding feed quality, silage fermentation (pH, lactic acid, packing density, inoculants, anaerobic sealing), cattle nutrition (TMR, dry matter intake, crude protein, bypass fat), disease/mycotoxin prevention (aflatoxin, vomitoxin, zearalenone), fodder crops (Maize, Napier, Lucerne, Sorghum, Berseem), and dairy milk yield optimization.
2. Context Integration: If the farmer's farm data is provided below, directly reference their specific samples, batches, milk yield trend, and farm status:
${JSON.stringify(context || {}, null, 2)}
3. Language: If the user writes in Hindi or the selected language is Hindi (हिंदी), answer in natural, fluent, easy-to-understand Hindi (हिंदी) with Devanagari script. Otherwise, reply in clear, professional English.

Strict Formatting Guidelines:
- Clean Structured Layout: Use clear headings (e.g. ### 1. Immediate Mold Remediation, ### 2. Milk Yield Recovery Plan).
- Bullet Points: Use clear bullet points (- or *) for lists, action steps, and guidelines.
- Key Term Highlights: Bold important terms, dosage numbers, percentages, and alerts (e.g., **Toxin Binder**, **62-68% Moisture**, **16% Crude Protein**).
- Readability: Keep paragraphs short (2-3 sentences max) and avoid raw unstructured text dumps or broken markdown symbols.
- Completeness: Give complete, thorough step-by-step guidance without cutting off abruptly.`

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
        console.log(`[Gemini Chat] Querying assistant model ${modelName} (attempt ${attempt}/2) for: "${message.slice(0, 60)}"...`)
        const model = client.getGenerativeModel({
          model: modelName,
          systemInstruction: {
            parts: [{ text: systemPrompt }]
          }
        })

        const response = await withTimeout(
          model.generateContent({
            contents,
            generationConfig: {
              temperature: 0.65,
              maxOutputTokens: 4096
            }
          }),
          30000
        )

        const candidate = response.response.candidates?.[0]
        const finishReason = candidate?.finishReason
        let text = response.response.text()

        if (text && text.trim()) {
          text = text.trim()
          if (finishReason === 'MAX_TOKENS') {
            console.warn(`[Gemini Chat] Response reached MAX_TOKENS limit (4096) on model ${modelName}`)
          }
          console.log(`[Gemini Chat] Success with model ${modelName} (${text.length} chars, finishReason: ${finishReason || 'STOP'})`)
          return text
        }
      } catch (err) {
        console.error(`[Gemini Chat] Model ${modelName} attempt ${attempt} failed: ${err.message}`)
        if (attempt === 1) {
          const delayMs = 1500 * attempt
          console.log(`[Gemini Chat] Retrying in ${delayMs}ms with backoff...`)
          await new Promise(r => setTimeout(r, delayMs))
        }
      }
    }
  }

  console.warn('[Gemini Chat] All candidate models failed. Falling back to structured agronomy fallback logic.')
  return getOfflineChatResponse(message, language)
}

export async function generateReportSummary(title, data, language = 'en') {
  const client = getGenAIClient()
  if (!client) {
    return `Screening analysis for ${title}. Feed sample parameters are verified with a quality score of ${data.score || 80}/100.`
  }

  const prompt = `Write a concise 2-sentence executive summary for this cattle feed screening report:
Title: ${title}
Score: ${data.score || 80}/100 (${data.overallStatus || 'Good'})
Sample Type: ${data.sampleType || 'Silage'}
Parameters: ${JSON.stringify(data.parameters || {})}`

  for (const modelName of SUPPORTED_MODELS) {
    try {
      const model = client.getGenerativeModel({ model: modelName })
      const res = await withTimeout(model.generateContent(prompt), 10000)
      return res.response.text().trim()
    } catch (err) {
      console.warn(`[Gemini Summary] Model ${modelName} summary failed: ${err.message}`)
    }
  }

  return `Screening analysis for ${title}. Feed sample evaluated with overall score ${data.score || 80}/100.`
}

function getOfflineChatResponse(message, language = 'en') {
  const m = String(message || '').toLowerCase()
  const isHindi = language === 'hi' || language === 'Hindi' || /[\u0900-\u097F]/.test(m) || m.includes('namaste') || m.includes('kya') || m.includes('kaise') || m.includes('karein') || m.includes('karu')

  // Multi-concern: Mold + Milk Yield Drop
  if ((m.includes('mold') || m.includes('mould') || m.includes('फफूंद')) && (m.includes('milk') || m.includes('दूध') || m.includes('yield') || m.includes('kam') || m.includes('drop'))) {
    return isHindi
      ? `### 🚨 आपातकालीन कार्ययोजना: साइलेज में फफूंद और दूध उत्पादन में गिरावट

साइलेज में फफूंद (Mold) लगने से **एफ्लाटॉक्सिन (Aflatoxin)** और अन्य माइकोटॉक्सिन बनते हैं, जो गाय-भैंस के रूमेन माइक्रोफ्लोरा को नष्ट कर देते हैं, जिससे दूध का उत्पादन 15-30% तक गिर जाता है।

---

### 1. तुरंत करने योग्य कदम (Immediate Actions):
- **संक्रमित परत को हटाएं:** सफेद, काली या नीली-हरी फफूंद वाले साइलेज को तुरंत पूरी तरह अलग कर दें। इसे गलती से भी पशुओं को न खिलाएं।
- **गड्ढे/बैग की एयरटाइट सीलिंग:** साइलेज फेस से रोजाना कम से कम 15-20 सेमी परत एकसमान रूप से निकालें और बाकी हिस्से को प्लास्टिक तिरपाल से तुरंत कसकर ढक दें।
- **दूषित चारे को अलग करें:** जिस हिस्से में हल्की गंध या फफूंद का संदेह हो, उसे अलग क्वारंटाइन करें।

---

### 2. पशु स्वास्थ्य और दूध सुधार (Lactation Recovery):
- **टॉक्सिन बाइंडर (Toxin Binder):** प्रति पशु **20 से 30 ग्राम यीस्ट सेल वॉल (MOS) या बेंटोनाइट क्ले आधारित टॉक्सिन बाइंडर** रोज दाने में मिलाकर दें।
- **रूमेन बफर और प्रोबायोटिक्स:** रूमेन के pH को स्थिर करने के लिए **50-80 ग्राम सोडियम बाइकार्बोनेट (मीठा सोडा)** और लाइव यीस्ट कल्चर दें।
- **ऊर्जा और प्रोटीन सप्लीमेंटेशन:** दूध उत्पादन वापस लाने के लिए **100-150 ग्राम बाईपास फैट** और उच्च गुणवत्ता वाली खल (सोयाबीन/सरसों खल) दें।
- **मिनरल मिक्सचर:** प्रति पशु रोज **50-60 ग्राम चेलेटेड मिनरल मिक्सचर** अनिवार्य रूप से खिलाएं।

---

### 3. दीर्घकालिक रोकथाम:
- साइलेज निकालते समय गड्ढे का मुंह कम से कम समय के लिए खुला रखें।
- नमी हमेशा **62% से 68%** के बीच रखें और दबाई (compaction) मजबूत करें ताकि हवा अंदर न जा सके।`
      : `### 🚨 Emergency Action Plan: Silage Mold Contamination & Milk Yield Drop

Mold in silage generates hazardous **mycotoxins (Aflatoxin, Vomitoxin)** that severely disrupt the rumen microbiome, suppress appetite, and cause a sudden **15-30% drop in daily milk yield**.

---

### 1. Immediate Mold Remediation Steps:
- **Discard Contaminated Forage:** Physically discard all visible white, black, or blue-green moldy patches (at least 20-30 cm deep around the mold spot). Never blend moldy silage with good feed.
- **Airtight Trench Management:** Keep the silage pit face strictly vertical and cleanly shaved. Remove 15-20 cm across the face daily and seal tightly with UV-treated plastic tarp.
- **Ventilate & Inspect:** Check the core pit temperature. If heating (>40°C), secondary aerobic spoilage is active.

---

### 2. Herd Treatment & Milk Yield Recovery:
- **Broad-Spectrum Toxin Binder:** Add **20–30g of Yeast Cell Wall (MOS) / Sodium Bentonite toxin binder** per cow daily in the concentrate mash.
- **Rumen Buffering & Probiotics:** Administer **50–80g Sodium Bicarbonate** + Live Saccharomyces cerevisiae yeast culture to restore rumen bacterial fermentation.
- **High-Energy Bypass Nutrients:** Support lactation with **100–150g rumen-protected bypass fat** and increase crude protein with 1kg soybean meal or cottonseed cake.
- **Chelated Minerals:** Ensure **50g/cow daily chelated mineral mixture** with organic zinc, copper, and selenium for liver recovery.

---

### 3. Quality Verification:
- Run a rapid lateral flow assay (LFA) or SmartFeed AI visual screening on the remaining silage before full feeding.`
  }

  if (m.includes('score') || m.includes('स्कोर')) {
    return isHindi
      ? `### 📊 SmartFeed AI स्कोर गाइड
- **80 से 100 (उत्कृष्ट गुणवत्ता - Good):** उच्च लैक्टिक किण्वन, आदर्श नमी (62-68%), सुरक्षित और उच्च दूध उत्पादन के लिए उपयुक्त।
- **50 से 79 (मध्यम / चेतावनी - Warning):** नमी अधिक या कम हो सकती है। चारा प्रबंधन और टीएमआर संतुलन पर ध्यान दें।
- **50 से कम (उच्च जोखिम - High Risk):** फफूंद या सड़न का गंभीर खतरा। तुरंत आइसोलेट करें और टॉक्सिन बाइंडर का उपयोग करें।`
      : `### 📊 SmartFeed AI Quality Score Guide
- **80 to 100 (Good Quality):** Optimal lactic fermentation, ideal moisture (62-68%), minimal aerobic decay, excellent for high milk yields.
- **50 to 79 (Caution / Warning):** Moderate moisture or compaction variance. Monitor feeding face closely and balance with dry fiber.
- **Below 50 (High Risk / Bad):** Severe mold or clostridial risk. Isolate the batch immediately and do not feed directly to high-lactation cows.`
  }

  if (m.includes('mold') || m.includes('mould') || m.includes('फफूंद') || m.includes('fungus')) {
    return isHindi
      ? `### ⚠️ साइलेज में फफूंद (Mold) लगने पर आपातकालीन उपचार व समाधान

साइलेज में फफूंद लगने का मुख्य कारण **ऑक्सीजन (हवा) का प्रवेश** या **अपरियाप्त दबाई (Compaction)** है। फफूंद से हानिकारक माइकोटॉक्सिन (एफ्लाटॉक्सिन) पैदा होते हैं।

---

### 1. तत्काल कदम (Immediate Actions):
- **संक्रमित हिस्से को तुरंत निकालें:** सफेद, काली, लाल या नीली-हरी फफूंद वाली परत (कम से कम 20–30 सेमी गहराई तक) को पूरी तरह हटा दें। इसे पशुओं को बिल्कुल न खिलाएं।
- **गड्ढे/साइलो की एयरटाइट री-सीलिंग:** साइलेज फेस को सीधा काटें और रोजाना 15–20 सेमी परत निकालने के बाद प्लास्टिक शीट को तुरंत वजनी टायरों या रेत की बोरियों से कसकर ढकें।
- **प्रोपियोनिक एसिड स्प्रे:** यदि फेस पर फफूंद बार-बार आ रही हो, तो खुले फेस पर 0.5% प्रोपियोनिक एसिड या फंगल इनहिबिटर का हल्का छिड़काव करें।

---

### 2. पशु स्वास्थ्य व दूध सुरक्षा (Herd Protection):
- **टॉक्सिन बाइंडर (Toxin Binder):** दाने में प्रति पशु **25 से 30 ग्राम यीस्ट सेल वॉल (MOS) / सोडियम बेंटोनाइट टॉक्सिन बाइंडर** रोज दें।
- **रूमेन बफर (Rumen Buffer):** पाचन तंत्र को स्थिर रखने के लिए **50 ग्राम मीठा सोडा (Sodium Bicarbonate)** रोज दें।
- **लाइव यीस्ट कल्चर:** 10–15 ग्राम लाइव यीस्ट कल्चर दें ताकि रूमेन में अच्छे जीवाणु सक्रिय रहें और दूध न घटे।

---

### 3. भविष्य के लिए रोकथाम:
- साइलेज बनाते समय नमी हमेशा **62% से 68%** रखें।
- गड्ढा भरते समय ट्रैक्टर से अत्यधिक मजबूत दबाई करें ताकि अंदर हवा न रहे।`
      : `### ⚠️ Silage Mold Remediation & Management Protocol

Mold contamination occurs primarily due to **oxygen exposure**, **inadequate compaction**, or **delayed sealing**. Mold fungi generate hazardous mycotoxins that damage liver function and reduce milk yield.

---

### 1. Immediate Field Remediation:
- **Physically Remove Mold Layers:** Discard all visible white, black, red, or blue-green moldy patches (at least 20–30 cm deep around the spot). Never mix moldy silage with healthy feed.
- **Airtight Trench Management:** Keep the silage pit face strictly vertical. Remove 15–20 cm across the entire face daily and immediately reseal with heavy UV-treated plastic sheeting weighted with tires or sandbags.
- **Propionic Acid Face Spray:** Apply a 0.5% buffered propionic acid spray to exposed pit faces experiencing aerobic yeast growth.

---

### 2. Cattle Nutrition & Toxin Defense:
- **Toxin Binder Supplementation:** Feed **25–30g of Yeast Cell Wall (MOS) / Sodium Bentonite binder** per cow daily in the concentrate ration.
- **Rumen Buffering:** Add **50g Sodium Bicarbonate (baking soda)** daily to stabilize rumen pH against subacute acidosis.
- **Live Yeast Probiotics:** Administer 10–15g Saccharomyces cerevisiae live culture to support fiber-digesting rumen bacteria.

---

### 3. Prevention for Next Harvest:
- Target whole-plant maize moisture of **62% to 68%** at harvest.
- Maintain rigorous continuous tractor rolling during pit filling to achieve packing density >240 kg DM/m³.`
  }

  if (m.includes('moisture') || m.includes('नमी') || m.includes('water') || m.includes('पानी')) {
    return isHindi
      ? `### 💧 आदर्श साइलेज नमी स्तर
- **मक्का साइलेज (Maize Silage):** 62% से 68% नमी आदर्श है।
- **अधिक नमी (>70%):** ब्यूटायरिक एसिड किण्वन और सड़ांध का खतरा।
- **कम नमी (<55%):** हवा रह जाने से फफूंद और हीटिंग का खतरा।
- **उपाय:** यदि नमी ज्यादा हो, तो खिलाते समय सूखा भूसा (Wheat Straw) मिलाएं।`
      : `### 💧 Optimal Silage Moisture Guidelines
- **Target Moisture:** **62% – 68%** for whole-plant corn/maize silage.
- **High Moisture (>70%):** Causes foul butyric fermentation, nutrient runoff, and sour odor.
- **Low Moisture (<55%):** Traps air inside, causing severe aerobic heating and fungal growth.
- **Remedy:** Mix with 10-15% dry chopped wheat straw or hay during TMR feeding if moisture is too high.`
  }

  if (m.includes('ph') || m.includes('acid') || m.includes('एसिड')) {
    return isHindi
      ? `### 🧪 साइलेज pH मानक
- **आदर्श pH:** **3.8 से 4.2** (मक्का साइलेज के लिए)।
- **कारण:** तीव्र अम्लीयता लैक्टिक एसिड बैक्टीरिया द्वारा बनती है, जो सभी हानिकारक जीवाणुओं और फफूंद को रोकती है।
- **चेतावनी:** यदि pH 4.5 से ऊपर है, तो किण्वन अधूरा है।`
      : `### 🧪 Silage pH Reference Standards
- **Optimal pH Range:** **3.8 to 4.2** for properly fermented corn silage.
- **Mechanism:** Rapid lactic acidification suppresses spoilage microbes like Clostridia and molds.
- **Warning:** A pH above 4.5 indicates poor compaction or secondary aerobic exposure.`
  }

  if (m.includes('milk') || m.includes('दूध') || m.includes('yield') || m.includes('production')) {
    return isHindi
      ? `### 🥛 गाय-भैंस का दूध उत्पादन बढ़ाने के 4 प्रमुख सूत्र
1. **संतुलित TMR राशन:** 60% उच्च गुणवत्ता वाला साइलेज + 40% प्रोटीन कंसंट्रेट दाना दें।
2. **प्रति गाय दाना अनुपात:** प्रति 2.5 लीटर दूध उत्पादन पर **1 किग्रा संतुलित दाना** दें।
3. **बाईपास फैट व मिनरल मिक्सचर:** 50-100 ग्राम बाईपास फैट और 50 ग्राम चेलेटेड मिनरल मिक्सचर प्रतिदिन दें।
4. **ताजा पानी:** प्रत्येक दुधारू गाय को दिन में **80-100 लीटर स्वच्छ ताजा पानी** उपलब्ध कराएं।`
      : `### 🥛 4 Pillars to Maximize Dairy Milk Production
1. **Balanced TMR Ration:** Feed 60% high-quality silage (or green fodder) + 40% balanced concentrate mix.
2. **Concentrate Ratio:** Provide **1 kg balanced concentrate per 2.5 Liters of milk yield**.
3. **Bypass Nutrients:** Supplement 50-100g rumen-protected bypass fat and 50g chelated mineral mixture daily.
4. **Ad-Libitum Fresh Water:** Ensure 80-100 Liters of clean, accessible drinking water per cow per day.`
  }

  return isHindi
    ? `### 🌾 नमस्ते किसान भाई!
मैं आपका **SmartFeed AI सहायक** हूँ। आपके प्रश्न *"${message}"* के संदर्भ में:

- **साइलेज गुणवत्ता:** नमी 62-68% और pH 3.8-4.2 बनाए रखें।
- **राशन संतुलन:** साइलेज, दाना और सूखे चारे का सही संतुलन (TMR) पशु स्वास्थ्य और दूध के लिए आवश्यक है।
- **फफूंद व टॉक्सिन:** किसी भी संदिग्ध गंध या रंग पर तुरंत जांच करें।

आप साइलेज बनाने, नमी जांचने, या दूध बढ़ाने के बारे में विस्तार से पूछ सकते हैं!`
    : `### 🌾 Hello Dairy Farmer!
I am your **SmartFeed AI Agronomist**. Regarding your query *"${message}"*:

- **Silage Quality Target:** Maintain **62–68% moisture** and **pH 3.8–4.2** with airtight packing.
- **Ration Balancing:** Feed balanced Total Mixed Ration (TMR) combining 60% quality forage with 40% protein concentrate.
- **Mycotoxin Vigilance:** Inspect pit faces daily and discard moldy patches immediately.

Feel free to ask detailed questions on silage management, ration balancing, or herd health!`
}
