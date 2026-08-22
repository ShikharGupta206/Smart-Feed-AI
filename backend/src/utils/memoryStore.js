import bcrypt from 'bcryptjs'

// Pre-seeded Demo Data for zero-config offline / development fallback
const defaultPasswordHash = bcrypt.hashSync('demo1234', 10)

const demoFarmer = {
  _id: '664f1a2b3c4d5e6f7a8b9c01',
  name: 'Farmer Raj',
  phone: '+91 98765 43210',
  location: 'Anand, Gujarat',
  passwordHash: defaultPasswordHash,
  language: 'en',
  farmSize: '15 Acres',
  cattleCount: 24,
  createdAt: new Date('2026-05-01T08:00:00Z'),
  updatedAt: new Date('2026-05-01T08:00:00Z')
}

const demoBatches = [
  {
    _id: '664f1a2b3c4d5e6f7a8b9b01',
    id: 'SILAGE-001',
    farmerId: demoFarmer._id,
    type: 'Silage',
    feedType: 'Maize Silage',
    storage: 'Covered Pit',
    status: 'Active',
    analysesCount: 4,
    averageScore: 87,
    notes: 'Spring harvest maize silage with heterofermentative inoculant.',
    createdAt: new Date('2026-05-20T09:00:00Z')
  },
  {
    _id: '664f1a2b3c4d5e6f7a8b9b02',
    id: 'SILAGE-002',
    farmerId: demoFarmer._id,
    type: 'Silage',
    feedType: 'Grass Silage',
    storage: 'Silo Bag',
    status: 'Active',
    analysesCount: 3,
    averageScore: 78,
    notes: 'Napier hybrid grass silage; chopped at 15mm.',
    createdAt: new Date('2026-05-19T11:30:00Z')
  },
  {
    _id: '664f1a2b3c4d5e6f7a8b9b03',
    id: 'FEED-001',
    farmerId: demoFarmer._id,
    type: 'Feed',
    feedType: 'Cattle Feed Pellet',
    storage: 'Shed Covered',
    status: 'Active',
    analysesCount: 2,
    averageScore: 82,
    notes: 'Commercial dairy compound feed 20% CP.',
    createdAt: new Date('2026-05-18T14:15:00Z')
  },
  {
    _id: '664f1a2b3c4d5e6f7a8b9b04',
    id: 'SILAGE-003',
    farmerId: demoFarmer._id,
    type: 'Silage',
    feedType: 'Maize Silage',
    storage: 'Open Air Stack',
    status: 'Warning',
    analysesCount: 5,
    averageScore: 44,
    notes: 'Rain exposure suspected during open trench feeding.',
    createdAt: new Date('2026-05-16T10:00:00Z')
  },
  {
    _id: '664f1a2b3c4d5e6f7a8b9b05',
    id: 'FEED-002',
    farmerId: demoFarmer._id,
    type: 'Feed',
    feedType: 'Dairy Concentrate',
    storage: 'Shed Covered',
    status: 'Active',
    analysesCount: 2,
    averageScore: 76,
    notes: 'Custom farm mix with cottonseed cake and wheat bran.',
    createdAt: new Date('2026-05-15T16:45:00Z')
  }
]

const demoTests = [
  {
    _id: '664f1a2b3c4d5e6f7a8b9t01',
    id: 'SF-2026-1256',
    farmerId: demoFarmer._id,
    batchId: 'SILAGE-001',
    sampleType: 'Silage',
    feedType: 'Maize Silage',
    storageDuration: 30,
    storageCondition: 'Covered Pit',
    imageName: 'maize_silage_sample_1.jpg',
    score: 87,
    overallStatus: 'Good',
    confidence: 94,
    aiModelUsed: 'gemini-3.6-flash',
    keyIndicators: [
      'Golden-olive color with uniform grain distribution',
      'Pleasant lactic acid aroma visual signature, no visible black mold',
      'Optimum moisture sheen and firm stem consolidation'
    ],
    parameters: {
      crude_protein: { value: 14.5, unit: '%', label: 'Crude Protein', status: 'Good' },
      moisture: { value: 62.0, unit: '%', label: 'Moisture', status: 'Good' },
      fiber: { value: 27.8, unit: '%', label: 'Fiber', status: 'Good' },
      energy_value: { value: 8.8, unit: 'MJ/kg', label: 'Energy Value', status: 'Good' },
      mineral_status: { value: 'Balanced', unit: '', label: 'Mineral Status', status: 'Good' },
      adulteration_flag: { value: 'Not detected', unit: '', label: 'Adulteration', status: 'Good' },
      aflatoxin_level: { value: 3.2, unit: 'ppb', label: 'Aflatoxin Level', status: 'Good' }
    },
    advisories: [
      'Silage shows excellent lactic fermentation and high energy density.',
      'Maintain feeding rate from pit face (15-20cm daily) to prevent secondary aerobic spoilage.'
    ],
    recommendations: 'Optimal for lactating cows producing >15L/day. Maintain regular mineral supplementation.',
    createdAt: new Date('2026-05-22T10:30:00Z')
  },
  {
    _id: '664f1a2b3c4d5e6f7a8b9t02',
    id: 'SF-2026-1255',
    farmerId: demoFarmer._id,
    batchId: 'FEED-001',
    sampleType: 'Feed',
    feedType: 'Cattle Feed Pellet',
    storageDuration: 10,
    storageCondition: 'Shed Covered',
    imageName: 'feed_pellets.jpg',
    score: 82,
    overallStatus: 'Good',
    confidence: 91,
    aiModelUsed: 'gemini-3.6-flash',
    keyIndicators: [
      'Consistent pellet durability with minimal dust fraction',
      'No clumping or fungal discoloration observed',
      'Normal dry concentrate texture'
    ],
    parameters: {
      crude_protein: { value: 18.2, unit: '%', label: 'Crude Protein', status: 'Good' },
      moisture: { value: 10.8, unit: '%', label: 'Moisture', status: 'Good' },
      fiber: { value: 12.5, unit: '%', label: 'Fiber', status: 'Good' },
      energy_value: { value: 10.2, unit: 'MJ/kg', label: 'Energy Value', status: 'Good' },
      mineral_status: { value: 'Balanced', unit: '', label: 'Mineral Status', status: 'Good' },
      adulteration_flag: { value: 'Not detected', unit: '', label: 'Adulteration', status: 'Good' },
      aflatoxin_level: { value: 5.0, unit: 'ppb', label: 'Aflatoxin Level', status: 'Good' }
    },
    advisories: [
      'Concentrate pellet quality is compliant with BIS Type-II specifications.',
      'Store on wooden pallets away from concrete walls to prevent bottom condensation.'
    ],
    recommendations: 'Feed 1kg concentrate per 2.5L of milk yield alongside good quality forage.',
    createdAt: new Date('2026-05-21T09:20:00Z')
  },
  {
    _id: '664f1a2b3c4d5e6f7a8b9t03',
    id: 'SF-2026-1254',
    farmerId: demoFarmer._id,
    batchId: 'SILAGE-002',
    sampleType: 'Silage',
    feedType: 'Grass Silage',
    storageDuration: 45,
    storageCondition: 'Silo Bag',
    imageName: 'grass_silage.jpg',
    score: 68,
    overallStatus: 'Warning',
    confidence: 89,
    aiModelUsed: 'gemini-3.6-flash',
    keyIndicators: [
      'Slight dark brownish discoloration near surface cut',
      'Elevated moisture content detected visually',
      'Chop length slightly uneven (20-30mm)'
    ],
    parameters: {
      crude_protein: { value: 11.2, unit: '%', label: 'Crude Protein', status: 'Warning' },
      moisture: { value: 69.5, unit: '%', label: 'Moisture', status: 'Warning' },
      fiber: { value: 34.0, unit: '%', label: 'Fiber', status: 'Warning' },
      energy_value: { value: 7.2, unit: 'MJ/kg', label: 'Energy Value', status: 'Warning' },
      mineral_status: { value: 'Balanced', unit: '', label: 'Mineral Status', status: 'Good' },
      adulteration_flag: { value: 'Not detected', unit: '', label: 'Adulteration', status: 'Good' },
      aflatoxin_level: { value: 8.5, unit: 'ppb', label: 'Aflatoxin Level', status: 'Good' }
    },
    advisories: [
      'Elevated moisture levels observed. Ensure rapid feeding to prevent aerobic spoilage.',
      'Supplement with energy concentrates (e.g. crushed maize or molasses) to balance fiber load.'
    ],
    recommendations: 'Monitor feed intake. Mix with dry fodder (wheat straw / dry hay) to balance ration moisture.',
    createdAt: new Date('2026-05-20T16:10:00Z')
  },
  {
    _id: '664f1a2b3c4d5e6f7a8b9t04',
    id: 'SF-2026-1253',
    farmerId: demoFarmer._id,
    batchId: 'SILAGE-003',
    sampleType: 'Silage',
    feedType: 'Maize Silage',
    storageDuration: 60,
    storageCondition: 'Open Air Stack',
    imageName: 'spoiled_silage.jpg',
    score: 44,
    overallStatus: 'Bad',
    confidence: 96,
    aiModelUsed: 'gemini-3.6-flash',
    keyIndicators: [
      'Visible white and dark mold patches on surface layers',
      'Significant heating and caramelization darkening',
      'High moisture condensation with degraded texture'
    ],
    parameters: {
      crude_protein: { value: 8.4, unit: '%', label: 'Crude Protein', status: 'Bad' },
      moisture: { value: 74.0, unit: '%', label: 'Moisture', status: 'Bad' },
      fiber: { value: 39.5, unit: '%', label: 'Fiber', status: 'Bad' },
      energy_value: { value: 5.8, unit: 'MJ/kg', label: 'Energy Value', status: 'Bad' },
      mineral_status: { value: 'Deficient', unit: '', label: 'Mineral Status', status: 'Warning' },
      adulteration_flag: { value: 'Not detected', unit: '', label: 'Adulteration', status: 'Good' },
      aflatoxin_level: { value: 24.5, unit: 'ppb', label: 'Aflatoxin Level', status: 'Bad' }
    },
    advisories: [
      'HIGH RISK: Discard spoiled and moldy layers immediately. Do NOT feed to pregnant or high-yielding cattle.',
      'Aflatoxin levels exceed safe permissible thresholds. Isolate batch and re-cover immediately.'
    ],
    recommendations: 'Quarantine spoiled feed. Use toxin binders in unaffected portions and test with laboratory assays.',
    createdAt: new Date('2026-05-19T14:15:00Z')
  },
  {
    _id: '664f1a2b3c4d5e6f7a8b9t05',
    id: 'SF-2026-1252',
    farmerId: demoFarmer._id,
    batchId: 'FEED-002',
    sampleType: 'Feed',
    feedType: 'Dairy Concentrate',
    storageDuration: 15,
    storageCondition: 'Shed Covered',
    imageName: 'dairy_mash.jpg',
    score: 76,
    overallStatus: 'Good',
    confidence: 88,
    aiModelUsed: 'gemini-3.6-flash',
    keyIndicators: [
      'Clean granular mash texture',
      'Adequate bran and cake fraction',
      'Low dust with good smell'
    ],
    parameters: {
      crude_protein: { value: 16.5, unit: '%', label: 'Crude Protein', status: 'Good' },
      moisture: { value: 11.2, unit: '%', label: 'Moisture', status: 'Good' },
      fiber: { value: 16.0, unit: '%', label: 'Fiber', status: 'Good' },
      energy_value: { value: 9.1, unit: 'MJ/kg', label: 'Energy Value', status: 'Good' },
      mineral_status: { value: 'Balanced', unit: '', label: 'Mineral Status', status: 'Good' },
      adulteration_flag: { value: 'Not detected', unit: '', label: 'Adulteration', status: 'Good' },
      aflatoxin_level: { value: 6.2, unit: 'ppb', label: 'Aflatoxin Level', status: 'Good' }
    },
    advisories: [
      'Good protein-to-energy ratio for medium lactation cows.',
      'Ensure regular mixing to prevent settling of fine mineral additives.'
    ],
    recommendations: 'Maintain recommended feeding regime (3-4 kg/day).',
    createdAt: new Date('2026-05-18T11:05:00Z')
  },
  {
    _id: '664f1a2b3c4d5e6f7a8b9t06',
    id: 'SF-2026-1251',
    farmerId: demoFarmer._id,
    batchId: 'SILAGE-001',
    sampleType: 'Silage',
    feedType: 'Maize Silage',
    storageDuration: 25,
    storageCondition: 'Covered Pit',
    imageName: 'maize_sample_early.jpg',
    score: 72,
    overallStatus: 'Warning',
    confidence: 90,
    aiModelUsed: 'gemini-3.6-flash',
    keyIndicators: [
      'Light olive color with good compaction',
      'Moisture slightly high at 67%',
      'No offensive butyric odor or visible mold'
    ],
    parameters: {
      crude_protein: { value: 12.8, unit: '%', label: 'Crude Protein', status: 'Good' },
      moisture: { value: 67.2, unit: '%', label: 'Moisture', status: 'Warning' },
      fiber: { value: 31.5, unit: '%', label: 'Fiber', status: 'Good' },
      energy_value: { value: 7.9, unit: 'MJ/kg', label: 'Energy Value', status: 'Warning' },
      mineral_status: { value: 'Balanced', unit: '', label: 'Mineral Status', status: 'Good' },
      adulteration_flag: { value: 'Not detected', unit: '', label: 'Adulteration', status: 'Good' },
      aflatoxin_level: { value: 4.8, unit: 'ppb', label: 'Aflatoxin Level', status: 'Good' }
    },
    advisories: [
      'Slightly high moisture content. Keep pit surface covered tightly between daily feedings.',
      'Blend with dry roughage during feeding.'
    ],
    recommendations: 'Safe for feeding. Continue monitoring daily pit face hygiene.',
    createdAt: new Date('2026-05-17T08:40:00Z')
  }
]

const demoReports = [
  {
    _id: '664f1a2b3c4d5e6f7a8b9r01',
    id: 'RPT-2026-032',
    farmerId: demoFarmer._id,
    type: 'Sample Report',
    ref: 'SF-2026-1256',
    refType: 'TestResult',
    title: 'Maize Silage Quality Certificate - SF-2026-1256',
    summary: 'Screening shows high quality maize silage (Score 87/100) with safe moisture and protein levels.',
    keyFindings: [
      'Score: 87/100 (Good)',
      'Crude Protein: 14.5%',
      'Moisture: 62.0%',
      'Aflatoxin: 3.2 ppb (Safe)'
    ],
    date: '22 May 2026, 10:30 AM',
    createdAt: new Date('2026-05-22T10:35:00Z')
  },
  {
    _id: '664f1a2b3c4d5e6f7a8b9r02',
    id: 'RPT-2026-031',
    farmerId: demoFarmer._id,
    type: 'Batch Report',
    ref: 'SILAGE-001',
    refType: 'Batch',
    title: 'Batch Consolidated Summary - SILAGE-001',
    summary: 'Consolidated report for 4 sample analyses of SILAGE-001. Average quality score 87/100.',
    keyFindings: [
      'Batch: SILAGE-001 (Maize Silage)',
      '4 Tests conducted over 14 days',
      'Average Score: 87/100',
      'Status: Fully compliant'
    ],
    date: '21 May 2026, 09:00 AM',
    createdAt: new Date('2026-05-21T09:05:00Z')
  },
  {
    _id: '664f1a2b3c4d5e6f7a8b9r03',
    id: 'RPT-2026-030',
    farmerId: demoFarmer._id,
    type: 'Sample Report',
    ref: 'SF-2026-1254',
    refType: 'TestResult',
    title: 'Grass Silage Diagnostic Screening - SF-2026-1254',
    summary: 'Diagnostic report flagging elevated moisture (69.5%) and moderate fiber content (Score 68/100).',
    keyFindings: [
      'Score: 68/100 (Caution)',
      'High Moisture Alert: 69.5%',
      'Crude Protein: 11.2%'
    ],
    date: '20 May 2026, 04:20 PM',
    createdAt: new Date('2026-05-20T16:25:00Z')
  }
]

export const memoryStore = {
  farmers: [demoFarmer],
  batches: [...demoBatches],
  tests: [...demoTests],
  reports: [...demoReports],
  advisories: []
}
