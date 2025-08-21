import { NextRequest, NextResponse } from 'next/server'
import { httpGetJSON } from '../../../../../../lib/backend'

export const runtime = 'nodejs'

function sanitizeSymbol(symbol: string): string {
  return symbol
    .trim()
    .toUpperCase()
    .replace(/\./g, '-') // BRK.B -> BRK-B
}

export async function GET(
  request: NextRequest,
  { params }: { params: { symbol: string } }
) {
  try {
    const rawSymbol = params.symbol
    const symbol = sanitizeSymbol(rawSymbol)
    
    console.log('[DCF]', symbol, 'requesting data')

    // Call backend DCF endpoint
    const data = await httpGetJSON('/api/fmp/dcf-data', {
      searchParams: { symbol }
    })

    console.log('[DCF]', symbol, 'received data keys:', Object.keys(data || {}))

    // Always return 200 with symbol info, even on business errors
    return NextResponse.json({
      symbol,
      ...data
    })

  } catch (error) {
    console.error('[DCF] Proxy error for', params.symbol, ':', error)
    
    // Return 200 with error info instead of 404/500
    return NextResponse.json({
      symbol: params.symbol,
      error: 'backend_unavailable',
      message: 'Unable to fetch DCF data for this symbol'
    })
  }
}
