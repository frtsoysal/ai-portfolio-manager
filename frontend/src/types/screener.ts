export interface ScreenerRow {
  symbol: string
  company_name: string
  sector: string
  industry: string
  market_cap: number
  current_price: number
  day_change_percent: number
  pe_ratio: number | null
  pb_ratio: number | null
  ps_ratio: number | null
  roe: number | null
  roa: number | null
  debt_equity: number | null
  dividend_yield: number | null
  beta: number | null
  week52_high: number | null
  week52_low: number | null
  avg_volume: number | null
  enterprise_value: number | null
  ebitda: number | null
  revenue_growth_ttm: number | null
  net_margin: number | null
  data_quality: string
}

export interface ScreenerResponse {
  companies: ScreenerRow[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
  filters_applied: {
    sector: string | null
    min_market_cap: number | null
    max_market_cap: number | null
    min_pe: number | null
    max_pe: number | null
    min_dividend: number | null
  }
}