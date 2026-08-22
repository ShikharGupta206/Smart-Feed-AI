import mongoose from 'mongoose'

let isConnected = false

export async function connectDB() {
  const uri = process.env.MONGODB_URI || ''
  if (!uri) {
    console.log('[DB] No MONGODB_URI configured. Running in Memory Demo mode.')
    return false
  }

  try {
    mongoose.set('strictQuery', true)
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
      connectTimeoutMS: 2000
    })
    isConnected = true
    console.log('[DB] Connected to MongoDB successfully:', uri.replace(/\/\/.*@/, '//***@'))
    return true
  } catch (err) {
    isConnected = false
    console.warn(`[DB] MongoDB connection failed (${err.message}). Falling back to In-Memory mode.`)
    return false
  }
}

mongoose.connection.on('connected', () => {
  isConnected = true
})

mongoose.connection.on('disconnected', () => {
  isConnected = false
})

mongoose.connection.on('error', (err) => {
  isConnected = false
  console.warn('[DB] MongoDB error event:', err.message)
})

export function isDbConnected() {
  return isConnected && mongoose.connection.readyState === 1
}
