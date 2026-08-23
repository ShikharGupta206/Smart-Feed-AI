import mongoose from 'mongoose'

const parameterSchema = new mongoose.Schema({
  value: { type: mongoose.Schema.Types.Mixed, required: true },
  unit: { type: String, default: '' },
  status: { type: String, enum: ['Good', 'Warning', 'Bad'], default: 'Good' },
  label: { type: String, required: true },
  optimalRange: { type: String, default: '' }
}, { _id: false })

const heatmapRegionSchema = new mongoose.Schema({
  x: { type: Number, required: true }, // percentage 0-100
  y: { type: Number, required: true }, // percentage 0-100
  radius: { type: Number, default: 20 },
  impact: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
  label: { type: String, default: 'Analyzed Region' }
}, { _id: false })

const testResultSchema = new mongoose.Schema({
  id: { type: String, required: true, trim: true },
  farmerId: { type: mongoose.Schema.Types.Mixed, required: true },
  batchId: { type: String, default: 'SILAGE-001' },
  sampleType: { type: String, enum: ['Feed', 'Silage'], default: 'Silage', required: true },
  feedType: { type: String, default: 'Maize Silage' },
  storageDuration: { type: Number, default: 0 },
  storageCondition: { type: String, default: 'Covered Pit' },
  notes: { type: String, default: '' },
  tempC: { type: Number, default: 32 },
  humidityPct: { type: Number, default: 65 },
  smell: { type: String, default: 'Neutral' },
  analyzedOn: { type: String, default: '' },
  imageName: { type: String, default: 'sample.jpg' },
  image: { type: String }, // Base64 data URL or storage URI
  score: { type: Number, default: 80, min: 0, max: 100 },
  confidence: { type: Number, default: 92 },
  confidenceInterval: {
    min: { type: Number, default: 88 },
    max: { type: Number, default: 96 }
  },
  aiExplanation: { type: String, default: '' },
  heatmapRegions: [heatmapRegionSchema],
  mycotoxinRiskRadar: {
    overallRiskTier: { type: String, enum: ['Low Risk', 'Moderate Risk', 'High Risk', 'Critical Danger'], default: 'Low Risk' },
    aflatoxinRiskScore: { type: Number, default: 15 },
    vomitoxinRiskScore: { type: Number, default: 10 },
    zearalenoneRiskScore: { type: Number, default: 12 },
    t2ToxinRiskScore: { type: Number, default: 8 },
    calculatedFactors: {
      moldPercentage: { type: Number, default: 1.2 },
      storageDurationDays: { type: Number, default: 20 },
      ambientTempC: { type: Number, default: 32 },
      relativeHumidityPct: { type: Number, default: 65 },
      cropVulnerability: { type: String, default: 'High' }
    }
  },
  costOfPoorQuality: {
    dailyLossInr: { type: Number, default: 0 },
    milkDropLitersPerCow: { type: Number, default: 0 },
    vetCostRiskInr: { type: Number, default: 0 },
    estimatedSpoilagePct: { type: Number, default: 0 }
  },
  overallStatus: { type: String, enum: ['Good', 'Warning', 'Bad'], default: 'Good', required: true },
  aiModelUsed: { type: String, default: 'gemini-3.5-flash' },
  parameters: { type: Map, of: parameterSchema, required: true },
  keyIndicators: [{ type: String }],
  advisories: [{ type: String }],
  recommendations: { type: String, default: '' },
  disclaimer: { type: String, default: 'Screening estimate for management decision support. Not a regulatory laboratory assay.' }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

export default mongoose.model('TestResult', testResultSchema)
