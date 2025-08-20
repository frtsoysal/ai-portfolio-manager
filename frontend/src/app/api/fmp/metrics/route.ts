import { NextRequest, NextResponse } from 'next/server'
import { fetchKeyMetrics, fetchFinancialRatios } from '@/lib/fmp'

export const revalidate = 43200 // 12 hours

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const symbol = searchParams.get('symbol')
  const period = searchParams.get('period') || 'annual'
  const limit = parseInt(searchParams.get('limit') || '10', 10)

  if (!symbol) {
    return NextResponse.json(
      { error: 'Symbol parameter is required' },
      { status: 400 }
    )
  }

  try {
    // Fetch metrics and ratios in parallel
    const [metrics, ratios] = await Promise.all([
      fetchKeyMetrics(symbol.toUpperCase(), period as string, limit),
      fetchFinancialRatios(symbol.toUpperCase(), period as string, limit)
    ])
    
    // Combine into a single response
    const response = {
      metrics,
      ratios
    }
    
    return NextResponse.json(response)
  } catch (error) {
    console.error(`Error fetching metrics for ${symbol}:`, error)
    return NextResponse.json(
      { error: 'Failed to fetch financial metrics' },
      { status: 500 }
    )
  }
}
