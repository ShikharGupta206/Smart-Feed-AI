/**
 * System constants, parameter definitions, risk thresholds, and prompt templates.
 */

export const PARAMETER_DEFINITIONS = {
  crude_protein: {
    label: 'Crude Protein',
    unit: '%',
    minGood: 12.0,
    minWarning: 9.0,
    optimalRange: '12% - 18%',
    description: 'Essential for milk production and muscle development in dairy cattle.'
  },
  moisture: {
    label: 'Moisture',
    unit: '%',
    maxGood: 65.0,
    maxWarning: 72.0,
    optimalRange: '55% - 68%',
    description: 'Crucial for silage fermentation. High moisture (>70%) leads to clostridial spoilage.'
  },
  fiber: {
    label: 'Fiber',
    unit: '%',
    maxGood: 32.0,
    maxWarning: 38.0,
    optimalRange: '24% - 32%',
    description: 'Neutral Detergent Fiber (NDF). Excessive fiber lowers digestibility and energy intake.'
  },
  energy_value: {
    label: 'Energy Value',
    unit: 'MJ/kg',
    minGood: 8.0,
    minWarning: 6.5,
    optimalRange: '8.0 - 11.0 MJ/kg',
    description: 'Metabolizable energy available for dairy cattle maintenance and lactation.'
  },
  mineral_status: {
    label: 'Mineral Status',
    unit: '',
    goodValues: ['Balanced', 'Adequate', 'Optimal'],
    optimalRange: 'Balanced',
    description: 'Balance of Calcium, Phosphorus, Magnesium, and essential micro-minerals.'
  },
  adulteration_flag: {
    label: 'Adulteration',
    unit: '',
    goodValues: ['Not detected', 'None', 'Negative'],
    optimalRange: 'Not detected',
    description: 'Presence of urea over-dosing, sand, sawdust, or foreign fillers.'
  },
  aflatoxin_level: {
    label: 'Aflatoxin Level',
    unit: 'ppb',
    maxGood: 10.0,
    maxWarning: 20.0,
    optimalRange: '< 10 ppb',
    description: 'Mycotoxin produced by Aspergillus molds. Dangerous above 20 ppb (FSSAI/BIS limits).'
  }
}

export const RISK_LEVELS = {
  GOOD: 'Good',
  WARNING: 'Warning',
  BAD: 'Bad'
}

export const SAMPLE_TYPES = ['Silage', 'Feed']

export const FEED_TYPES = [
  'Maize Silage',
  'Sorghum Silage',
  'Grass Silage',
  'Cattle Feed Pellet',
  'Dairy Concentrate',
  'Wheat Bran Blend',
  'TMR (Total Mixed Ration)'
]

export const STORAGE_CONDITIONS = [
  'Covered Pit',
  'Silo Bag',
  'Bunker Silo',
  'Shed Covered',
  'Open Air Stack'
]
