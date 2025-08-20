/**
 * FMP API Helper
 * Server-only utility for fetching data from Financial Modeling Prep API
 */

import { cache } from 'react'

// Simple in-memory LRU cache
const FMP_CACHE = new Map<string, { data: any, timestamp: number }>()
const CACHE_TTL = 12 * 60 * 60 * 1000 // 12 hours

type FetchFMPOptions = {
  params?: Record<string, string | number | boolean>
  cache?: boolean
  cacheTTL?: number
}

/**
 * Fetches data from FMP API with caching and error handling
 * This function is server-only to protect API keys
 */
export const fetchFMP = cache(async <T>(
  endpoint: string, 
  options: FetchFMPOptions = {}
): Promise<T> => {
  const {
    params = {},
    cache = true,
    cacheTTL = CACHE_TTL
  } = options

  // Build URL with params
  // Hard-coded API key for development
  const apiKey = 'N2s4mP85oHkr3DBawy2GrncqTTpakTBM'

  // Add API key to params
  const queryParams = new URLSearchParams({
    ...params,
    apikey: apiKey
  })

  const url = `https://financialmodelingprep.com/api/v3/${endpoint}?${queryParams.toString()}`
  
  // Generate cache key
  const cacheKey = url
  const now = Date.now()

  // Check cache if enabled
  if (cache) {
    const cachedData = FMP_CACHE.get(cacheKey)
    if (cachedData && (now - cachedData.timestamp) < cacheTTL) {
      console.log(`[FMP] Cache hit for ${endpoint}`)
      return cachedData.data as T
    }
  }

  // Fetch data
  try {
    console.log(`[FMP] Fetching ${endpoint}`)
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      next: {
        revalidate: 43200 // 12 hours
      }
    })

    if (!response.ok) {
      throw new Error(`FMP API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    // Cache the result if caching is enabled
    if (cache) {
      FMP_CACHE.set(cacheKey, { data, timestamp: now })
      
      // Simple LRU - if cache gets too big, remove oldest entries
      if (FMP_CACHE.size > 100) {
        const oldestKey = FMP_CACHE.keys().next().value
        FMP_CACHE.delete(oldestKey)
      }
    }
    
    return data as T
  } catch (error) {
    console.error(`[FMP] Error fetching ${endpoint}:`, error)
    throw new Error(`Failed to fetch data from FMP API: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
})

/**
 * Fetches custom DCF data from FMP API
 */
export const fetchCustomDCF = cache(async (symbol: string) => {
  const endpoint = `stable/custom-discounted-cash-flow`
  return fetchFMP(endpoint, { params: { symbol } })
})

/**
 * Fetches company profile from FMP API
 */
export const fetchCompanyProfile = cache(async (symbol: string) => {
  const endpoint = `profile/${symbol}`
  const data = await fetchFMP<any[]>(endpoint)
  return data?.[0] || null
})

/**
 * Fetches income statement from FMP API
 */
export const fetchIncomeStatement = cache(async (symbol: string, period = 'annual', limit = 10) => {
  const endpoint = `income-statement/${symbol}`
  return fetchFMP(endpoint, { params: { period, limit } })
})

/**
 * Fetches balance sheet from FMP API
 */
export const fetchBalanceSheet = cache(async (symbol: string, period = 'annual', limit = 10) => {
  const endpoint = `balance-sheet-statement/${symbol}`
  return fetchFMP(endpoint, { params: { period, limit } })
})

/**
 * Fetches cash flow statement from FMP API
 */
export const fetchCashFlow = cache(async (symbol: string, period = 'annual', limit = 10) => {
  const endpoint = `cash-flow-statement/${symbol}`
  return fetchFMP(endpoint, { params: { period, limit } })
})

/**
 * Fetches key metrics from FMP API
 */
export const fetchKeyMetrics = cache(async (symbol: string, period = 'annual', limit = 10) => {
  const endpoint = `key-metrics/${symbol}`
  return fetchFMP(endpoint, { params: { period, limit } })
})

/**
 * Fetches financial ratios from FMP API
 */
export const fetchFinancialRatios = cache(async (symbol: string, period = 'annual', limit = 10) => {
  const endpoint = `ratios/${symbol}`
  return fetchFMP(endpoint, { params: { period, limit } })
})

/**
 * Fetches enterprise value from FMP API
 */
export const fetchEnterpriseValue = cache(async (symbol: string, period = 'annual', limit = 10) => {
  const endpoint = `enterprise-values/${symbol}`
  return fetchFMP(endpoint, { params: { period, limit } })
})

/**
 * Fetches historical price data from FMP API
 */
export const fetchHistoricalPrices = cache(async (symbol: string, from?: string, to?: string) => {
  const endpoint = `historical-price-full/${symbol}`
  const params: Record<string, string | number | boolean> = {}
  
  if (from) params.from = from
  if (to) params.to = to
  
  const data = await fetchFMP<{ historical: any[] }>(endpoint, { params })
  return data?.historical || []
})

/**
 * Generates a sparkline array from historical prices
 */
export const generateSparkline = (prices: any[], length = 252): number[] => {
  if (!prices || prices.length === 0) {
    return Array(length).fill(null)
  }
  
  // Take the most recent 'length' days or pad with nulls
  const recentPrices = prices.slice(0, length).map(p => p.close || null)
  
  // Pad with nulls if we don't have enough data
  if (recentPrices.length < length) {
    return [...Array(length - recentPrices.length).fill(null), ...recentPrices]
  }
  
  return recentPrices
}
