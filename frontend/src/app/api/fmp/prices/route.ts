import { NextRequest, NextResponse } from 'next/server'
import { fetchHistoricalPrices, generateSparkline } from '@/lib/fmp'

export const revalidate = 43200 // 12 hours

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const symbol = searchParams.get('symbol')
  const from = searchParams.get('from') || undefined
  const to = searchParams.get('to') || undefined
  const sparklineLength = parseInt(searchParams.get('sparklineLength') || '252', 10)

  if (!symbol) {
    return NextResponse.json(
      { error: 'Symbol parameter is required' },
      { status: 400 }
    )
  }

  try {
    // Fetch historical prices
    const prices = await fetchHistoricalPrices(symbol.toUpperCase(), from || undefined, to || undefined)
    
    // Generate sparkline data
    const sparkline = generateSparkline(prices, sparklineLength)
    
    // Return both full prices and sparkline
    const response = {
      prices,
      sparkline
    }
    
    return NextResponse.json(response)
  } catch (error) {
    console.error(`Error fetching prices for ${symbol}:`, error)
    return NextResponse.json(
      { error: 'Failed to fetch historical prices' },
      { status: 500 }
    )
  }
}
