/**
 * Agricultural calculation engine for nutritional parameters, mycotoxin risk radar,
 * and cost-of-poor-quality estimations.
 */

export function calculateMockParameters(input = {}) {
  const isSilage = (input.sampleType || 'Silage').toLowerCase().includes('silage')
  const protein = Number(input.crude_protein ?? (isSilage ? 14.2 : 18.5))
  const moisture = Number(input.moisture ?? (isSilage ? 62.0 : 11.2))
  const fiber = Number(input.fiber ?? (isSilage ? 27.5 : 13.5))
  const energy = Number(input.energy_value ?? (isSilage ? 8.6 : 10.5))
  const mineral = input.mineral_status || 'Balanced'
  const adulteration = input.adulteration_flag === true || input.adulteration_flag === 'Detected'
  const aflatoxin = Number(input.aflatoxin_level ?? 3.5)

  const status = (good, warning) => good ? 'Good' : warning ? 'Warning' : 'Bad'

  const moistureGood = isSilage ? (moisture <= 65) : (moisture <= 12)
  const moistureWarn = isSilage ? (moisture <= 72) : (moisture <= 14.5)

  return {
    crude_protein: {
      value: Math.round(protein * 10) / 10,
      unit: '%',
      label: 'Crude Protein',
      status: status(protein >= 12, protein >= 9.5),
      optimalRange: isSilage ? '12% - 18%' : '18% - 22%'
    },
    moisture: {
      value: Math.round(moisture * 10) / 10,
      unit: '%',
      label: 'Moisture',
      status: status(moistureGood, moistureWarn),
      optimalRange: isSilage ? '55% - 68%' : '9% - 12%'
    },
    fiber: {
      value: Math.round(fiber * 10) / 10,
      unit: '%',
      label: 'Fiber',
      status: status(fiber <= 32, fiber <= 38),
      optimalRange: isSilage ? '24% - 32%' : '10% - 16%'
    },
    energy_value: {
      value: Math.round(energy * 10) / 10,
      unit: 'MJ/kg',
      label: 'Energy Value',
      status: status(energy >= 8.0, energy >= 6.5),
      optimalRange: isSilage ? '8.0 - 10.5 MJ/kg' : '10.0 - 12.5 MJ/kg'
    },
    mineral_status: {
      value: mineral,
      unit: '',
      label: 'Mineral Status',
      status: mineral === 'Balanced' ? 'Good' : 'Warning',
      optimalRange: 'Balanced'
    },
    adulteration_flag: {
      value: adulteration ? 'Detected' : 'Not detected',
      unit: '',
      label: 'Adulteration',
      status: adulteration ? 'Bad' : 'Good',
      optimalRange: 'Not detected'
    },
    aflatoxin_level: {
      value: Math.round(aflatoxin * 10) / 10,
      unit: 'ppb',
      label: 'Aflatoxin Level',
      status: status(aflatoxin <= 10, aflatoxin <= 20),
      optimalRange: '< 10 ppb'
    }
  }
}

/**
 * Calculates Mycotoxin Risk Radar dynamically based on environmental and forage variables.
 */
export function calculateMycotoxinRiskRadar(params, metadata = {}) {
  const moisture = Number(params.moisture?.value ?? 62)
  const duration = Number(metadata.storageDuration ?? 20)
  const feedType = metadata.feedType || 'Maize Silage'
  const isSilage = (metadata.sampleType || 'Silage').toLowerCase().includes('silage')
  const storageCondition = metadata.storageCondition || 'Covered Pit'

  // Dynamic factors
  const tempC = Number(metadata.tempC ?? 32)
  const humidityPct = Number(metadata.humidityPct ?? (isSilage ? 70 : 55))
  
  let moldPct = 0.5
  if (moisture > 70) moldPct += 3.5
  if (storageCondition.includes('Open')) moldPct += 4.0
  if (duration > 45) moldPct += 1.5
  if (tempC > 30 && humidityPct > 65) moldPct += 2.0

  moldPct = Math.min(15, Math.round(moldPct * 10) / 10)

  // Risk Scores out of 100
  let aflaScore = Math.min(95, Math.round((moldPct * 5) + (tempC > 28 ? 15 : 5) + (humidityPct > 70 ? 15 : 5)))
  let vomiScore = Math.min(90, Math.round((moisture > 68 ? 30 : 10) + (duration > 30 ? 15 : 5)))
  let zearScore = Math.min(85, Math.round((duration > 40 ? 25 : 10) + (tempC < 25 ? 20 : 5)))
  let t2Score = Math.min(80, Math.round((moldPct * 4) + 5))

  let overallTier = 'Low Risk'
  if (aflaScore > 65 || moldPct > 5) overallTier = 'High Risk'
  else if (aflaScore > 40 || moldPct > 2.5) overallTier = 'Moderate Risk'
  if (aflaScore > 80 || moldPct > 8) overallTier = 'Critical Danger'

  return {
    overallRiskTier: overallTier,
    aflatoxinRiskScore: aflaScore,
    vomitoxinRiskScore: vomiScore,
    zearalenoneRiskScore: zearScore,
    t2ToxinRiskScore: t2Score,
    calculatedFactors: {
      moldPercentage: moldPct,
      storageDurationDays: duration,
      ambientTempC: tempC,
      relativeHumidityPct: humidityPct,
      cropVulnerability: feedType.includes('Maize') ? 'High' : 'Moderate'
    }
  }
}

/**
 * Calculates Cost of Poor Quality dynamically based on screening score and herd defaults.
 */
export function calculateCostOfPoorQuality(score, herdSize = 10, milkPricePerLiter = 40) {
  const safeScore = Math.max(0, Math.min(100, Number(score) || 80))
  
  if (safeScore >= 80) {
    return {
      dailyLossInr: 0,
      milkDropLitersPerCow: 0,
      vetCostRiskInr: 0,
      estimatedSpoilagePct: 1.5,
      explanation: 'Optimal quality. Minimal nutritive loss and zero milk production penalty.'
    }
  }

  const deficit = 80 - safeScore // points below standard
  const milkDropPerCow = Math.round((deficit * 0.08) * 10) / 10 // e.g. 1.6 L/cow
  const totalDailyMilkLost = milkDropPerCow * herdSize
  const dailyLossInr = Math.round(totalDailyMilkLost * milkPricePerLiter)
  const vetCostRisk = deficit > 25 ? Math.round(herdSize * 150) : Math.round(herdSize * 50)
  const spoilagePct = Math.min(25, Math.round((deficit * 0.45) * 10) / 10)

  return {
    dailyLossInr: dailyLossInr + vetCostRisk,
    milkDropLitersPerCow: milkDropPerCow,
    vetCostRiskInr: vetCostRisk,
    estimatedSpoilagePct: spoilagePct,
    explanation: `Estimated daily loss of ₹${dailyLossInr + vetCostRisk} for a ${herdSize}-cow herd due to a ${milkDropPerCow}L/cow drop in lactation from sub-optimal fermentation.`
  }
}

export function generateAdvisoriesForParameters(params, sampleType = 'Silage') {
  const p = params instanceof Map ? Object.fromEntries(params) : (params || {})
  const messages = []

  const moistureVal = Number(p.moisture?.value ?? p.moisture ?? 0)
  const proteinVal = Number(p.crude_protein?.value ?? p.crude_protein ?? 0)
  const aflatoxinVal = Number(p.aflatoxin_level?.value ?? p.aflatoxin_level ?? 0)
  const energyVal = Number(p.energy_value?.value ?? p.energy_value ?? 0)
  const fiberVal = Number(p.fiber?.value ?? p.fiber ?? 0)
  const isAdulterated = (p.adulteration_flag?.value === 'Detected' || p.adulteration_flag === true)

  const isSilage = (sampleType || 'Silage').toLowerCase().includes('silage')

  if (isSilage && moistureVal > 68) {
    messages.push('Silage moisture exceeds optimal threshold (>68%). Enhance trench compaction and monitor for butyric acid fermentation.')
  } else if (!isSilage && moistureVal > 13) {
    messages.push('Feed concentrate moisture is elevated (>13%). High risk of fungal proliferation during bag storage; ventilate the shed.')
  }

  if (proteinVal < 11.5) {
    messages.push(`Crude protein is suboptimal (${proteinVal}%). Consider supplementing dairy rations with mustard cake, soybean meal, or cottonseed cake.`)
  }

  if (aflatoxinVal > 15) {
    messages.push(`Aflatoxin level is elevated (${aflatoxinVal} ppb). Add a certified bentonite/yeast-cell-wall toxin binder to the total mixed ration immediately.`)
  }

  if (isAdulterated) {
    messages.push('CRITICAL: Possible adulteration detected. Quarantine this batch and submit a sample to an accredited diagnostic laboratory.')
  }

  if (energyVal < 7.5) {
    messages.push('Metabolizable energy is below target. Supplement with high-energy grains or bypass fats for lactating cows.')
  }

  if (fiberVal > 34) {
    messages.push('High fiber content indicates late-harvested forage. Chop length reduction can improve rumen digestibility.')
  }

  if (messages.length === 0) {
    messages.push('Feed quality parameters meet optimal dairy standards. Continue current storage and feeding protocols.')
    messages.push('Ensure clean water ad-libitum and daily mineral mixture supplementation (50g/cow).')
  }

  return messages
}
