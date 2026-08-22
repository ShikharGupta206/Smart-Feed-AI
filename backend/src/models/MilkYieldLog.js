import mongoose from 'mongoose'

const milkYieldLogSchema = new mongoose.Schema({
  farmerId: { type: mongoose.Schema.Types.Mixed, required: true },
  batchId: { type: String, required: true },
  date: { type: Date, default: Date.now },
  yieldLitersPerCow: { type: Number, required: true },
  herdSize: { type: Number, default: 10 },
  totalDailyYieldLiters: { type: Number },
  feedQualityScoreAtLog: { type: Number },
  fatPercentage: { type: Number, default: 4.2 },
  snfPercentage: { type: Number, default: 8.5 },
  notes: { type: String, default: '' }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

export default mongoose.model('MilkYieldLog', milkYieldLogSchema)
