import { NextResponse } from 'next/server'
import { getScreenerData } from '@/lib/fmpAggregator'

export const runtime = 'nodejs'
export const revalidate = 43200 // 12 hours ISR

interface Company {
  symbol: string
  company_name: string
  sector: string
  industry: string
  current_price: number
  day_change_percent: number
  market_cap: number
  pe_ratio?: number
  dividend_yield?: number
  beta?: number
  week52_high?: number
  week52_low?: number
  avg_volume?: number
  revenue_growth_ttm?: number
  net_margin?: number
  roe?: number
  roa?: number
  enterprise_value?: number
  ebitda?: number
  pb_ratio?: number
  ps_ratio?: number
  forward_pe?: number
}

interface SP500Response {
  companies: Company[]
  total_count: number
  last_updated: string
}

export async function GET() {
  try {
    const data = await getScreenerData()
    
    // Transform aggregator data to SP500 format
    const companies: Company[] = data.map((company) => ({
      symbol: company.symbol,
      company_name: company.companyName,
      sector: company.sector,
      industry: company.industry,
      current_price: company.price,
      day_change_percent: company.changePercent,
      market_cap: company.marketCap,
      pe_ratio: company.pe,
      dividend_yield: company.dividendYield,
      beta: company.beta,
      week52_high: company.week52High,
      week52_low: company.week52Low,
      avg_volume: company.avgVolume,
      revenue_growth_ttm: undefined, // Not available in aggregator
      net_margin: undefined, // Not available in aggregator
      roe: undefined, // Not available in aggregator
      roa: undefined, // Not available in aggregator
      enterprise_value: undefined, // Not available in aggregator
      ebitda: undefined, // Not available in aggregator
      pb_ratio: undefined, // Not available in aggregator
      ps_ratio: undefined, // Not available in aggregator
      forward_pe: undefined // Not available in aggregator
    }))
    
    const response: SP500Response = {
      companies,
      total_count: companies.length,
      last_updated: new Date().toISOString()
    }
    
    return NextResponse.json({
      ...response,
      cached: false
    })
  } catch (error) {
    console.error('Error fetching S&P 500 data:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch S&P 500 data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}