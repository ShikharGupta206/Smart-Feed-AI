import mongoose from 'mongoose'

const reportSchema = new mongoose.Schema({
  id: { type: String, required: true, trim: true },
  farmerId: { type: mongoose.Schema.Types.Mixed, required: true },
  type: { type: String, enum: ['Sample Report', 'Batch Report', 'Audit Certificate'], default: 'Sample Report' },
  ref: { type: String, required: true },
  refType: { type: String, enum: ['TestResult', 'Batch'], default: 'TestResult' },
  title: { type: String, required: true },
  summary: { type: String, required: true },
  keyFindings: [{ type: String }],
  date: { type: String },
  metrics: { type: mongoose.Schema.Types.Mixed }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

export default mongoose.model('Report', reportSchema)
