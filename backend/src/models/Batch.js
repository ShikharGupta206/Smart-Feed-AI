import mongoose from 'mongoose'

const batchSchema = new mongoose.Schema({
  id: { type: String, required: true, trim: true },
  farmerId: { type: mongoose.Schema.Types.Mixed, required: true },
  type: { type: String, enum: ['Silage', 'Feed'], required: true },
  feedType: { type: String, required: true },
  storage: { type: String, default: 'Covered' },
  status: { type: String, enum: ['Active', 'Warning', 'Archived', 'Completed'], default: 'Active' },
  analysesCount: { type: Number, default: 0 },
  averageScore: { type: Number, default: 80 },
  notes: { type: String, default: '' }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

export default mongoose.model('Batch', batchSchema)
