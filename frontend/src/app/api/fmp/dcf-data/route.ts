import { NextRequest, NextResponse } from 'next/server'
import { fetchCustomDCF } from '@/lib/fmp'
import { DCFData, Company, HistoricalFinancials, MarketData, PriceHistory } from '@/types/dcf'

export const revalidate = 43200 // 12 hours

// In-memory cache
const cache = new Map<string, { data: DCFData, timestamp: number }>()
const CACHE_TTL = 12 * 60 * 60 * 1000 // 12 hours

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const symbol = searchParams.get('symbol')
  const skipCache = searchParams.get('skipCache') === 'true'

  if (!symbol) {
    return NextResponse.json(
      { error: 'Symbol parameter is required' },
      { status: 400 }
    )
  }

  const cacheKey = `dcf-data-${symbol.toUpperCase()}`
  const now = Date.now()
  
  // Check cache first (unless skipCache is true)
  if (!skipCache) {
    const cached = cache.get(cacheKey)
    if (cached && (now - cached.timestamp) < CACHE_TTL) {
      return NextResponse.json(cached.data)
    }
  }

  try {
    // Fetch all data in parallel
    const [
      profileRes,
      financialsRes,
      metricsRes,
      pricesRes,
      evRes,
      customDCFRes
    ] = await Promise.all([
      fetch(`${request.nextUrl.origin}/api/fmp/profile?symbol=${symbol}`),
      fetch(`${request.nextUrl.origin}/api/fmp/financials?symbol=${symbol}`),
      fetch(`${request.nextUrl.origin}/api/fmp/metrics?symbol=${symbol}`),
      fetch(`${request.nextUrl.origin}/api/fmp/prices?symbol=${symbol}`),
      fetch(`${request.nextUrl.origin}/api/fmp/ev?symbol=${symbol}`),
      fetchCustomDCF(symbol.toUpperCase())
    ])
    
    // Parse all responses
    const [
      profile,
      financials,
      metrics,
      prices,
      enterpriseValues,
      customDCF
    ] = await Promise.all([
      profileRes.json(),
      financialsRes.json(),
      metricsRes.json(),
      pricesRes.json(),
      evRes.json(),
      customDCFRes
    ])
    
    // Extract and transform the data into our DCF data structure
    const company: Company = {
      symbol: profile.symbol,
      name: profile.companyName,
      sector: profile.sector,
      industry: profile.industry,
      country: profile.country,
      currency: profile.currency,
      sharesOutstanding: profile.sharesOutstanding,
      dilutedShares: profile.sharesOutstanding // Use outstanding as fallback, will be overridden if available
    }
    
    // Get the most recent financial data
    const incomeStatement = financials.incomeStatements?.[0] || {}
    const balanceSheet = financials.balanceSheets?.[0] || {}
    const cashFlow = financials.cashFlows?.[0] || {}
    const keyMetrics = metrics.metrics?.[0] || {}
    const ratios = metrics.ratios?.[0] || {}
    const ev = enterpriseValues?.[0] || {}
    
    // Update diluted shares if available
    if (incomeStatement.weightedAverageShsOutDil) {
      company.dilutedShares = incomeStatement.weightedAverageShsOutDil
    }
    
    // Transform historical financials
    const historical: HistoricalFinancials[] = financials.incomeStatements?.map((income: any, index: number) => {
      const balance = financials.balanceSheets?.[index] || {}
      const cash = financials.cashFlows?.[index] || {}
      const metric = metrics.metrics?.[index] || {}
      const ratio = metrics.ratios?.[index] || {}
      const enterpriseValue = enterpriseValues?.[index] || {}
      
      // Calculate effective tax rate
      const effectiveTaxRate = income.incomeTaxExpense && income.incomeBeforeTax 
        ? income.incomeTaxExpense / income.incomeBeforeTax
        : 0.25 // Default if not available
      
      // Calculate NOPAT
      const nopat = income.operatingIncome ? income.operatingIncome * (1 - effectiveTaxRate) : 0
      
      // Calculate FCFF
      const fcff = nopat + 
        (cash.depreciationAndAmortization || 0) - 
        Math.abs(cash.capitalExpenditure || 0) - 
        (cash.changeInWorkingCapital || 0)
      
      return {
        year: new Date(income.date).getFullYear(),
        revenue: income.revenue || 0,
        cogs: income.costOfRevenue || 0,
        grossProfit: income.grossProfit || 0,
        operatingExpenses: (income.operatingExpenses || 0),
        ebit: income.operatingIncome || 0,
        taxExpense: income.incomeTaxExpense || 0,
        effectiveTaxRate,
        nopat,
        depreciation: cash.depreciationAndAmortization || 0,
        capex: Math.abs(cash.capitalExpenditure || 0),
        changeInWorkingCapital: cash.changeInWorkingCapital || 0,
        stockBasedCompensation: cash.stockBasedCompensation || 0,
        leasePayments: 0, // Not directly available, would need to be derived
        fcff,
        // Balance sheet items
        totalDebt: balance.totalDebt || 0,
        cash: balance.cashAndCashEquivalents || 0,
        netDebt: (balance.totalDebt || 0) - (balance.cashAndCashEquivalents || 0),
        minorityInterest: balance.minorityInterest || 0,
        investments: balance.investments || 0
      }
    }) || []
    
    // Market data
    const marketData: MarketData = {
      currentPrice: profile.price || 0,
      marketCap: profile.mktCap || 0,
      enterpriseValue: ev.enterpriseValue || 0,
      beta: profile.beta || 1,
      riskFreeRate: 0.0382, // Default value, could be fetched from Treasury API
      equityRiskPremium: 0.0472, // Default value, could be customized
      currency: profile.currency || 'USD',
      lastUpdated: new Date().toISOString()
    }
    
    // Price history
    const priceHistory: PriceHistory[] = prices.prices?.map((p: any) => ({
      date: p.date,
      close: p.close
    })) || []
    
    // Assemble the final DCF data object
    const dcfData: DCFData = {
      company,
      historical,
      market: marketData,
      priceHistory,
      sparkline: prices.sparkline || []
    }
    
    // Update cache
    cache.set(cacheKey, { data: dcfData, timestamp: now })
    
    return NextResponse.json(dcfData)
  } catch (error) {
    console.error(`Error fetching DCF data for ${symbol}:`, error)
    return NextResponse.json(
      { error: 'Failed to fetch DCF data' },
      { status: 500 }
    )
  }
}
