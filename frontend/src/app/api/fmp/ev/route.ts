import { NextRequest, NextResponse } from 'next/server'
import { fetchEnterpriseValue } from '@/lib/fmp'

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
    const enterpriseValues = await fetchEnterpriseValue(symbol.toUpperCase(), period as string, limit)
    
    return NextResponse.json(enterpriseValues)
  } catch (error) {
    console.error(`Error fetching enterprise value for ${symbol}:`, error)
    return NextResponse.json(
      { error: 'Failed to fetch enterprise value' },
      { status: 500 }
    )
  }
}
