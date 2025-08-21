/**
 * DCF Valuation Module
 * 
 * Calculates enterprise value, equity value, and per share value
 */

import { DCFInputs, HistoricalFinancials, ProjectionLine, ValuationResults } from '@/types/dcf'
import { calculateFullWACC } from './wacc'
import { calculateCAGR, calculateAverage } from './projections'
import { calculateTerminalValue, calculateDiscountedTerminalValue, calculateTerminalMetrics } from './terminal'

/**
 * Calculate enterprise value from discounted cash flows
 */
export const calculateEnterpriseValue = (
  projections: ProjectionLine[],
  terminalValue: number
): number => {
  // Sum of all discounted FCFs
  const sumDiscountedFcff = projections.reduce((sum, projection) => {
    return sum + projection.discountedFcff
  }, 0)
  
  // Add discounted terminal value
  const terminalYear = projections[projections.length - 1]
  const discountedTerminalValue = calculateDiscountedTerminalValue(
    terminalValue,
    terminalYear.discountFactor
  )
  
  return sumDiscountedFcff + discountedTerminalValue
}

/**
 * Calculate equity value from enterprise value with adjustments
 */
export const calculateEquityValue = (
  enterpriseValue: number,
  latestFinancials: HistoricalFinancials,
  inputs: DCFInputs
): {
  equityValue: number
  adjustments: {
    cash: number
    debt: number
    netDebt: number
    minorityInterest: number
    investments: number
  }
} => {
  // Initialize adjustments
  let cash = 0
  let debt = 0
  let minorityInterest = 0
  let investments = 0
  
  // Apply adjustments based on inputs
  if (inputs.cashAdjustment) {
    cash = latestFinancials.cash
  }
  
  if (inputs.debtAdjustment) {
    debt = latestFinancials.totalDebt
  }
  
  if (inputs.minorityInterestAdjustment) {
    minorityInterest = latestFinancials.minorityInterest
  }
  
  if (inputs.investmentsAdjustment) {
    investments = latestFinancials.investments
  }
  
  const netDebt = debt - cash
  
  // Calculate equity value
  const equityValue = enterpriseValue - netDebt - minorityInterest + investments
  
  return {
    equityValue,
    adjustments: {
      cash,
      debt,
      netDebt,
      minorityInterest,
      investments
    }
  }
}

/**
 * Calculate per share value
 */
export const calculatePerShareValue = (
  equityValue: number,
  sharesOutstanding: number
): number => {
  return equityValue / sharesOutstanding
}

/**
 * Calculate implied multiples
 */
export const calculateImpliedMultiples = (
  enterpriseValue: number,
  latestProjection: ProjectionLine
): {
  impliedEVRevenue: number
  impliedEVEBIT: number
} => {
  const impliedEVRevenue = enterpriseValue / latestProjection.revenue
  const impliedEVEBIT = enterpriseValue / latestProjection.ebit
  
  return {
    impliedEVRevenue,
    impliedEVEBIT
  }
}

/**
 * Run the full DCF valuation
 */
export const runDCFValuation = (
  historicalProjections: ProjectionLine[],
  forecastProjections: ProjectionLine[],
  inputs: DCFInputs,
  currentPrice: number,
  sharesOutstanding: number,
  latestFinancials: HistoricalFinancials
): ValuationResults => {
  // Calculate WACC
  const { costOfEquity, afterTaxCostOfDebt, wacc } = calculateFullWACC(
    inputs.riskFreeRate,
    inputs.beta,
    inputs.equityRiskPremium,
    inputs.costOfDebt,
    inputs.taxRate,
    inputs.targetDebtToCapital
  )
  
  // Get terminal year
  const terminalYear = forecastProjections[forecastProjections.length - 1]
  
  // Calculate terminal value
  const terminalValue = calculateTerminalValue(
    terminalYear,
    wacc,
    inputs.terminalGrowthRate,
    inputs.exitMultiple,
    inputs.terminalMethod
  )
  
  // Calculate discounted terminal value
  const discountedTerminalValue = calculateDiscountedTerminalValue(
    terminalValue,
    terminalYear.discountFactor
  )
  
  // Calculate present value of forecast FCFs
  const pvFcff = forecastProjections.reduce((sum, projection) => {
    return sum + projection.discountedFcff
  }, 0)
  
  // Calculate enterprise value
  const enterpriseValue = pvFcff + discountedTerminalValue
  
  // Calculate equity value
  const { equityValue, adjustments } = calculateEquityValue(
    enterpriseValue,
    latestFinancials,
    inputs
  )
  
  // Calculate per share value
  const valuePerShare = calculatePerShareValue(equityValue, sharesOutstanding)
  
  // Calculate upside/downside
  const upside = (valuePerShare / currentPrice) - 1
  
  // Calculate implied multiples
  const { impliedEVRevenue, impliedEVEBIT } = calculateImpliedMultiples(
    enterpriseValue,
    historicalProjections[historicalProjections.length - 1] // Use latest historical
  )
  
  // Calculate implied P/E
  const impliedPE = valuePerShare / (historicalProjections[historicalProjections.length - 1].nopat / sharesOutstanding)
  
  // Calculate terminal metrics
  const terminalMetrics = calculateTerminalMetrics(terminalYear, terminalValue)
  
  // Calculate revenue CAGR
  const firstHistorical = historicalProjections[0]
  const lastForecast = forecastProjections[forecastProjections.length - 1]
  const totalYears = lastForecast.year as number - firstHistorical.year as number
  const revenueCAGR = calculateCAGR(firstHistorical.revenue, lastForecast.revenue, totalYears)
  
  // Calculate average operating margin
  const forecastMargins = forecastProjections.map(p => p.operatingMargin)
  const averageMargin = calculateAverage(forecastMargins)
  
  return {
    // WACC components
    costOfEquity,
    costOfDebt: inputs.costOfDebt,
    wacc,
    
    // Present values
    pvFcff,
    pvTerminal: discountedTerminalValue,
    enterpriseValue,
    
    // Adjustments
    netDebt: adjustments.netDebt,
    cash: adjustments.cash,
    debt: adjustments.debt,
    minorityInterest: adjustments.minorityInterest,
    investments: adjustments.investments,
    
    // Equity value
    equityValue,
    sharesOutstanding,
    valuePerShare,
    currentPrice,
    upside,
    
    // Implied multiples
    impliedEVRevenue,
    impliedEVEBIT,
    impliedPE,
    
    // Terminal metrics
    terminalEVRevenue: terminalMetrics.terminalEVRevenue,
    terminalEVEBIT: terminalMetrics.terminalEVEBIT,
    terminalFcffYield: terminalMetrics.terminalFcffYield,
    
    // Model summary
    forecastPeriod: inputs.forecastPeriod,
    terminalMethod: inputs.terminalMethod,
    terminalGrowthRate: inputs.terminalMethod === 'gordon' ? inputs.terminalGrowthRate : undefined,
    exitMultiple: inputs.terminalMethod === 'exitMultiple' ? inputs.exitMultiple : undefined,
    revenueCAGR,
    averageMargin
  }
}
