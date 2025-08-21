import { NextRequest, NextResponse } from 'next/server'
import { httpGetJSON } from '../../../../../lib/backend'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    
    // Pass through query params to backend
    const backendParams: Record<string, string> = {}
    searchParams.forEach((value, key) => {
      backendParams[key] = value
    })

    // Call backend SP500 overview endpoint
    const data = await httpGetJSON('/api/sp500/overview', { 
      searchParams: backendParams 
    })

    // Return the data as-is
    return NextResponse.json(data)

  } catch (error) {
    console.error('[PROXY] SP500 error:', error)
    
    return NextResponse.json(
      { 
        error: 'backend_unavailable',
        message: 'Unable to fetch SP500 data'
      },
      { status: 502 }
    )
  }
}
