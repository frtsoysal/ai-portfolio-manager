import { NextRequest, NextResponse } from 'next/server'
import { fetchCompanyProfile } from '@/lib/fmp'

export const revalidate = 43200 // 12 hours

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const symbol = searchParams.get('symbol')

  if (!symbol) {
    return NextResponse.json(
      { error: 'Symbol parameter is required' },
      { status: 400 }
    )
  }

  try {
    const profile = await fetchCompanyProfile(symbol.toUpperCase())
    
    if (!profile) {
      return NextResponse.json(
        { error: `No profile found for symbol: ${symbol}` },
        { status: 404 }
      )
    }
    
    return NextResponse.json(profile)
  } catch (error) {
    console.error(`Error fetching profile for ${symbol}:`, error)
    return NextResponse.json(
      { error: 'Failed to fetch company profile' },
      { status: 500 }
    )
  }
}
