import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get('symbol')
    
    if (!symbol) {
      return NextResponse.json({ error: 'Symbol is required' }, { status: 400 })
    }

    const backendUrl = process.env.BACKEND_URL || 'https://ai-portfolio-manager-krrs.onrender.com'
    
    const response = await fetch(`${backendUrl}/api/fmp/dcf-data?symbol=${symbol}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`)
    }

    const data = await response.json()
    
    if (data.error) {
      return NextResponse.json({ error: data.error }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching DCF data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch DCF data' },
      { status: 500 }
    )
  }
}
