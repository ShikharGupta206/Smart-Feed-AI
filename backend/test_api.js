async function runTests() {
  const BASE_URL = 'http://localhost:8000'
  console.log('🚀 Running Complete SmartFeed AI Audit & Verification Suite...\n')

  let passed = 0
  let failed = 0

  async function test(name, fn) {
    try {
      process.stdout.write(`• ${name}... `)
      await fn()
      console.log('✅ PASSED')
      passed++
    } catch (err) {
      console.log(`❌ FAILED: ${err.message}`)
      failed++
    }
  }

  let authToken = null
  let testSampleId = null

  // 1. Health Check & MongoDB status
  await test('GET /api/health (DB & Gemini status)', async () => {
    const res = await fetch(`${BASE_URL}/api/health`)
    const data = await res.json()
    if (data.status !== 'ok') throw new Error('Status not ok')
    console.log(`(Database: ${data.database}, Gemini Active: ${data.geminiKeyConfigured})`)
  })

  // 2. Auth: Login & JWT verification
  await test('POST /api/auth/login (JWT & DB user)', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '+91 98765 43210', password: 'demo1234' })
    })
    const data = await res.json()
    if (!data.token || !data.farmer) throw new Error('Token or farmer missing in response')
    authToken = data.token
    console.log(`(Logged in as: ${data.farmer.name})`)
  })

  // 3. AI Assistant Chat with MongoDB Context (English)
  await test('POST /api/assistant/chat (Gemini AI Agronomist in English)', async () => {
    const res = await fetch(`${BASE_URL}/api/assistant/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        message: 'How is my recent maize silage quality and what should I feed my lactating cows?'
      })
    })
    const data = await res.json()
    if (!data.text) throw new Error('No AI response text returned')
    console.log(`\n    🤖 Gemini Response snippet: "${data.text.slice(0, 110)}..."`)
  })

  // 4. AI Assistant Chat (Hindi Support)
  await test('POST /api/assistant/chat (Gemini AI in Hindi)', async () => {
    const res = await fetch(`${BASE_URL}/api/assistant/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        message: 'नमस्ते, क्या साइलेज में फफूंद दिखने पर चारे में टॉक्सिन बाइंडर मिलाना चाहिए?'
      })
    })
    const data = await res.json()
    if (!data.text) throw new Error('No AI response text returned')
    console.log(`\n    🇮🇳 Gemini Hindi snippet: "${data.text.slice(0, 110)}..."`)
  })

  // 5. Image upload → Quality Score & Full Audit Fields
  await test('POST /api/tests (Gemini Vision + Heatmap + Radar + Cost of Poor Quality)', async () => {
    const dummyImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
    const res = await fetch(`${BASE_URL}/api/tests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        image: dummyImage,
        imageName: 'test_sample_silage.jpg',
        sampleType: 'Silage',
        feedType: 'Maize Silage',
        storageDuration: 30,
        storageCondition: 'Covered Pit',
        notes: 'Full audit verification test'
      })
    })
    const data = await res.json()
    if (!data.id && !data._id) throw new Error('Test ID missing')
    if (typeof data.score !== 'number') throw new Error('Score missing or invalid')
    if (!data.confidenceInterval) throw new Error('confidenceInterval missing')
    if (!data.mycotoxinRiskRadar) throw new Error('mycotoxinRiskRadar missing')
    if (!data.costOfPoorQuality) throw new Error('costOfPoorQuality missing')
    if (!data.disclaimer) throw new Error('disclaimer missing')
    testSampleId = data.id || data._id
    console.log(`(Score: ${data.score}, Conf Range: ${data.confidenceInterval.min}-${data.confidenceInterval.max}, Radar Tier: ${data.mycotoxinRiskRadar.overallRiskTier})`)
  })

  // 6. Silage Coaching Checklist & Photo Verification
  await test('GET & PUT /api/silage-coach (5-stage checklist & persistence)', async () => {
    const getRes = await fetch(`${BASE_URL}/api/silage-coach?batchId=SILAGE-001`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    })
    const getData = await getRes.json()
    if (!getData.stages || getData.stages.length !== 5) throw new Error('Stages count invalid')

    // Update Stage 1
    const putRes = await fetch(`${BASE_URL}/api/silage-coach/stage/1`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        batchId: 'SILAGE-001',
        completed: true,
        checkedItems: [getData.stages[0].checklist[0]]
      })
    })
    const putData = await putRes.json()
    if (putData.stageNumber !== 1 || !putData.completed) throw new Error('Stage update failed')
  })

  // 7. Batches & Milk Yield Logging Correlation
  await test('POST & GET /api/batches/:id/milk-logs (Milk yield log & correlation)', async () => {
    const postRes = await fetch(`${BASE_URL}/api/batches/SILAGE-001/milk-logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        yieldLitersPerCow: 18.5,
        herdSize: 15,
        notes: 'Testing correlation with feed quality'
      })
    })
    const postData = await postRes.json()
    if (!postData.yieldLitersPerCow) throw new Error('Milk log save failed')

    const getRes = await fetch(`${BASE_URL}/api/batches/SILAGE-001/milk-logs`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    })
    const getData = await getRes.json()
    if (!Array.isArray(getData) || getData.length === 0) throw new Error('Milk logs fetch failed')
  })

  // 8. History & Analytics Endpoints
  await test('GET /api/history & /api/analytics', async () => {
    const [testsRes, anaRes] = await Promise.all([
      fetch(`${BASE_URL}/api/tests`, { headers: { 'Authorization': `Bearer ${authToken}` } }),
      fetch(`${BASE_URL}/api/analytics`, { headers: { 'Authorization': `Bearer ${authToken}` } })
    ])
    const tests = await testsRes.json()
    const ana = await anaRes.json()
    if (!Array.isArray(tests) || tests.length === 0) throw new Error('Tests missing')
    if (typeof ana.averageScore !== 'number') throw new Error('Analytics invalid')
    console.log(`(Total Tests: ${tests.length}, Avg Score: ${ana.averageScore})`)
  })

  // 9. QR Traceability
  await test(`GET /api/qr/${testSampleId}`, async () => {
    const res = await fetch(`${BASE_URL}/api/qr/${testSampleId}`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    })
    const data = await res.json()
    if (!data.imageDataUrl || !data.imageDataUrl.startsWith('data:image/png')) {
      throw new Error('QR data url invalid')
    }
  })

  console.log(`\n=========================================`)
  console.log(` AUDIT SUITE COMPLETED: ${passed} Passed, ${failed} Failed`)
  console.log(`=========================================\n`)
}

runTests()
