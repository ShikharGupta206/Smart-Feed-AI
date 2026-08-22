import mongoose from 'mongoose'

const farmerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, unique: true, trim: true },
  location: { type: String, required: true, trim: true },
  passwordHash: { type: String, required: true },
  language: { type: String, enum: ['en', 'hi'], default: 'en' }
}, { timestamps: true })

export default mongoose.model('Farmer', farmerSchema)
