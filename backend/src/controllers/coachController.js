import mongoose from 'mongoose'
import SilageCoachStep from '../models/SilageCoachStep.js'
import { isDbConnected } from '../config/db.js'
import { memoryStore } from '../utils/memoryStore.js'

const DEFAULT_STAGES = [
  {
    stageNumber: 1,
    stageKey: 'harvesting',
    title: 'Stage 1: Harvest Timing & Dry Matter',
    desc: 'Harvest maize at 1/2 to 2/3 milk-line stage (32-35% Dry Matter).',
    checklist: [
      'Check kernel milk line (50-65% starch maturity)',
      'Perform grab/squeeze moisture test in field',
      'Ensure harvest during dry weather (no rain surface water)'
    ]
  },
  {
    stageNumber: 2,
    stageKey: 'chopping',
    title: 'Stage 2: Precision Chop Length',
    desc: 'Chop forage uniformly to 15-20mm with 100% grain cracking.',
    checklist: [
      'Set chopper knife clearance for 15-19 mm theoretical length',
      'Verify 95%+ maize kernels are fractured/crushed',
      'Inspect chop sample for uniformity (no long unchopped leaves)'
    ]
  },
  {
    stageNumber: 3,
    stageKey: 'inoculation',
    title: 'Stage 3: Biological Inoculant Application',
    desc: 'Apply proven lactic acid bacteria (L. plantarum / L. buchneri) for fast pH drop.',
    checklist: [
      'Dissolve certified silage inoculant in non-chlorinated water',
      'Spray evenly at forage chopper or pit intake (1-2 g/ton)',
      'Ensure ambient solution temperature below 35°C'
    ]
  },
  {
    stageNumber: 4,
    stageKey: 'compaction',
    title: 'Stage 4: Heavy Tractor Packing',
    desc: 'Pack layers in 15cm thin lifts using heavy tractor to expel all oxygen.',
    checklist: [
      'Spread chopped crop in thin progressive layers (max 15cm)',
      'Apply tractor compaction (minimum 400 kg packing weight per ton/hr)',
      'Aim for minimum silage packing density of 225 kg DM/m³'
    ]
  },
  {
    stageNumber: 5,
    stageKey: 'sealing',
    title: 'Stage 5: Hermetic Double-Layer Sealing',
    desc: 'Seal immediately with oxygen barrier film and UV-resistant black tarp.',
    checklist: [
      'Place transparent oxygen-barrier underlay film immediately upon completion',
      'Cover with UV-treated 200-micron thick black silage sheet',
      'Weigh down edge-to-edge with tires, sandbags, or gravel bags',
      'Dig trench ditch around pit perimeter to divert rain runoff'
    ]
  }
]

if (!memoryStore.silageCoachSteps) {
  memoryStore.silageCoachSteps = DEFAULT_STAGES.map(s => ({
    farmerId: '664f1a2b3c4d5e6f7a8b9c01',
    batchId: 'SILAGE-001',
    stageNumber: s.stageNumber,
    stageKey: s.stageKey,
    title: s.title,
    completed: false,
    checkedItems: [],
    notes: '',
    photoUrl: ''
  }))
}

export async function getCoachSteps(req, res, next) {
  try {
    const farmerId = req.farmerId
    const batchId = req.query.batchId || 'SILAGE-001'

    if (isDbConnected()) {
      let steps = await SilageCoachStep.find({ farmerId, batchId }).sort({ stageNumber: 1 })
      
      // Seed if not yet created for this batch
      if (!steps || steps.length === 0) {
        const toInsert = DEFAULT_STAGES.map(s => ({
          farmerId,
          batchId,
          stageNumber: s.stageNumber,
          stageKey: s.stageKey,
          title: s.title,
          completed: false,
          checkedItems: [],
          notes: '',
          photoUrl: ''
        }))
        steps = await SilageCoachStep.insertMany(toInsert)
      }

      return res.json({ stages: DEFAULT_STAGES, steps })
    } else {
      let steps = memoryStore.silageCoachSteps.filter(s => s.batchId === batchId)
      if (!steps || steps.length === 0) {
        steps = DEFAULT_STAGES.map(s => ({
          farmerId,
          batchId,
          stageNumber: s.stageNumber,
          stageKey: s.stageKey,
          title: s.title,
          completed: false,
          checkedItems: [],
          notes: '',
          photoUrl: ''
        }))
        memoryStore.silageCoachSteps.push(...steps)
      }
      return res.json({ stages: DEFAULT_STAGES, steps })
    }
  } catch (err) {
    next(err)
  }
}

export async function updateCoachStep(req, res, next) {
  try {
    const farmerId = req.farmerId
    const stageNumber = Number(req.params.stageNumber)
    const { batchId = 'SILAGE-001', completed, checkedItems = [], notes = '', photoUrl = '' } = req.body

    if (isDbConnected()) {
      const step = await SilageCoachStep.findOneAndUpdate(
        { farmerId, batchId, stageNumber },
        {
          $set: {
            completed: Boolean(completed),
            checkedItems,
            notes,
            ...(photoUrl && { photoUrl }),
            completedAt: completed ? new Date() : null
          }
        },
        { new: true, upsert: true }
      )
      return res.json(step)
    } else {
      let step = memoryStore.silageCoachSteps.find(s => s.batchId === batchId && s.stageNumber === stageNumber)
      if (step) {
        step.completed = Boolean(completed)
        step.checkedItems = checkedItems
        step.notes = notes
        if (photoUrl) step.photoUrl = photoUrl
        step.updatedAt = new Date()
      } else {
        step = {
          farmerId,
          batchId,
          stageNumber,
          completed: Boolean(completed),
          checkedItems,
          notes,
          photoUrl,
          updatedAt: new Date()
        }
        memoryStore.silageCoachSteps.push(step)
      }
      return res.json(step)
    }
  } catch (err) {
    next(err)
  }
}
