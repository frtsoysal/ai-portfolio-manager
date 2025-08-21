import { NextRequest, NextResponse } from 'next/server'
import { httpGetJSON } from '../../../../../lib/backend'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Pass through query params to backend
    const backendParams: Record<string, string> = {}
    searchParams.forEach((value, key) => {
      backendParams[key] = value
    })

    // Call backend screener endpoint
    const data = await httpGetJSON('/api/screener', { 
      searchParams: backendParams 
    })

    // Return the data as-is for now (we'll normalize in step 4)
    return NextResponse.json(data)

  } catch (error) {
    console.error('[PROXY] Screener error:', error)
    
    return NextResponse.json(
      { 
        error: 'backend_unavailable',
        message: 'Unable to fetch screener data'
      },
      { status: 502 }
    )
  }
}
