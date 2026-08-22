import mongoose from 'mongoose'

const farmerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, unique: true, trim: true },
  location: { type: String, required: true, trim: true },
  passwordHash: { type: String, required: true },
  language: { type: String, enum: ['en', 'hi', 'English', 'Hindi'], default: 'en' },
  farmSize: { type: String, default: '10 Acres' },
  cattleCount: { type: Number, default: 12 },
  avatar: { type: String, default: '' }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

export default mongoose.model('Farmer', farmerSchema)
