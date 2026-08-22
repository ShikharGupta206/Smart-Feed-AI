import mongoose from 'mongoose'

const parameterSchema = new mongoose.Schema({
  value: mongoose.Schema.Types.Mixed,
  unit: String,
  status: { type: String, enum: ['Good', 'Warning', 'Bad'] },
  label: String
}, { _id: false })

const testResultSchema = new mongoose.Schema({
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer', required: true },
  sampleType: { type: String, enum: ['Feed', 'Silage'], required: true },
  imageName: String,
  parameters: { type: Map, of: parameterSchema, required: true },
  overallStatus: { type: String, enum: ['Good', 'Warning', 'Bad'], required: true },
  createdAt: { type: Date, default: Date.now }
})

export default mongoose.model('TestResult', testResultSchema)
