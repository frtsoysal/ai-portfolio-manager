import { NextRequest, NextResponse } from 'next/server'

// Cache for 12 hours
export const revalidate = 43200

export interface ScreenerRow {
  symbol: string
  name: string
  sector: string
  industry: string
  price: number
  changePct: number
  marketCap: number
  pe?: number
  forwardPE?: number
  ps?: number
  pb?: number
  dividendYield?: number
  beta?: number
  week52Position?: number // (price - w52Low)/(w52High - w52Low)
  revenueGrowthTTM?: number
  netMarginTTM?: number
  roeTTM?: number
  roaTTM?: number
  evEbitda?: number
  avgVolume?: number
  sparkline?: number[] // 1Y price history for mini chart
  week52High?: number
  week52Low?: number
  ev?: number
  ebitda?: number
}

// Simple in-memory cache
const cache = new Map<string, { data: ScreenerRow[], timestamp: number }>()
const CACHE_TTL = 12 * 60 * 60 * 1000 // 12 hours

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const refresh = searchParams.get('refresh') === '1'
    
    // Extract all possible filter parameters from URL
    const filters = {
      marketCapMoreThan: searchParams.get('marketCapMoreThan') || '1000000000', // Default $1B+
      marketCapLowerThan: searchParams.get('marketCapLowerThan'),
      priceMoreThan: searchParams.get('priceMoreThan'),
      priceLowerThan: searchParams.get('priceLowerThan'),
      volumeMoreThan: searchParams.get('volumeMoreThan'),
      volumeLowerThan: searchParams.get('volumeLowerThan'),
      betaMoreThan: searchParams.get('betaMoreThan'),
      betaLowerThan: searchParams.get('betaLowerThan'),
      dividendMoreThan: searchParams.get('dividendMoreThan'),
      dividendLowerThan: searchParams.get('dividendLowerThan'),
      sector: searchParams.get('sector'),
      industry: searchParams.get('industry'),
      country: searchParams.get('country') || 'US', // Default to US
      exchange: searchParams.get('exchange') || 'NYSE', // Default to NYSE for proper USD prices
      isEtf: searchParams.get('isEtf') || 'false', // Exclude ETFs by default
      isActivelyTrading: searchParams.get('isActivelyTrading') || 'true',
      isFund: searchParams.get('isFund') || 'false', // Exclude funds by default
      limit: searchParams.get('limit') || '503'
    }
    
    // Create cache key based on filters
    const cacheKey = `screener-${JSON.stringify(filters)}`
    const cached = cache.get(cacheKey)
    
    // Return cached data if valid and not refreshing
    if (!refresh && cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json({
        data: cached.data,
        cached: true,
        lastUpdate: new Date(cached.timestamp).toISOString(),
        filters: filters
      })
    }

    // Fetch real data from FMP Stock Screener API
    const FMP_API_KEY = process.env.FMP_API_KEY || 'N2s4mP85oHkr3DBawy2GrncqTTpakTBM'
    
    // Build query string with all filters
    const queryParams = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== '') {
        queryParams.append(key, value)
      }
    })
    queryParams.append('apikey', FMP_API_KEY)
    
    // Use FMP Stock Screener API with comprehensive filters
    const screenerResponse = await fetch(`https://financialmodelingprep.com/api/v3/stock-screener?${queryParams.toString()}`)
    
    if (!screenerResponse.ok) {
      throw new Error(`FMP Screener API error: ${screenerResponse.status}`)
    }

    const screenerResults = await screenerResponse.json()
    
    // Get symbols for fetching real-time price data
    const symbols = screenerResults.map((company: any) => company.symbol).filter(Boolean)
    
    // Fetch real-time price data with daily changes (batch request)
    let priceData: Record<string, any> = {}
    if (symbols.length > 0) {
      try {
        // FMP quotes endpoint supports multiple symbols (max ~100 per request)
        const symbolsQuery = symbols.slice(0, 100).join(',') // Limit to first 100 symbols
        const quotesResponse = await fetch(`https://financialmodelingprep.com/api/v3/quote/${symbolsQuery}?apikey=${FMP_API_KEY}`)
        
        if (quotesResponse.ok) {
          const quotes = await quotesResponse.json()
          // Convert array to object for easy lookup
          quotes.forEach((quote: any) => {
            if (quote.symbol) {
              priceData[quote.symbol] = quote
            }
          })
        }
      } catch (error) {
        console.warn('Failed to fetch real-time price data:', error)
      }
    }
    
    // Transform FMP screener data to our format
    const screenerData: ScreenerRow[] = screenerResults.map((company: any) => {
      // Get real-time price data for this symbol
      const quote = priceData[company.symbol]
      
      // Calculate 52-week position if we have the data
      let week52Position: number | undefined
      if (company.yearHigh && company.yearLow && company.price) {
        week52Position = (company.price - company.yearLow) / 
                        (company.yearHigh - company.yearLow)
      }

      // Calculate dividend yield from lastAnnualDividend
      let dividendYield: number | undefined
      if (company.lastAnnualDividend && company.price && company.price > 0) {
        dividendYield = company.lastAnnualDividend / company.price
      }

      return {
        symbol: company.symbol || 'N/A',
        name: company.companyName || 'N/A',
        sector: company.sector || 'Unknown',
        industry: company.industry || 'N/A',
        price: quote?.price || company.price || 0,
        changePct: quote?.changesPercentage ? quote.changesPercentage / 100 : 0, // Convert percentage to decimal
        marketCap: company.marketCap || 0,
        pe: company.pe,
        forwardPE: null, // Not available in screener endpoint
        ps: null, // Not available in screener endpoint  
        pb: null, // Not available in screener endpoint
        dividendYield: dividendYield,
        beta: company.beta,
        week52Position,
        revenueGrowthTTM: null, // Not available in screener endpoint
        netMarginTTM: null, // Not available in screener endpoint
        roeTTM: null, // Not available in screener endpoint
        roaTTM: null, // Not available in screener endpoint
        evEbitda: null, // Not available in screener endpoint
        volume: quote?.volume || company.volume || 0,
        avgVolume: company.avgVolume || 0,
        week52High: company.yearHigh,
        week52Low: company.yearLow,
        ev: null, // Not available in screener endpoint
        ebitda: null, // Not available in screener endpoint
        // Generate mock sparkline for now (replace with real historical data later)
        sparkline: generateMockSparkline(company.price || 100)
      }
    }).filter(company => company.symbol !== 'N/A') // Filter out invalid entries

    // Cache the results
    cache.set(cacheKey, {
      data: screenerData,
      timestamp: Date.now()
    })

    return NextResponse.json({
      data: screenerData,
      cached: false,
      lastUpdate: new Date().toISOString(),
      count: screenerData.length,
      filters: filters,
      totalAvailable: screenerResults.length
    })

  } catch (error) {
    console.error('Screener API error:', error)
    
    // Return mock data if FMP key is missing or in development
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({
        data: getMockData(),
        cached: false,
        lastUpdate: new Date().toISOString(),
        mock: true
      })
    }

    return NextResponse.json(
      { error: 'Failed to fetch screener data' },
      { status: 500 }
    )
  }
}

// Generate mock sparkline data (replace with real historical data later)
function generateMockSparkline(currentPrice: number): number[] {
  const points = 30 // 30 days
  const data: number[] = []
  let price = currentPrice * 0.9 // Start 10% lower
  
  for (let i = 0; i < points; i++) {
    // Add some random variation
    const change = (Math.random() - 0.5) * 0.05 // ±2.5% daily variation
    price = price * (1 + change)
    data.push(Math.round(price * 100) / 100)
  }
  
  // Ensure last point is close to current price
  data[data.length - 1] = currentPrice
  
  return data
}

// Enhanced mock data with 100+ S&P 500 companies
function getEnhancedMockData(): ScreenerRow[] {
  const companies = [
    { symbol: 'AAPL', name: 'Apple Inc.', sector: 'Technology', industry: 'Consumer Electronics', price: 175.43, changePct: 1.24, marketCap: 2750000000000, pe: 28.5 },
    { symbol: 'MSFT', name: 'Microsoft Corporation', sector: 'Technology', industry: 'Software', price: 378.85, changePct: 0.67, marketCap: 2810000000000, pe: 32.1 },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', sector: 'Technology', industry: 'Internet Content', price: 142.56, changePct: -0.45, marketCap: 1780000000000, pe: 25.8 },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', sector: 'Consumer Cyclical', industry: 'Internet Retail', price: 153.32, changePct: 0.89, marketCap: 1590000000000, pe: 52.1 },
    { symbol: 'NVDA', name: 'NVIDIA Corporation', sector: 'Technology', industry: 'Semiconductors', price: 875.28, changePct: 2.15, marketCap: 2160000000000, pe: 65.2 },
    { symbol: 'TSLA', name: 'Tesla Inc.', sector: 'Consumer Cyclical', industry: 'Auto Manufacturers', price: 248.50, changePct: -1.23, marketCap: 790000000000, pe: 78.9 },
    { symbol: 'META', name: 'Meta Platforms Inc.', sector: 'Technology', industry: 'Internet Content', price: 325.67, changePct: 1.45, marketCap: 820000000000, pe: 24.3 },
    { symbol: 'BRK.B', name: 'Berkshire Hathaway Inc.', sector: 'Financial Services', industry: 'Insurance', price: 432.10, changePct: 0.34, marketCap: 780000000000, pe: 8.9 },
    { symbol: 'UNH', name: 'UnitedHealth Group Inc.', sector: 'Healthcare', industry: 'Healthcare Plans', price: 542.33, changePct: -0.67, marketCap: 510000000000, pe: 22.1 },
    { symbol: 'JNJ', name: 'Johnson & Johnson', sector: 'Healthcare', industry: 'Drug Manufacturers', price: 162.45, changePct: 0.23, marketCap: 420000000000, pe: 15.6 },
    { symbol: 'V', name: 'Visa Inc.', sector: 'Financial Services', industry: 'Credit Services', price: 267.89, changePct: 0.78, marketCap: 580000000000, pe: 33.4 },
    { symbol: 'PG', name: 'Procter & Gamble Co.', sector: 'Consumer Defensive', industry: 'Household Products', price: 155.23, changePct: -0.12, marketCap: 370000000000, pe: 26.7 },
    { symbol: 'JPM', name: 'JPMorgan Chase & Co.', sector: 'Financial Services', industry: 'Banks', price: 178.90, changePct: 1.56, marketCap: 520000000000, pe: 12.8 },
    { symbol: 'MA', name: 'Mastercard Inc.', sector: 'Financial Services', industry: 'Credit Services', price: 456.78, changePct: 0.89, marketCap: 440000000000, pe: 35.2 },
    { symbol: 'HD', name: 'Home Depot Inc.', sector: 'Consumer Cyclical', industry: 'Home Improvement', price: 334.56, changePct: -0.45, marketCap: 340000000000, pe: 22.9 },
    { symbol: 'CVX', name: 'Chevron Corporation', sector: 'Energy', industry: 'Oil & Gas', price: 156.78, changePct: 2.34, marketCap: 290000000000, pe: 14.5 },
    { symbol: 'MRK', name: 'Merck & Co. Inc.', sector: 'Healthcare', industry: 'Drug Manufacturers', price: 108.90, changePct: -1.23, marketCap: 280000000000, pe: 16.8 },
    { symbol: 'ABBV', name: 'AbbVie Inc.', sector: 'Healthcare', industry: 'Drug Manufacturers', price: 167.45, changePct: 0.67, marketCap: 295000000000, pe: 15.9 },
    { symbol: 'LLY', name: 'Eli Lilly and Co.', sector: 'Healthcare', industry: 'Drug Manufacturers', price: 598.23, changePct: 1.89, marketCap: 570000000000, pe: 45.6 },
    { symbol: 'KO', name: 'Coca-Cola Co.', sector: 'Consumer Defensive', industry: 'Beverages', price: 62.34, changePct: 0.12, marketCap: 270000000000, pe: 24.1 },
    { symbol: 'PEP', name: 'PepsiCo Inc.', sector: 'Consumer Defensive', industry: 'Beverages', price: 171.23, changePct: -0.34, marketCap: 235000000000, pe: 25.3 },
    { symbol: 'TMO', name: 'Thermo Fisher Scientific', sector: 'Healthcare', industry: 'Diagnostics', price: 523.45, changePct: 0.78, marketCap: 205000000000, pe: 28.9 },
    { symbol: 'COST', name: 'Costco Wholesale Corp.', sector: 'Consumer Defensive', industry: 'Discount Stores', price: 789.12, changePct: 1.23, marketCap: 350000000000, pe: 42.1 },
    { symbol: 'AVGO', name: 'Broadcom Inc.', sector: 'Technology', industry: 'Semiconductors', price: 1234.56, changePct: 2.45, marketCap: 580000000000, pe: 31.2 },
    { symbol: 'WMT', name: 'Walmart Inc.', sector: 'Consumer Defensive', industry: 'Discount Stores', price: 159.78, changePct: 0.45, marketCap: 430000000000, pe: 27.8 },
    { symbol: 'XOM', name: 'Exxon Mobil Corp.', sector: 'Energy', industry: 'Oil & Gas', price: 112.34, changePct: 1.67, marketCap: 470000000000, pe: 13.9 },
    { symbol: 'ORCL', name: 'Oracle Corporation', sector: 'Technology', industry: 'Software', price: 118.90, changePct: -0.89, marketCap: 325000000000, pe: 29.4 },
    { symbol: 'ACN', name: 'Accenture plc', sector: 'Technology', industry: 'IT Services', price: 345.67, changePct: 0.56, marketCap: 220000000000, pe: 26.7 },
    { symbol: 'CRM', name: 'Salesforce Inc.', sector: 'Technology', industry: 'Software', price: 267.89, changePct: 1.34, marketCap: 260000000000, pe: 48.9 },
    { symbol: 'NFLX', name: 'Netflix Inc.', sector: 'Communication Services', industry: 'Entertainment', price: 456.78, changePct: -1.45, marketCap: 200000000000, pe: 34.5 },
    { symbol: 'ADBE', name: 'Adobe Inc.', sector: 'Technology', industry: 'Software', price: 567.89, changePct: 0.78, marketCap: 260000000000, pe: 41.2 },
    { symbol: 'TXN', name: 'Texas Instruments Inc.', sector: 'Technology', industry: 'Semiconductors', price: 178.90, changePct: -0.23, marketCap: 165000000000, pe: 21.8 },
    { symbol: 'QCOM', name: 'QUALCOMM Inc.', sector: 'Technology', industry: 'Semiconductors', price: 145.67, changePct: 1.89, marketCap: 163000000000, pe: 18.9 },
    { symbol: 'NKE', name: 'NIKE Inc.', sector: 'Consumer Cyclical', industry: 'Apparel', price: 98.45, changePct: -0.67, marketCap: 155000000000, pe: 31.4 },
    { symbol: 'DHR', name: 'Danaher Corporation', sector: 'Healthcare', industry: 'Diagnostics', price: 234.56, changePct: 0.89, marketCap: 170000000000, pe: 33.7 },
    { symbol: 'VZ', name: 'Verizon Communications', sector: 'Communication Services', industry: 'Telecom', price: 40.23, changePct: 0.12, marketCap: 169000000000, pe: 8.9 },
    { symbol: 'UPS', name: 'United Parcel Service', sector: 'Industrials', industry: 'Logistics', price: 156.78, changePct: -1.23, marketCap: 135000000000, pe: 19.8 },
    { symbol: 'PM', name: 'Philip Morris International', sector: 'Consumer Defensive', industry: 'Tobacco', price: 98.90, changePct: 0.45, marketCap: 154000000000, pe: 17.2 },
    { symbol: 'RTX', name: 'Raytheon Technologies', sector: 'Industrials', industry: 'Aerospace & Defense', price: 89.45, changePct: 1.23, marketCap: 130000000000, pe: 22.1 },
    { symbol: 'LOW', name: 'Lowes Companies Inc.', sector: 'Consumer Cyclical', industry: 'Home Improvement', price: 234.67, changePct: -0.56, marketCap: 145000000000, pe: 20.9 },
    { symbol: 'SPGI', name: 'S&P Global Inc.', sector: 'Financial Services', industry: 'Financial Data', price: 423.45, changePct: 0.78, marketCap: 128000000000, pe: 35.6 },
    { symbol: 'CAT', name: 'Caterpillar Inc.', sector: 'Industrials', industry: 'Construction', price: 267.89, changePct: 1.45, marketCap: 142000000000, pe: 16.8 },
    { symbol: 'GS', name: 'Goldman Sachs Group', sector: 'Financial Services', industry: 'Investment Banking', price: 345.67, changePct: -0.89, marketCap: 118000000000, pe: 11.2 },
    { symbol: 'HON', name: 'Honeywell International', sector: 'Industrials', industry: 'Conglomerates', price: 198.90, changePct: 0.34, marketCap: 135000000000, pe: 24.7 },
    { symbol: 'AXP', name: 'American Express Co.', sector: 'Financial Services', industry: 'Credit Services', price: 178.45, changePct: 1.67, marketCap: 132000000000, pe: 17.9 },
    { symbol: 'BLK', name: 'BlackRock Inc.', sector: 'Financial Services', industry: 'Asset Management', price: 789.12, changePct: -0.23, marketCap: 120000000000, pe: 22.4 },
    { symbol: 'AMD', name: 'Advanced Micro Devices', sector: 'Technology', industry: 'Semiconductors', price: 145.67, changePct: 2.89, marketCap: 235000000000, pe: 48.9 },
    { symbol: 'INTC', name: 'Intel Corporation', sector: 'Technology', industry: 'Semiconductors', price: 34.56, changePct: -1.45, marketCap: 145000000000, pe: 15.2 },
    { symbol: 'IBM', name: 'International Business Machines', sector: 'Technology', industry: 'IT Services', price: 156.78, changePct: 0.67, marketCap: 145000000000, pe: 21.8 },
    { symbol: 'AMGN', name: 'Amgen Inc.', sector: 'Healthcare', industry: 'Biotechnology', price: 267.89, changePct: -0.34, marketCap: 148000000000, pe: 14.9 },
    { symbol: 'COP', name: 'ConocoPhillips', sector: 'Energy', industry: 'Oil & Gas', price: 123.45, changePct: 1.89, marketCap: 155000000000, pe: 12.1 },
    { symbol: 'SBUX', name: 'Starbucks Corporation', sector: 'Consumer Cyclical', industry: 'Restaurants', price: 98.90, changePct: -0.78, marketCap: 115000000000, pe: 28.7 }
  ]

  return companies.map(company => ({
    symbol: company.symbol,
    name: company.name,
    sector: company.sector,
    industry: company.industry,
    price: company.price,
    changePct: company.changePct,
    marketCap: company.marketCap,
    pe: company.pe,
    forwardPE: company.pe * 0.9, // Estimate
    ps: Math.random() * 10 + 1, // Random PS ratio
    pb: Math.random() * 5 + 1, // Random PB ratio
    dividendYield: Math.random() * 0.05, // Random dividend yield
    beta: Math.random() * 2 + 0.5, // Random beta
    week52Position: Math.random(), // Random position
    revenueGrowthTTM: (Math.random() - 0.5) * 0.4, // Random growth
    netMarginTTM: Math.random() * 0.3, // Random margin
    roeTTM: Math.random() * 0.4, // Random ROE
    roaTTM: Math.random() * 0.2, // Random ROA
    evEbitda: Math.random() * 30 + 5, // Random EV/EBITDA
    avgVolume: Math.floor(Math.random() * 50000000 + 1000000), // Random volume
    week52High: company.price * (1 + Math.random() * 0.3), // 52-week high
    week52Low: company.price * (1 - Math.random() * 0.3), // 52-week low
    ev: company.marketCap * (1 + Math.random() * 0.2), // Enterprise value
    ebitda: company.marketCap * (Math.random() * 0.15 + 0.05), // EBITDA
    sparkline: generateMockSparkline(company.price)
  }))
}

// Mock data for development (fallback)
function getMockData(): ScreenerRow[] {
  return getEnhancedMockData().slice(0, 10) // Return first 10 for fallback
}
