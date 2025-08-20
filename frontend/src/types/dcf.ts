/**
 * DCF Model Types
 */

// Company profile data
export interface Company {
  symbol: string
  name: string
  sector: string
  industry: string
  country: string
  currency: string
  sharesOutstanding: number
  dilutedShares: number
}

// Historical financial data
export interface HistoricalFinancials {
  year: number
  revenue: number
  cogs: number
  grossProfit: number
  operatingExpenses: number
  ebit: number
  taxExpense: number
  effectiveTaxRate: number
  nopat: number
  depreciation: number
  capex: number
  changeInWorkingCapital: number
  stockBasedCompensation: number
  leasePayments: number
  fcff: number
  totalDebt: number
  cash: number
  netDebt: number
  minorityInterest: number
  investments: number
}

// Market data
export interface MarketData {
  currentPrice: number
  marketCap: number
  enterpriseValue: number
  beta: number
  riskFreeRate: number
  equityRiskPremium: number
  currency: string
  lastUpdated: string
}

// Price history
export interface PriceHistory {
  date: string
  close: number
}

// DCF data (from API)
export interface DCFData {
  company: Company
  historical: HistoricalFinancials[]
  market: MarketData
  priceHistory: PriceHistory[]
  sparkline: number[]
}

// DCF Model Inputs
export interface DCFInputs {
  // General inputs
  forecastPeriod: number
  terminalMethod: 'gordon' | 'exitMultiple'
  
  // WACC components
  riskFreeRate: number
  equityRiskPremium: number
  beta: number
  costOfDebt: number
  taxRate: number
  targetDebtToCapital: number
  
  // Growth assumptions
  revenueGrowthRates: number[]
  terminalGrowthRate: number
  exitMultiple: number
  
  // Margin assumptions
  grossMargins: number[]
  operatingMargins: number[]
  
  // Capital efficiency
  depreciationPercent: number[]
  capexPercent: number[]
  nwcPercent: number[]
  
  // Other
  stockCompensationPercent: number[]
  leaseAdjustment: boolean
  includeStockCompensation: boolean
  
  // Adjustments
  cashAdjustment: boolean
  debtAdjustment: boolean
  minorityInterestAdjustment: boolean
  investmentsAdjustment: boolean
}

// DCF Projection Line
export interface ProjectionLine {
  year: number | string
  isHistory: boolean
  isTerminal: boolean
  
  // Income statement
  revenue: number
  revenueGrowth: number
  cogs: number
  grossProfit: number
  grossMargin: number
  operatingExpenses: number
  ebit: number
  operatingMargin: number
  
  // Cash flow items
  taxRate: number
  taxes: number
  nopat: number
  depreciation: number
  capex: number
  changeInWorkingCapital: number
  stockCompensation: number
  fcff: number
  
  // Valuation
  discountFactor: number
  discountedFcff: number
  terminalValue?: number
  discountedTerminalValue?: number
}

// DCF Valuation Results
export interface ValuationResults {
  // WACC components
  costOfEquity: number
  costOfDebt: number
  wacc: number
  
  // Present values
  pvFcff: number
  pvTerminal: number
  enterpriseValue: number
  
  // Adjustments
  netDebt: number
  cash: number
  debt: number
  minorityInterest: number
  investments: number
  
  // Equity value
  equityValue: number
  sharesOutstanding: number
  valuePerShare: number
  currentPrice: number
  upside: number
  
  // Metrics
  impliedEVRevenue: number
  impliedEVEBIT: number
  impliedPE: number
  
  // Terminal metrics
  terminalEVRevenue: number
  terminalEVEBIT: number
  terminalFcffYield: number
  
  // Model summary
  forecastPeriod: number
  terminalMethod: string
  terminalGrowthRate?: number
  exitMultiple?: number
  revenueCAGR: number
  averageMargin: number
}

// Complete DCF Model
export interface DCFModel {
  inputs: DCFInputs
  projections: ProjectionLine[]
  valuation: ValuationResults
}

export interface Scenario {
  name: string
  description: string
  inputs: Partial<DCFInputs>
  valuation?: ValuationResults
}