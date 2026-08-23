import { getFarmerSuggestions, invalidateSuggestionsCache, collectFarmerContext } from '../services/personalizationService.js'

export async function getSuggestions(req, res, next) {
  try {
    const farmerId = req.params.farmerId || req.farmerId || 'demo-farmer'
    const language = req.query.lang || req.headers['accept-language'] || 'en'
    const forceRefresh = req.query.refresh === 'true'

    console.log(`[Personalization API] Fetching suggestions for farmer: ${farmerId} (refresh: ${forceRefresh})`)
    const result = await getFarmerSuggestions(farmerId, language, forceRefresh)

    return res.json(result)
  } catch (err) {
    console.error(`[Personalization API Error]`, err)
    next(err)
  }
}

export async function refreshSuggestions(req, res, next) {
  try {
    const farmerId = req.params.farmerId || req.farmerId || 'demo-farmer'
    const language = req.query.lang || 'en'

    invalidateSuggestionsCache(farmerId)
    const result = await getFarmerSuggestions(farmerId, language, true)

    return res.json({
      message: 'Suggestions cache refreshed successfully',
      ...result
    })
  } catch (err) {
    next(err)
  }
}

export async function getFarmerContextSnapshot(req, res, next) {
  try {
    const farmerId = req.params.farmerId || req.farmerId || 'demo-farmer'
    const context = await collectFarmerContext(farmerId)
    return res.json({ context })
  } catch (err) {
    next(err)
  }
}
