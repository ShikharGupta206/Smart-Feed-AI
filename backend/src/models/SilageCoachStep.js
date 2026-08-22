import mongoose from 'mongoose'

const silageCoachStepSchema = new mongoose.Schema({
  farmerId: { type: mongoose.Schema.Types.Mixed, required: true },
  batchId: { type: String, default: 'SILAGE-001' },
  stageNumber: { type: Number, required: true },
  stageKey: { type: String, required: true }, // 'harvesting', 'chopping', 'inoculation', 'compaction', 'sealing'
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
  checkedItems: [{ type: String }],
  notes: { type: String, default: '' },
  photoUrl: { type: String, default: '' }, // base64 or photo URL
  verifiedScore: { type: Number, default: 0 },
  completedAt: { type: Date }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

export default mongoose.model('SilageCoachStep', silageCoachStepSchema)
