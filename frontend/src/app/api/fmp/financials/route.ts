import { NextRequest, NextResponse } from 'next/server'
import { fetchIncomeStatement, fetchBalanceSheet, fetchCashFlow } from '@/lib/fmp'

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
    // Fetch all financial statements in parallel
    const [incomeStatements, balanceSheets, cashFlows] = await Promise.all([
      fetchIncomeStatement(symbol.toUpperCase(), period as string, limit),
      fetchBalanceSheet(symbol.toUpperCase(), period as string, limit),
      fetchCashFlow(symbol.toUpperCase(), period as string, limit)
    ])
    
    // Combine into a single response
    const financials = {
      incomeStatements,
      balanceSheets,
      cashFlows
    }
    
    return NextResponse.json(financials)
  } catch (error) {
    console.error(`Error fetching financials for ${symbol}:`, error)
    return NextResponse.json(
      { error: 'Failed to fetch financial statements' },
      { status: 500 }
    )
  }
}
