/**
 * Server-only FMP data aggregator
 * Replaces HTTP calls with direct function imports
 */

export const runtime = 'nodejs'

interface ScreenerRow {
  symbol: string
  companyName: string
  price: number
  change: number
  changePercent: number
  marketCap: number
  pe: number | null
  eps: number | null
  dividend: number | null
  dividendYield: number | null
  volume: number
  avgVolume: number
  sector: string
  industry: string
  beta: number | null
  week52High: number | null
  week52Low: number | null
  priceHistory?: number[]
}

interface DCFData {
  company: {
    symbol: string
    companyName: string
    sector: string
    industry: string
    marketCap: number
    price: number
  }
  historicalFinancials: {
    revenue: Array<{ year: number; value: number }>
    netIncome: Array<{ year: number; value: number }>
    freeCashFlow: Array<{ year: number; value: number }>
    totalDebt: Array<{ year: number; value: number }>
    cash: Array<{ year: number; value: number }>
    sharesOutstanding: Array<{ year: number; value: number }>
  }
  marketData: {
    beta: number
    riskFreeRate: number
    marketRiskPremium: number
    costOfDebt: number
    taxRate: number
  }
  priceHistory: Array<{ date: string; price: number }>
}

/**
 * Get screener data from FMP API
 */
export async function getScreenerData(): Promise<ScreenerRow[]> {
  const apiKey = process.env.FMP_API_KEY
  if (!apiKey) {
    throw new Error('FMP_API_KEY environment variable is required. Please set it in your Vercel project settings.')
  }

  try {
    console.log('[FMP] Fetching S&P 500 constituent list...')
    // Get S&P 500 list
    const sp500Response = await fetch(
      `https://financialmodelingprep.com/api/v3/sp500_constituent?apikey=${apiKey}`
    )
    const sp500List = await sp500Response.json()

    // Get quotes for all symbols
    const symbols = sp500List.slice(0, 50).map((item: any) => item.symbol).join(',')
    
    const [quotesResponse, profilesResponse] = await Promise.all([
      fetch(`https://financialmodelingprep.com/api/v3/quote/${symbols}?apikey=${apiKey}`),
      fetch(`https://financialmodelingprep.com/api/v3/profile/${symbols}?apikey=${apiKey}`)
    ])

    const quotes = await quotesResponse.json()
    const profiles = await profilesResponse.json()

    // Merge data
    const screenerData: ScreenerRow[] = quotes.map((quote: any) => {
      const profile = profiles.find((p: any) => p.symbol === quote.symbol)
      
      return {
        symbol: quote.symbol,
        companyName: profile?.companyName || quote.name || quote.symbol,
        price: quote.price || 0,
        change: quote.change || 0,
        changePercent: quote.changesPercentage || 0,
        marketCap: profile?.mktCap || 0,
        pe: quote.pe || null,
        eps: quote.eps || null,
        dividend: profile?.lastDiv || null,
        dividendYield: profile?.lastDiv && quote.price ? 
          (profile.lastDiv / quote.price) * 100 : null,
        volume: quote.volume || 0,
        avgVolume: quote.avgVolume || 0,
        sector: profile?.sector || 'Unknown',
        industry: profile?.industry || 'Unknown',
        beta: profile?.beta || null,
        week52High: quote.yearHigh || null,
        week52Low: quote.yearLow || null,
        priceHistory: [] // Will be populated separately if needed
      }
    })

    console.log(`[FMP] Successfully fetched ${screenerData.length} companies`)
    return screenerData.filter(row => row.price > 0)
  } catch (error) {
    console.error('[FMP] Error fetching screener data:', error)
    return []
  }
}

/**
 * Get DCF data for a specific symbol
 */
export async function getDCFData(symbol: string): Promise<DCFData | null> {
  const apiKey = process.env.FMP_API_KEY
  if (!apiKey) {
    throw new Error('FMP_API_KEY environment variable is required. Please set it in your Vercel project settings.')
  }

  try {
    console.log(`[FMP] Fetching DCF data for ${symbol}...`)
    const [
      profileResponse,
      financialsResponse,
      cashFlowResponse,
      balanceSheetResponse,
      priceHistoryResponse
    ] = await Promise.all([
      fetch(`https://financialmodelingprep.com/api/v3/profile/${symbol}?apikey=${apiKey}`),
      fetch(`https://financialmodelingprep.com/api/v3/income-statement/${symbol}?limit=10&apikey=${apiKey}`),
      fetch(`https://financialmodelingprep.com/api/v3/cash-flow-statement/${symbol}?limit=10&apikey=${apiKey}`),
      fetch(`https://financialmodelingprep.com/api/v3/balance-sheet-statement/${symbol}?limit=10&apikey=${apiKey}`),
      fetch(`https://financialmodelingprep.com/api/v3/historical-price-full/${symbol}?from=2020-01-01&apikey=${apiKey}`)
    ])

    const [profile, financials, cashFlow, balanceSheet, priceHistory] = await Promise.all([
      profileResponse.json(),
      financialsResponse.json(),
      cashFlowResponse.json(),
      balanceSheetResponse.json(),
      priceHistoryResponse.json()
    ])

    if (!profile[0]) {
      return null
    }

    const company = profile[0]
    
    return {
      company: {
        symbol: company.symbol,
        companyName: company.companyName,
        sector: company.sector,
        industry: company.industry,
        marketCap: company.mktCap,
        price: company.price
      },
      historicalFinancials: {
        revenue: financials.map((f: any) => ({
          year: new Date(f.date).getFullYear(),
          value: f.revenue || 0
        })).reverse(),
        netIncome: financials.map((f: any) => ({
          year: new Date(f.date).getFullYear(),
          value: f.netIncome || 0
        })).reverse(),
        freeCashFlow: cashFlow.map((f: any) => ({
          year: new Date(f.date).getFullYear(),
          value: f.freeCashFlow || 0
        })).reverse(),
        totalDebt: balanceSheet.map((f: any) => ({
          year: new Date(f.date).getFullYear(),
          value: f.totalDebt || 0
        })).reverse(),
        cash: balanceSheet.map((f: any) => ({
          year: new Date(f.date).getFullYear(),
          value: f.cashAndCashEquivalents || 0
        })).reverse(),
        sharesOutstanding: financials.map((f: any) => ({
          year: new Date(f.date).getFullYear(),
          value: f.weightedAverageShsOut || 0
        })).reverse()
      },
      marketData: {
        beta: company.beta || 1.0,
        riskFreeRate: 4.5, // Current 10Y Treasury
        marketRiskPremium: 6.0, // Historical market premium
        costOfDebt: 5.0, // Estimated
        taxRate: 21.0 // Corporate tax rate
      },
      priceHistory: priceHistory.historical?.slice(0, 252).map((p: any) => ({
        date: p.date,
        price: p.close
      })).reverse() || []
    }
    
    console.log(`[FMP] Successfully fetched DCF data for ${symbol}`)
    return {
      company: {
        symbol: company.symbol,
        companyName: company.companyName,
        sector: company.sector,
        industry: company.industry,
        marketCap: company.mktCap,
        price: company.price
      },
      historicalFinancials: {
        revenue: financials.map((f: any) => ({
          year: new Date(f.date).getFullYear(),
          value: f.revenue || 0
        })).reverse(),
        netIncome: financials.map((f: any) => ({
          year: new Date(f.date).getFullYear(),
          value: f.netIncome || 0
        })).reverse(),
        freeCashFlow: cashFlow.map((f: any) => ({
          year: new Date(f.date).getFullYear(),
          value: f.freeCashFlow || 0
        })).reverse(),
        totalDebt: balanceSheet.map((f: any) => ({
          year: new Date(f.date).getFullYear(),
          value: f.totalDebt || 0
        })).reverse(),
        cash: balanceSheet.map((f: any) => ({
          year: new Date(f.date).getFullYear(),
          value: f.cashAndCashEquivalents || 0
        })).reverse(),
        sharesOutstanding: financials.map((f: any) => ({
          year: new Date(f.date).getFullYear(),
          value: f.weightedAverageShsOut || 0
        })).reverse()
      },
      marketData: {
        beta: company.beta || 1.0,
        riskFreeRate: 4.5, // Current 10Y Treasury
        marketRiskPremium: 6.0, // Historical market premium
        costOfDebt: 5.0, // Estimated
        taxRate: 21.0 // Corporate tax rate
      },
      priceHistory: priceHistory.historical?.slice(0, 252).map((p: any) => ({
        date: p.date,
        price: p.close
      })).reverse() || []
    }
  } catch (error) {
    console.error(`[FMP] Error fetching DCF data for ${symbol}:`, error)
    return null
  }
}
