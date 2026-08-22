import mongoose from 'mongoose'

const advisorySchema = new mongoose.Schema({
  testId: { type: mongoose.Schema.Types.Mixed },
  farmerId: { type: mongoose.Schema.Types.Mixed },
  messages: [{ type: String }],
  urgency: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  category: { type: String, default: 'Storage & Nutrition' }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

export default mongoose.model('Advisory', advisorySchema)
