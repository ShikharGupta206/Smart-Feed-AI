import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import QRCode from 'qrcode'
import mongoose from 'mongoose'
import Farmer from './models/Farmer.js'
import TestResult from './models/TestResult.js'
import Advisory from './models/Advisory.js'

const app = express()
const port = Number(process.env.PORT || 8000)
const jwtSecret = process.env.JWT_SECRET || 'smartfeed-development-secret'
const memory = { farmers: [], tests: [], advisories: [] }
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }))
app.use(express.json())

const id = () => new mongoose.Types.ObjectId().toString()
const tokenFor = farmer => jwt.sign({ farmerId: farmer._id || farmer.id, name: farmer.name }, jwtSecret, { expiresIn: '7d' })
const mockParameters = input => {
  const protein = Number(input.crude_protein ?? 14)
  const moisture = Number(input.moisture ?? 58)
  const fiber = Number(input.fiber ?? 28)
  const energy = Number(input.energy_value ?? 8.5)
  const mineral = input.mineral_status || 'Balanced'
  const adulteration = Boolean(input.adulteration_flag)
  const aflatoxin = Number(input.aflatoxin_level ?? 4)
  const status = (good, warning) => good ? 'Good' : warning ? 'Warning' : 'Bad'
  return {
    crude_protein: { value: protein, unit: '%', label: 'Crude Protein', status: status(protein >= 12, protein >= 9) },
    moisture: { value: moisture, unit: '%', label: 'Moisture', status: status(moisture <= 60, moisture <= 68) },
    fiber: { value: fiber, unit: '%', label: 'Fiber', status: status(fiber <= 32, fiber <= 38) },
    energy_value: { value: energy, unit: 'MJ/kg', label: 'Energy Value', status: status(energy >= 8, energy >= 6.5) },
    mineral_status: { value: mineral, unit: '', label: 'Mineral Status', status: mineral === 'Balanced' ? 'Good' : 'Warning' },
    adulteration_flag: { value: adulteration ? 'Detected' : 'Not detected', unit: '', label: 'Adulteration', status: adulteration ? 'Bad' : 'Good' },
    aflatoxin_level: { value: aflatoxin, unit: 'ppb', label: 'Aflatoxin Level', status: status(aflatoxin <= 10, aflatoxin <= 20) }
  }
}
const advisoryFor = params => { const p = params instanceof Map ? Object.fromEntries(params) : params; const messages = []; if (Number(p.moisture?.value ?? p.moisture) > 60) messages.push('Reduce silage moisture before storage and improve aeration.'); if (Number(p.crude_protein?.value ?? p.crude_protein) < 12) messages.push('Protein appears deficient; review the ration with a qualified nutritionist.'); if (Number(p.aflatoxin_level?.value ?? p.aflatoxin_level) > 10) messages.push('Do not feed without confirmatory laboratory testing.'); if (p.adulteration_flag?.value === 'Detected' || p.adulteration_flag === true) messages.push('Adulteration flag detected; isolate the sample for verification.'); return messages.length ? messages : ['Parameters are within the mock screening range. Continue good storage and feeding practices.'] }
const auth = async (req, res, next) => { try { const payload = jwt.verify((req.headers.authorization || '').replace('Bearer ', ''), jwtSecret); req.farmerId = payload.farmerId; next() } catch { res.status(401).json({ error: 'Valid login required' }) } }

app.get('/api/health', (_, res) => res.json({ status: 'ok', stack: 'MERN', database: mongoose.connection.readyState === 1 ? 'mongodb' : 'memory-demo' }))
app.post('/api/auth/signup', async (req, res) => { const { name, phone, location, password } = req.body; if (!name || !phone || !location || !password) return res.status(400).json({ error: 'Name, phone, location and password are required' }); const exists = memory.farmers.find(f => f.phone === phone); if (exists) return res.status(409).json({ error: 'Phone already registered' }); const farmer = { _id: id(), name, phone, location, passwordHash: await bcrypt.hash(password, 10), language: 'en' }; if (mongoose.connection.readyState === 1) await Farmer.create(farmer); else memory.farmers.push(farmer); res.status(201).json({ farmer: { name, phone, location }, token: tokenFor(farmer) }) })
app.post('/api/auth/login', async (req, res) => { const { phone, password } = req.body; const farmer = mongoose.connection.readyState === 1 ? await Farmer.findOne({ phone }) : memory.farmers.find(f => f.phone === phone); if (!farmer || !(await bcrypt.compare(password || '', farmer.passwordHash))) return res.status(401).json({ error: 'Invalid phone or password' }); res.json({ farmer: { name: farmer.name, phone: farmer.phone, location: farmer.location }, token: tokenFor(farmer) }) })
app.post(['/api/tests', '/api/tests/demo'], auth, async (req, res) => { const result = { _id: id(), farmerId: req.farmerId, sampleType: req.body.sampleType || 'Silage', imageName: req.body.imageName, parameters: mockParameters(req.body), overallStatus: 'Good', createdAt: new Date() }; const statuses = Object.values(result.parameters).map(x => x.status); result.overallStatus = statuses.includes('Bad') ? 'Bad' : statuses.includes('Warning') ? 'Warning' : 'Good'; if (mongoose.connection.readyState === 1) { const saved = await TestResult.create(result); return res.status(201).json(saved) } memory.tests.unshift(result); res.status(201).json(result) })
app.get('/api/tests/:farmerId', auth, async (req, res) => { if (req.params.farmerId !== req.farmerId) return res.status(403).json({ error: 'Not allowed' }); const tests = mongoose.connection.readyState === 1 ? await TestResult.find({ farmerId: req.farmerId }).sort({ createdAt: -1 }) : memory.tests.filter(t => t.farmerId === req.farmerId); res.json(tests) })
app.get('/api/tests/:testId/detail', auth, async (req, res) => { const test = mongoose.connection.readyState === 1 ? await TestResult.findById(req.params.testId) : memory.tests.find(t => t._id === req.params.testId); if (!test || String(test.farmerId) !== req.farmerId) return res.status(404).json({ error: 'Test not found' }); res.json(test) })
app.post('/api/advisory', auth, async (req, res) => { const messages = advisoryFor(req.body.parameters || req.body); const record = { _id: id(), farmerId: req.farmerId, testId: req.body.testId, messages }; if (mongoose.connection.readyState === 1) await Advisory.create(record); else memory.advisories.push(record); res.json({ messages }) })
app.get('/api/qr/:testId', auth, async (req, res) => { const payload = JSON.stringify({ testId: req.params.testId, trace: 'SmartFeed AI', issued: new Date().toISOString() }); res.json({ testId: req.params.testId, data: payload, imageDataUrl: await QRCode.toDataURL(payload) }) })

mongoose.connect(process.env.MONGODB_URI || '', { serverSelectionTimeoutMS: 1500 }).catch(() => console.log('MongoDB unavailable; using memory demo mode'))
app.listen(port, () => console.log(`SmartFeed backend listening on ${port}`))

