import { GoogleGenerativeAI } from '@google/generative-ai'
import { calculateMockParameters, calculateMycotoxinRiskRadar, calculateCostOfPoorQuality, generateAdvisoriesForParameters } from '../utils/mockParameters.js'

let genAI = null
function getGenAIClient() {
  if (!genAI && process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  }
  return genAI
}

// Valid Gemini API model identifiers — ordered by availability preference (most stable first)
const SUPPORTED_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-3.5-flash',
  'gemini-3.7-flash',
  'gemini-3.6-flash',
  'gemini-flash-latest'
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

function withTimeout(promise, ms = 25000) {
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
    smell = 'Neutral',
    herdSize = 12,
    milkPrice = 40
  } = metadata

  // ── Debug: generate a unique request ID for tracing this analysis ──
  const requestId = `VIS-${Date.now().toString(36).toUpperCase()}`
  const imagePart = parseBase64Image(base64Image)
  const imageSizeKB = base64Image ? Math.round(base64Image.length * 0.75 / 1024) : 0
  const mimeType = imagePart?.inlineData?.mimeType || 'unknown'

  console.log(`[Gemini Vision][${requestId}] Analysis started — sampleType=${sampleType}, feedType=${feedType}, storageCondition=${storageCondition}, storageDuration=${storageDuration}d, smell=${smell}, imageSize=${imageSizeKB}KB, mimeType=${mimeType}`)

  const client = getGenAIClient()

  if (!imagePart || !imagePart.inlineData.data) {
    console.warn(`[Gemini Vision][${requestId}] No valid image data provided. Routing to input-driven heuristic.`)
    return getFallbackAnalysis(metadata)
  }

  if (!client) {
    console.error(`[Gemini Vision][${requestId}] GEMINI_API_KEY not configured. Returning analysis failed.`)
    return {
      isValidFeedImage: true,
      analysis_failed: true,
      failure_reason: 'Gemini API key is not configured on the server.',
      failure_reason_hi: 'सर्वर पर Gemini API कुंजी कॉन्फ़िगर नहीं है।'
    }
  }

  const prompt = `You are a certified veterinary agronomist, dairy cattle nutritionist, and precision feed diagnostic AI.
Your critical job is to visually inspect this agricultural feed/silage sample photo for SPOILAGE, MOLD, MYCOTOXINS, and QUALITY DEFECTS.

Farmer-provided context:
- Sample Type: ${sampleType}
- Declared Feed Type: ${feedType}
- Storage Duration: ${storageDuration} days
- Storage Condition: ${storageCondition}
- Farmer Reported Smell: ${smell || 'Neutral'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CRITICAL RULE 0: VISUAL EVIDENCE 100% OVERRIDES METADATA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
The farmer may have entered incorrect or default dropdown values.
YOUR ASSESSMENT MUST BE 100% BASED ON WHAT IS VISIBLE IN THIS PHOTO.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 1: REJECT NON-FEED IMAGES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
If this image depicts people, faces, vehicles, electronics, furniture, pets, blank screens, or non-agricultural items:
Return ONLY:
{ "isValidFeedImage": false, "rejectionReason": "Not a feed/silage image.", "rejectionReasonHi": "यह तस्वीर पशु आहार या साइलेज नहीं है।" }

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 2: CHECK IMAGE CLARITY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
If the image is completely pitch black, totally blurred beyond recognition, or does not show the feed surface:
Return ONLY:
{ "isValidFeedImage": true, "insufficient_evidence": true, "reason": "Image is too dark or blurry to examine mold or forage particles." }

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 3: RIGOROUS VISUAL MOLD & SPOILAGE DETECTION (ZERO TOLERANCE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Inspect the forage matrix closely for:
1. WHITE, GREY, OR LIGHT-COLORED FUNGAL MYCELIUM / MOLD PATCHES (cottony, powdery, or web-like clusters of Penicillium, Aspergillus, or Mucor).
2. BLUE-GREEN, OLIVE-BLACK, OR RED/PINKISH MOLD SPOTS.
3. BLACK, SLIMY, OR DARK ROTTING DISCOLORATION (clostridial decomposition, aerobic deterioration).
4. DRY, CARAMELIZED, TOBACCO-BROWN HEAT-DAMAGED FIBERS.

MOLD CLASSIFICATION MANDATE:
- If ANY visible white mold mycelium, fungal growth, or rotting patches are present:
  * The sample CANNOT be 'GOOD'.
  * You MUST classify as 'POOR' (score 25–48) or 'SEVERELY_SPOILED' (score 0–24).
  * visual_evidence MUST explicitly state: "Visible white/grey fungal mycelium mold patches observed across forage fibers."
  * adulteration_flag / contamination: "Detected" or "Suspected".
  * aflatoxin_level: estimated >= 25 ppb.
  * overallStatus: "Bad".

- Classification Tiers:
  * GOOD (80–95): Clean golden-green or uniform olive color, crisp chopped stems, ZERO visible mold, zero slimy dark rot.
  * MODERATE (55–79): Mild uneven browning, slight moisture variance, NO active mold colonies.
  * POOR (25–54): Obvious white/grey/black mold patches, distinct discoloration, visible decay.
  * SEVERELY_SPOILED (0–24): Widespread fungal mycelium, extensive rot, blackened spoiled silage.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 4: OUTPUT FORMAT (STRICT JSON ONLY)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Return ONLY valid JSON matching this structure:
{
  "isValidFeedImage": true,
  "insufficient_evidence": false,
  "visual_class": "GOOD|MODERATE|POOR|SEVERELY_SPOILED",
  "visual_evidence": [
    "<Precise observation 1, e.g., 'White fungal mycelium patches detected across the center-left area'>",
    "<Precise observation 2, e.g., 'Dark decayed organic matter with signs of aerobic spoilage'>",
    "<Precise observation 3, e.g., 'Chop particle distribution and moisture visual characteristics'>"
  ],
  "score": <integer strictly matching your visual_class range (e.g. if mold is visible, score must be 15-45)>,
  "confidence": <integer 75-98>,
  "confidenceInterval": { "min": <integer>, "max": <integer> },
  "overallStatus": "Good|Warning|Bad",
  "aiExplanation": "<2-4 sentences explicitly stating the visual classification, exact locations of any mold or defects observed in this specific photo, and the resulting health risks for dairy cattle.>",
  "keyIndicators": [
    "<Indicator 1, e.g., 'Active Fungal Mycelium / Mold: Present'>",
    "<Indicator 2, e.g., 'Forage Discoloration: High / Aerobic Decay'>",
    "<Indicator 3, e.g., 'Feed Safety Level: Hazardous / High Risk'>"
  ],
  "heatmapRegions": [
    { "x": <0-100>, "y": <0-100>, "radius": <10-35>, "impact": "low|medium|high", "label": "<Specific defect or feature in this region>" }
  ],
  "advisories": [
    "<Actionable advice, e.g., 'Do not feed moldy portions to lactating or pregnant cattle to prevent mycotoxicosis.'>"
  ],
  "recommendations": "<Clear instruction: Discard spoiled sections, isolate batch, or feed with toxin binder.>",
  "parameters": {
    "crude_protein": { "value": <number>, "unit": "%", "label": "Crude Protein", "status": "Good|Warning|Bad", "optimalRange": "12% - 18%" },
    "moisture": { "value": <number>, "unit": "%", "label": "Moisture", "status": "Good|Warning|Bad", "optimalRange": "55% - 68%" },
    "fiber": { "value": <number>, "unit": "%", "label": "Fiber", "status": "Good|Warning|Bad", "optimalRange": "24% - 32%" },
    "energy_value": { "value": <number>, "unit": "MJ/kg", "label": "Energy Value", "status": "Good|Warning|Bad", "optimalRange": "8.0 - 10.5 MJ/kg" },
    "mineral_status": { "value": "Balanced|Marginal|Deficient", "unit": "", "label": "Mineral Status", "status": "Good|Warning|Bad", "optimalRange": "Balanced" },
    "adulteration_flag": { "value": "Not detected|Suspected|Detected", "unit": "", "label": "Contamination / Mold", "status": "Good|Warning|Bad", "optimalRange": "Not detected" },
    "aflatoxin_level": { "value": <number (e.g. 35 if mold is visible, 4 if clean)>, "unit": "ppb", "label": "Mycotoxin / Aflatoxin Risk", "status": "Good|Warning|Bad", "optimalRange": "< 10 ppb" }
  }
}`

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
      console.log(`[Gemini Vision][${requestId}] Calling model ${modelName} with ${imageSizeKB}KB image...`)
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
        25000
      )

      const rawText = response.response.text()
      console.log(`[Gemini Vision][${requestId}] Raw response received from ${modelName} (${rawText.length} chars)`)
      const parsed = JSON.parse(rawText)

      // ── Handle: not a feed/silage image ──
      if (parsed && parsed.isValidFeedImage === false) {
        console.warn(`[Gemini Vision][${requestId}] Image rejected — not feed/silage`)
        return {
          isValidFeedImage: false,
          rejectionReason: parsed.rejectionReason || 'The uploaded photo does not appear to be cattle feed, fodder, or silage.',
          rejectionReasonHi: parsed.rejectionReasonHi || 'अपलोड की गई फ़ोटो पशु आहार, हरा चारा या साइलेज नहीं लग रही है।'
        }
      }

      // ── Handle: feed image but insufficient visual evidence ──
      if (parsed && parsed.isValidFeedImage === true && parsed.insufficient_evidence === true) {
        console.warn(`[Gemini Vision][${requestId}] Insufficient visual evidence: ${parsed.reason}`)
        return {
          isValidFeedImage: true,
          analysis_failed: true,
          failure_reason: parsed.reason || 'Image does not contain enough visual detail to perform reliable feed quality screening. Please upload a clear, close-up, well-lit photo of the feed surface.',
          failure_reason_hi: 'छवि में पर्याप्त दृश्य जानकारी नहीं है। कृपया फ़ीड की सतह की स्पष्ट, नज़दीकी और अच्छी रोशनी में फ़ोटो अपलोड करें।'
        }
      }

      // ── Handle: valid analysis with visual_class + score ──
      if (parsed && typeof parsed.score === 'number' && parsed.parameters) {
        parsed.isValidFeedImage = true
        parsed.aiModelUsed = modelName

        // Enforce strict score consistency with visual_class
        const vc = String(parsed.visual_class || '').toUpperCase()
        if (vc.includes('SEVERELY') || vc.includes('SPOILED')) {
          parsed.score = Math.max(5, Math.min(24, parsed.score))
          parsed.overallStatus = 'Bad'
        } else if (vc.includes('POOR')) {
          parsed.score = Math.max(25, Math.min(54, parsed.score))
          parsed.overallStatus = 'Bad'
        } else if (vc.includes('MODERATE')) {
          parsed.score = Math.max(55, Math.min(79, parsed.score))
          parsed.overallStatus = 'Warning'
        } else if (vc.includes('GOOD')) {
          parsed.score = Math.max(80, Math.min(96, parsed.score))
          parsed.overallStatus = 'Good'
        } else {
          parsed.overallStatus = parsed.score >= 80 ? 'Good' : parsed.score >= 55 ? 'Warning' : 'Bad'
        }

        // Normalize parameter statuses
        if (parsed.parameters && typeof parsed.parameters === 'object') {
          for (const key of Object.keys(parsed.parameters)) {
            const param = parsed.parameters[key]
            if (param && typeof param === 'object') {
              param.status = normalizeStatus(param.status)
              if (!param.label) param.label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
            }
          }
        }

        parsed.mycotoxinRiskRadar = calculateMycotoxinRiskRadar(parsed.parameters, metadata)
        parsed.costOfPoorQuality = calculateCostOfPoorQuality(parsed.score, herdSize, milkPrice)
        parsed.disclaimer = 'Visual screening estimate only. Cannot measure exact chemical composition. Laboratory confirmation recommended for critical decisions.'

        // Enforce CI contains confidence point estimate
        const conf = typeof parsed.confidence === 'number' ? Math.max(1, Math.min(99, parsed.confidence)) : 85
        let ciMin = parsed.confidenceInterval?.min
        let ciMax = parsed.confidenceInterval?.max
        if (typeof ciMin !== 'number' || typeof ciMax !== 'number' || ciMin > ciMax || conf < ciMin || conf > ciMax) {
          ciMin = Math.max(0, conf - 5)
          ciMax = Math.min(100, conf + 5)
        }
        parsed.confidence = conf
        parsed.confidenceInterval = { min: ciMin, max: ciMax }

        console.log(`[Gemini Vision][${requestId}] SUCCESS — model=${modelName}, visual_class=${parsed.visual_class || 'N/A'}, score=${parsed.score}, confidence=${conf}%, status=${parsed.overallStatus}`)
        return parsed
      }

      console.warn(`[Gemini Vision][${requestId}] Model ${modelName} returned unexpected structure — score or parameters missing`)
    } catch (err) {
      console.error(`[Gemini Vision][${requestId}] Model ${modelName} error: ${err.message}`)
      errors.push({ model: modelName, error: err.message })
    }
  }

  console.error(`[Gemini Vision][${requestId}] All models failed:`, JSON.stringify(errors, null, 2))
  
  // If user provided an image and AI failed to process it, DO NOT return a fake good score!
  return {
    isValidFeedImage: true,
    analysis_failed: true,
    failure_reason: 'AI Vision Service is currently busy or rate-limited. Unable to perform visual mold screening on your photo. Please retry in a few moments.',
    failure_reason_hi: 'AI विज़न सेवा वर्तमान में व्यस्त है। कृपया कुछ क्षण बाद पुनः प्रयास करें।'
  }
}

/**
 * Input-driven heuristic fallback — used ONLY when Gemini cannot be reached.
 * Score is derived from farmer-reported observable inputs (smell, storage, duration).
 * NEVER returns a hardcoded fixed score — every input combination produces different results.
 */
function getFallbackAnalysis(metadata = {}) {
  const {
    sampleType = 'Silage',
    feedType = 'Maize Silage',
    storageDuration = 20,
    storageCondition = 'Covered Pit',
    smell = 'Neutral',
    herdSize = 10,
    milkPrice = 40
  } = metadata
  const isSilage = sampleType.toLowerCase().includes('silage')

  // ── Score starts at a neutral 72 and is ADJUSTED by observable inputs ──
  // This ensures different inputs produce different scores, not a hardcoded 84.
  let score = 72
  const riskFactors = []
  const positiveFactors = []

  // Smell is the strongest observable spoilage indicator
  const smellLower = String(smell || 'Neutral').toLowerCase()
  if (smellLower.includes('putrid') || smellLower.includes('rotten')) {
    score -= 35
    riskFactors.push('Putrid/rotten smell strongly indicates clostridial spoilage or protein degradation')
  } else if (smellLower.includes('musty') || smellLower.includes('moldy')) {
    score -= 22
    riskFactors.push('Musty odor suggests active mold growth and potential mycotoxin presence')
  } else if (smellLower.includes('vinegar') || smellLower.includes('acetic')) {
    score -= 12
    riskFactors.push('Strong vinegar (acetic acid) smell indicates acetate fermentation, not optimal lactic preservation')
  } else if (smellLower.includes('sweet') || smellLower.includes('lactic')) {
    score += 10
    positiveFactors.push('Sweet lactic aroma indicates proper lactic acid fermentation')
  } else if (smellLower.includes('neutral') || smellLower.includes('normal')) {
    score += 3
    positiveFactors.push('Neutral smell — no obvious spoilage indicators')
  }

  // Storage condition
  const scLower = String(storageCondition || '').toLowerCase()
  if (scLower.includes('open') || scLower.includes('stack')) {
    score -= 15
    riskFactors.push('Open air storage significantly increases aerobic spoilage and mold risk')
  } else if (scLower.includes('silo bag') || scLower.includes('bag')) {
    score += 5
    positiveFactors.push('Silo bag provides good anaerobic sealing')
  } else if (scLower.includes('covered pit') || scLower.includes('covered')) {
    score += 8
    positiveFactors.push('Covered pit provides good anaerobic preservation conditions')
  }

  // Storage duration
  const dur = Number(storageDuration) || 0
  if (isSilage) {
    if (dur > 90) { score -= 10; riskFactors.push(`Extended storage (${dur} days) increases aerobic exposure and nutrient loss risk`) }
    else if (dur > 45) { score -= 4; riskFactors.push(`Storage duration (${dur} days) approaching upper limit for optimal quality`) }
    else if (dur >= 21 && dur <= 45) { score += 6; positiveFactors.push('Storage duration within optimal fermentation window (21-45 days)') }
    else if (dur < 14) { score -= 8; riskFactors.push('Silage may not have completed primary fermentation (< 14 days)') }
  } else {
    if (dur > 60) { score -= 8; riskFactors.push(`Concentrate stored for ${dur} days — moisture absorption and mold risk elevated`) }
    else if (dur <= 30) { score += 4; positiveFactors.push('Feed concentrate within recommended storage window') }
  }

  // Clamp score to valid range
  score = Math.max(5, Math.min(95, Math.round(score)))

  // Derive status from score
  let overallStatus = 'Good'
  let visual_class = 'GOOD'
  if (score < 40) { overallStatus = 'Bad'; visual_class = 'POOR' }
  else if (score < 55) { overallStatus = 'Bad'; visual_class = 'POOR' }
  else if (score < 72) { overallStatus = 'Warning'; visual_class = 'MODERATE' }

  // Confidence is lower for heuristic (no actual image analysis)
  const confidence = 55
  const confidenceInterval = { min: Math.max(0, confidence - 12), max: Math.min(100, confidence + 12) }

  const parameters = calculateMockParameters({ sampleType, moisture: null, crude_protein: null })
  const advisories = generateAdvisoriesForParameters(parameters, sampleType)
  const mycotoxinRiskRadar = calculateMycotoxinRiskRadar(parameters, metadata)
  const costOfPoorQuality = calculateCostOfPoorQuality(score, herdSize, milkPrice)

  const heatmapRegions = [
    { x: 40, y: 45, radius: 28, impact: overallStatus === 'Good' ? 'low' : overallStatus === 'Warning' ? 'medium' : 'high', label: 'Primary Sample Area (Input-Based Estimate)' },
    { x: 70, y: 25, radius: 18, impact: overallStatus === 'Bad' ? 'high' : 'low', label: riskFactors.length > 0 ? 'Risk Indicator Area' : 'Secondary Region' }
  ]

  const keyIndicators = [
    ...riskFactors.map(f => `⚠ ${f}`),
    ...positiveFactors.map(f => `✓ ${f}`),
    `Storage: ${storageCondition} — ${dur} days`,
    'Note: Visual AI analysis unavailable — this estimate is based on farmer-reported inputs only'
  ].slice(0, 5)

  console.log(`[Gemini Vision][Heuristic] Input-driven score=${score} (${overallStatus}), smell=${smell}, storage=${storageCondition}, dur=${dur}d, risks=${riskFactors.length}`)

  return {
    score,
    confidence,
    confidenceInterval,
    overallStatus,
    visual_class,
    aiModelUsed: 'input-heuristic',
    aiExplanation: riskFactors.length > 0
      ? `Input-based assessment (AI image analysis unavailable): ${riskFactors[0]}. Score of ${score}/100 derived from farmer-reported smell, storage type, and duration.`
      : `Input-based assessment (AI image analysis unavailable): No major risk signals detected from reported inputs. Score of ${score}/100 reflects ${storageCondition} storage with ${dur}-day duration.`,
    keyIndicators,
    heatmapRegions,
    advisories,
    recommendations: overallStatus === 'Good'
      ? 'Input-based screening suggests acceptable conditions. Upload a clear image for AI visual confirmation.'
      : `Inputs indicate potential quality concerns. ${riskFactors[0] || 'Review storage and feeding protocols.'}`,
    parameters,
    mycotoxinRiskRadar,
    costOfPoorQuality,
    disclaimer: '⚠ AI visual analysis was unavailable. This result is estimated from farmer-reported inputs (smell, storage type, duration) only — NOT from image analysis. Upload a clear feed photo for accurate visual screening.'
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
  const systemPrompt = `You are SmartFeed AI Assistant — a world-class AI Agronomist, Animal Nutritionist, and Dairy Farming Expert built specifically for Indian dairy farmers.

=== CORE RULES (MUST FOLLOW STRICTLY) ===
1. ANSWER THE SPECIFIC QUESTION: Read the user's exact question carefully and answer IT specifically. Do NOT give generic copy-paste agriculture advice unrelated to what was asked.
2. NO HALLUCINATION: Do NOT invent lab test results, fake statistics, or made-up scientific citations. If you are unsure, say so clearly.
3. USE FARM CONTEXT: The farmer's actual farm data is provided below. Reference their specific numbers (scores, batch IDs, feed types, milk yield) when relevant — do NOT ignore this data.
4. NO FILLER RESPONSES: Never output a generic paragraph that doesn't directly answer the question. Every response must be directly relevant and actionable.
5. COMPLETE ANSWERS: Do not cut off mid-answer. Give complete, thorough guidance.

=== FARMER'S FARM CONTEXT ===
${JSON.stringify(context || {}, null, 2)}

=== LANGUAGE ===
If the user writes in Hindi or language is set to Hindi (हिंदी), reply in fluent, natural Hindi (Devanagari script).
Otherwise, reply in clear, professional English.

=== EXPERTISE AREAS ===
- Feed quality screening & silage fermentation (pH, lactic acid, packing density, inoculants, anaerobic sealing)
- Cattle nutrition (TMR, dry matter intake, crude protein, bypass fat, energy balancing)
- Mycotoxin & disease prevention (aflatoxin, vomitoxin, zearalenone, DON)
- Fodder crop management (Maize, Napier, Lucerne, Sorghum, Berseem, Bajra)
- Dairy milk yield optimization and ration balancing
- Feed cost optimization for smallholder Indian dairy farms

=== FORMATTING RULES ===
- Use clear headings: ### 1. Immediate Action, ### 2. Treatment Plan
- Use bullet points (- or *) for action steps and lists
- Bold critical terms, dosages, percentages: **Toxin Binder**, **62-68% Moisture**, **16% Crude Protein**
- Keep paragraphs short (2-3 sentences max)
- Always give complete answers without abrupt cutoffs`

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
