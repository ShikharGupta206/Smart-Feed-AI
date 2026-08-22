import mongoose from 'mongoose'

const advisorySchema = new mongoose.Schema({
  testId: { type: mongoose.Schema.Types.ObjectId, ref: 'TestResult' },
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer' },
  messages: [String],
  createdAt: { type: Date, default: Date.now }
})

export default mongoose.model('Advisory', advisorySchema)
