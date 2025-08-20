import { NextResponse } from 'next/server'
import { getScreenerData } from '@/lib/fmpAggregator'

export const runtime = 'nodejs'
export const revalidate = 43200 // 12 hours ISR

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

export async function GET() {
  try {
    const data = await getScreenerData()
    
    // Transform aggregator data to screener format
    const screenerData: ScreenerRow[] = data.map((company) => {
      // Calculate 52-week position if we have the data
      let week52Position: number | undefined
      if (company.week52High && company.week52Low && company.price) {
        week52Position = (company.price - company.week52Low) / 
                        (company.week52High - company.week52Low)
      }

      return {
        symbol: company.symbol,
        name: company.companyName,
        sector: company.sector,
        industry: company.industry,
        price: company.price,
        changePct: company.changePercent,
        marketCap: company.marketCap,
        pe: company.pe,
        forwardPE: undefined, // Not available in aggregator
        ps: undefined, // Not available in aggregator
        pb: undefined, // Not available in aggregator
        dividendYield: company.dividendYield,
        beta: company.beta,
        week52Position,
        revenueGrowthTTM: undefined, // Not available in aggregator
        netMarginTTM: undefined, // Not available in aggregator
        roeTTM: undefined, // Not available in aggregator
        roaTTM: undefined, // Not available in aggregator
        evEbitda: undefined, // Not available in aggregator
        avgVolume: company.avgVolume,
        week52High: company.week52High,
        week52Low: company.week52Low,
        ev: undefined, // Not available in aggregator
        ebitda: undefined, // Not available in aggregator
        sparkline: generateMockSparkline(company.price)
      }
    })
    
    return NextResponse.json({
      data: screenerData,
      cached: false,
      lastUpdate: new Date().toISOString(),
      count: screenerData.length
    })
  } catch (error) {
    console.error('Screener API error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch screener data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
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