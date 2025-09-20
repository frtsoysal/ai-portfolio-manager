import { NextRequest, NextResponse } from 'next/server'

export const revalidate = 43200 // Cache for 12 hours

interface Company {
  symbol: string
  company_name: string
  sector: string
  industry: string
  market_cap: number
  current_price: number
  pe_ratio: number
  roe: number
  pb_ratio: number
  debt_equity: number
  dividend_yield: number
  data_quality: string
}

interface SP500Data {
  total_companies: number
  collection_date: string
  companies: Company[]
}

// In-memory cache
const cache = new Map<string, { data: SP500Data, timestamp: number }>()
const CACHE_TTL = 12 * 60 * 60 * 1000 // 12 hours

export async function GET(request: NextRequest) {
  const cacheKey = 'sp500_overview'
  const now = Date.now()
  
  // Check cache first
  const cached = cache.get(cacheKey)
  if (cached && (now - cached.timestamp) < CACHE_TTL) {
    return NextResponse.json(cached.data)
  }

  try {
    // Fetch from backend
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8001'
    const response = await fetch(`${backendUrl}/api/sp500/overview`, {
      headers: {
        'Content-Type': 'application/json',
      },
      // Add timeout
      signal: AbortSignal.timeout(30000)
    })

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`)
    }

    const data: SP500Data = await response.json()
    
    // Update cache
    cache.set(cacheKey, { data, timestamp: now })
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching S&P 500 data from backend:', error)
    
    // Return cached data if available, even if expired
    const cached = cache.get(cacheKey)
    if (cached) {
      console.log('Returning expired cache due to backend error')
      return NextResponse.json(cached.data)
    }
    
    // Return mock data as fallback
    return NextResponse.json({
      total_companies: 0,
      collection_date: new Date().toISOString(),
      companies: []
    })
  }
}
