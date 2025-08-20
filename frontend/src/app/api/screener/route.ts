import { NextRequest, NextResponse } from 'next/server'

// Cache for 12 hours
export const revalidate = 43200

export interface ScreenerRow {
  symbol: string
  name: string
  sector: string
  industry: string
  price: number
  changePct: number
  marketCap: number
  pe?: number
  forwardPE?: number
  ps?: number
  pb?: number
  dividendYield?: number
  beta?: number
  week52Position?: number // (price - w52Low)/(w52High - w52Low)
  revenueGrowthTTM?: number
  netMarginTTM?: number
  roeTTM?: number
  roaTTM?: number
  evEbitda?: number
  avgVolume?: number
  sparkline?: number[] // 1Y price history for mini chart
  week52High?: number
  week52Low?: number
  ev?: number
  ebitda?: number
}

// Simple in-memory cache
const cache = new Map<string, { data: ScreenerRow[], timestamp: number }>()
const CACHE_TTL = 12 * 60 * 60 * 1000 // 12 hours

export async function GET(request: NextRequest) {
  try {
    const refresh = request.nextUrl.searchParams.get('refresh') === '1'
    
    const cacheKey = 'sp500-screener'
    const cached = cache.get(cacheKey)
    
    // Return cached data if valid and not refreshing
    if (!refresh && cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json({
        data: cached.data,
        cached: true,
        lastUpdate: new Date(cached.timestamp).toISOString()
      })
    }

    // Fetch fresh data from our backend
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8001'
    const response = await fetch(`${backendUrl}/api/sp500/overview`, {
      headers: {
        'Cache-Control': 'no-cache'
      }
    })

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`)
    }

    const backendData = await response.json()
    
    // Transform backend data to screener format
    const screenerData: ScreenerRow[] = backendData.companies.map((company: any) => {
      // Calculate 52-week position if we have the data
      let week52Position: number | undefined
      if (company.week52_high && company.week52_low && company.current_price) {
        week52Position = (company.current_price - company.week52_low) / 
                        (company.week52_high - company.week52_low)
      }

      // Calculate EV/EBITDA if we have both values
      let evEbitda: number | undefined
      if (company.enterprise_value && company.ebitda && company.ebitda !== 0) {
        evEbitda = company.enterprise_value / company.ebitda
      }

      return {
        symbol: company.symbol,
        name: company.company_name,
        sector: company.sector,
        industry: company.industry || 'N/A',
        price: company.current_price || 0,
        changePct: company.day_change_percent || 0,
        marketCap: company.market_cap || 0,
        pe: company.pe_ratio,
        forwardPE: company.forward_pe,
        ps: company.ps_ratio,
        pb: company.pb_ratio,
        dividendYield: company.dividend_yield,
        beta: company.beta,
        week52Position,
        revenueGrowthTTM: company.revenue_growth_ttm,
        netMarginTTM: company.net_margin,
        roeTTM: company.roe,
        roaTTM: company.roa,
        evEbitda,
        avgVolume: company.avg_volume,
        week52High: company.week52_high,
        week52Low: company.week52_low,
        ev: company.enterprise_value,
        ebitda: company.ebitda,
        // Generate mock sparkline for now (replace with real data later)
        sparkline: generateMockSparkline(company.current_price || 100)
      }
    })

    // Cache the results
    cache.set(cacheKey, {
      data: screenerData,
      timestamp: Date.now()
    })

    return NextResponse.json({
      data: screenerData,
      cached: false,
      lastUpdate: new Date().toISOString(),
      count: screenerData.length
    })

  } catch (error) {
    console.error('Screener API error:', error)
    
    // Return mock data if FMP key is missing or in development
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({
        data: getMockData(),
        cached: false,
        lastUpdate: new Date().toISOString(),
        mock: true
      })
    }

    return NextResponse.json(
      { error: 'Failed to fetch screener data' },
      { status: 500 }
    )
  }
}

// Generate mock sparkline data (replace with real historical data later)
function generateMockSparkline(currentPrice: number): number[] {
  const points = 30 // 30 days
  const data: number[] = []
  let price = currentPrice * 0.9 // Start 10% lower
  
  for (let i = 0; i < points; i++) {
    // Add some random variation
    const change = (Math.random() - 0.5) * 0.05 // ±2.5% daily variation
    price = price * (1 + change)
    data.push(Math.round(price * 100) / 100)
  }
  
  // Ensure last point is close to current price
  data[data.length - 1] = currentPrice
  
  return data
}

// Mock data for development
function getMockData(): ScreenerRow[] {
  return [
    {
      symbol: 'AAPL',
      name: 'Apple Inc.',
      sector: 'Technology',
      industry: 'Consumer Electronics',
      price: 175.43,
      changePct: 1.24,
      marketCap: 2750000000000,
      pe: 28.5,
      forwardPE: 25.2,
      ps: 7.8,
      pb: 45.2,
      dividendYield: 0.0048,
      beta: 1.25,
      week52Position: 0.78,
      revenueGrowthTTM: 0.08,
      netMarginTTM: 0.24,
      roeTTM: 0.147,
      roaTTM: 0.089,
      evEbitda: 22.1,
      avgVolume: 52000000,
      sparkline: generateMockSparkline(175.43),
      week52High: 199.62,
      week52Low: 164.08
    },
    {
      symbol: 'MSFT',
      name: 'Microsoft Corporation',
      sector: 'Technology',
      industry: 'Software',
      price: 378.85,
      changePct: 0.67,
      marketCap: 2810000000000,
      pe: 32.1,
      forwardPE: 28.9,
      ps: 11.2,
      pb: 12.8,
      dividendYield: 0.0072,
      beta: 0.89,
      week52Position: 0.65,
      revenueGrowthTTM: 0.13,
      netMarginTTM: 0.34,
      roeTTM: 0.189,
      roaTTM: 0.098,
      evEbitda: 19.7,
      avgVolume: 28000000,
      sparkline: generateMockSparkline(378.85),
      week52High: 420.82,
      week52Low: 309.45
    },
    // Add more mock data as needed...
  ]
}
