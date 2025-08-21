/**
 * DCF Projections Module
 * 
 * Handles forecasting of financial metrics for DCF model
 */

import { DCFData, DCFInputs, HistoricalFinancials, ProjectionLine } from '@/types/dcf'

/**
 * Calculate compound annual growth rate (CAGR)
 */
export const calculateCAGR = (
  startValue: number,
  endValue: number,
  years: number
): number => {
  if (startValue <= 0 || years === 0) return 0
  return Math.pow(endValue / startValue, 1 / years) - 1
}

/**
 * Calculate average of an array of numbers
 */
export const calculateAverage = (values: number[]): number => {
  if (values.length === 0) return 0
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

/**
 * Calculate median of an array of numbers
 */
export const calculateMedian = (values: number[]): number => {
  if (values.length === 0) return 0
  
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  
  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2
  }
  
  return sorted[middle]
}

/**
 * Generate historical data for projections
 */
export const generateHistoricalProjections = (
  historical: HistoricalFinancials[]
): ProjectionLine[] => {
  if (!historical || historical.length === 0) {
    return []
  }
  
  // Sort historical data by year (ascending)
  const sortedHistorical = [...historical].sort((a, b) => a.year - b.year)
  
  return sortedHistorical.map((item, index) => {
    // Calculate growth rates (if previous year exists)
    const prevItem = index > 0 ? sortedHistorical[index - 1] : null
    const revenueGrowth = prevItem ? (item.revenue / prevItem.revenue) - 1 : 0
    
    // Calculate margins
    const grossMargin = item.revenue > 0 ? item.grossProfit / item.revenue : 0
    const operatingMargin = item.revenue > 0 ? item.ebit / item.revenue : 0
    
    return {
      year: item.year,
      isHistory: true,
      isTerminal: false,
      
      // Income statement
      revenue: item.revenue,
      revenueGrowth,
      cogs: item.cogs,
      grossProfit: item.grossProfit,
      grossMargin,
      operatingExpenses: item.operatingExpenses,
      ebit: item.ebit,
      operatingMargin,
      
      // Cash flow items
      taxRate: item.effectiveTaxRate,
      taxes: item.taxExpense,
      nopat: item.nopat,
      depreciation: item.depreciation,
      capex: item.capex,
      changeInWorkingCapital: item.changeInWorkingCapital,
      stockCompensation: item.stockBasedCompensation,
      fcff: item.fcff,
      
      // Valuation (not applicable for historical)
      discountFactor: 1,
      discountedFcff: 0
    }
  })
}

/**
 * Generate forecast projections based on inputs
 */
export const generateForecastProjections = (
  historicalProjections: ProjectionLine[],
  inputs: DCFInputs,
  wacc: number
): ProjectionLine[] => {
  if (historicalProjections.length === 0) {
    return []
  }
  
  const lastHistorical = historicalProjections[historicalProjections.length - 1]
  const currentYear = new Date().getFullYear()
  const projections: ProjectionLine[] = []
  
  // Generate forecast for each year
  for (let i = 0; i < inputs.forecastPeriod; i++) {
    const forecastYear = currentYear + i + 1
    const isTerminal = i === inputs.forecastPeriod - 1
    
    // Get previous projection (or last historical for first year)
    const prev = i === 0 ? lastHistorical : projections[i - 1]
    
    // Revenue growth (use input or last available)
    const revenueGrowth = inputs.revenueGrowthRates[i] !== undefined 
      ? inputs.revenueGrowthRates[i] 
      : (inputs.revenueGrowthRates[inputs.revenueGrowthRates.length - 1] || 0)
    
    // Revenue
    const revenue = prev.revenue * (1 + revenueGrowth)
    
    // Margins (use input or last available)
    const grossMargin = inputs.grossMargins[i] !== undefined 
      ? inputs.grossMargins[i] 
      : (inputs.grossMargins[inputs.grossMargins.length - 1] || prev.grossMargin)
    
    const operatingMargin = inputs.operatingMargins[i] !== undefined 
      ? inputs.operatingMargins[i] 
      : (inputs.operatingMargins[inputs.operatingMargins.length - 1] || prev.operatingMargin)
    
    // Calculate income statement items
    const grossProfit = revenue * grossMargin
    const cogs = revenue - grossProfit
    const ebit = revenue * operatingMargin
    const operatingExpenses = grossProfit - ebit
    
    // Tax rate
    const taxRate = inputs.taxRate
    const taxes = ebit * taxRate
    const nopat = ebit * (1 - taxRate)
    
    // Capital expenditures
    const depreciationPercent = inputs.depreciationPercent[i] !== undefined 
      ? inputs.depreciationPercent[i] 
      : (inputs.depreciationPercent[inputs.depreciationPercent.length - 1] || 0)
    
    const capexPercent = inputs.capexPercent[i] !== undefined 
      ? inputs.capexPercent[i] 
      : (inputs.capexPercent[inputs.capexPercent.length - 1] || 0)
    
    const nwcPercent = inputs.nwcPercent[i] !== undefined 
      ? inputs.nwcPercent[i] 
      : (inputs.nwcPercent[inputs.nwcPercent.length - 1] || 0)
    
    const stockCompensationPercent = inputs.stockCompensationPercent[i] !== undefined 
      ? inputs.stockCompensationPercent[i] 
      : (inputs.stockCompensationPercent[inputs.stockCompensationPercent.length - 1] || 0)
    
    // Calculate cash flow items
    const depreciation = revenue * depreciationPercent
    const capex = revenue * capexPercent
    
    // Change in working capital (based on revenue growth)
    const revenueChange = revenue - prev.revenue
    const changeInWorkingCapital = revenueChange * nwcPercent
    
    // Stock-based compensation
    const stockCompensation = inputs.includeStockCompensation 
      ? revenue * stockCompensationPercent 
      : 0
    
    // Calculate FCFF
    const fcff = nopat + depreciation - capex - changeInWorkingCapital + stockCompensation
    
    // Discount factor and discounted FCFF
    const discountFactor = Math.pow(1 + wacc, i + 1)
    const discountedFcff = fcff / discountFactor
    
    projections.push({
      year: forecastYear,
      isHistory: false,
      isTerminal,
      
      // Income statement
      revenue,
      revenueGrowth,
      cogs,
      grossProfit,
      grossMargin,
      operatingExpenses,
      ebit,
      operatingMargin,
      
      // Cash flow items
      taxRate,
      taxes,
      nopat,
      depreciation,
      capex,
      changeInWorkingCapital,
      stockCompensation,
      fcff,
      
      // Valuation
      discountFactor,
      discountedFcff
    })
  }
  
  return projections
}

/**
 * Calculate historical growth rates and margins
 */
export const calculateHistoricalMetrics = (
  historical: HistoricalFinancials[]
): {
  revenueGrowthRates: number[]
  grossMargins: number[]
  operatingMargins: number[]
  depreciationPercent: number[]
  capexPercent: number[]
  nwcPercent: number[]
  stockCompensationPercent: number[]
  effectiveTaxRates: number[]
  averageRevenueGrowth: number
  averageGrossMargin: number
  averageOperatingMargin: number
  medianRevenueGrowth: number
  medianGrossMargin: number
  medianOperatingMargin: number
  revenueCAGR: number
} => {
  if (!historical || historical.length < 2) {
    return {
      revenueGrowthRates: [],
      grossMargins: [],
      operatingMargins: [],
      depreciationPercent: [],
      capexPercent: [],
      nwcPercent: [],
      stockCompensationPercent: [],
      effectiveTaxRates: [],
      averageRevenueGrowth: 0,
      averageGrossMargin: 0,
      averageOperatingMargin: 0,
      medianRevenueGrowth: 0,
      medianGrossMargin: 0,
      medianOperatingMargin: 0,
      revenueCAGR: 0
    }
  }
  
  // Sort historical data by year (ascending)
  const sortedHistorical = [...historical].sort((a, b) => a.year - b.year)
  
  // Calculate metrics for each year
  const revenueGrowthRates: number[] = []
  const grossMargins: number[] = []
  const operatingMargins: number[] = []
  const depreciationPercent: number[] = []
  const capexPercent: number[] = []
  const nwcPercent: number[] = []
  const stockCompensationPercent: number[] = []
  const effectiveTaxRates: number[] = []
  
  for (let i = 0; i < sortedHistorical.length; i++) {
    const current = sortedHistorical[i]
    
    // Calculate margins
    if (current.revenue > 0) {
      grossMargins.push(current.grossProfit / current.revenue)
      operatingMargins.push(current.ebit / current.revenue)
      depreciationPercent.push(current.depreciation / current.revenue)
      capexPercent.push(current.capex / current.revenue)
      stockCompensationPercent.push(current.stockBasedCompensation / current.revenue)
    }
    
    // Calculate growth rates (need previous year)
    if (i > 0) {
      const prev = sortedHistorical[i - 1]
      if (prev.revenue > 0) {
        revenueGrowthRates.push((current.revenue / prev.revenue) - 1)
      }
      
      // Calculate change in working capital as % of revenue change
      const revenueChange = current.revenue - prev.revenue
      if (revenueChange !== 0) {
        nwcPercent.push(current.changeInWorkingCapital / revenueChange)
      }
    }
    
    // Tax rates
    if (current.effectiveTaxRate >= 0 && current.effectiveTaxRate <= 1) {
      effectiveTaxRates.push(current.effectiveTaxRate)
    }
  }
  
  // Calculate CAGR
  const firstYear = sortedHistorical[0]
  const lastYear = sortedHistorical[sortedHistorical.length - 1]
  const years = lastYear.year - firstYear.year
  const revenueCAGR = calculateCAGR(firstYear.revenue, lastYear.revenue, years)
  
  // Calculate averages and medians
  const averageRevenueGrowth = calculateAverage(revenueGrowthRates)
  const averageGrossMargin = calculateAverage(grossMargins)
  const averageOperatingMargin = calculateAverage(operatingMargins)
  
  const medianRevenueGrowth = calculateMedian(revenueGrowthRates)
  const medianGrossMargin = calculateMedian(grossMargins)
  const medianOperatingMargin = calculateMedian(operatingMargins)
  
  return {
    revenueGrowthRates,
    grossMargins,
    operatingMargins,
    depreciationPercent,
    capexPercent,
    nwcPercent,
    stockCompensationPercent,
    effectiveTaxRates,
    averageRevenueGrowth,
    averageGrossMargin,
    averageOperatingMargin,
    medianRevenueGrowth,
    medianGrossMargin,
    medianOperatingMargin,
    revenueCAGR
  }
}

/**
 * Build default DCF inputs based on historical data
 */
export const buildDefaultInputs = (
  dcfData: DCFData
): DCFInputs => {
  // Calculate historical metrics
  const metrics = calculateHistoricalMetrics(dcfData.historical)
  
  // Default to 5-year forecast
  const forecastPeriod = 5
  
  // Default growth rates: start with historical average, then fade to 3%
  const startGrowth = Math.min(Math.max(metrics.medianRevenueGrowth, 0.03), 0.2)
  const terminalGrowthRate = 0.03 // 3% long-term growth
  
  const revenueGrowthRates = Array(forecastPeriod).fill(0).map((_, i) => {
    const fadeWeight = i / (forecastPeriod - 1)
    return startGrowth * (1 - fadeWeight) + terminalGrowthRate * fadeWeight
  })
  
  // Use median margins from historical data
  const grossMargins = Array(forecastPeriod).fill(metrics.medianGrossMargin || 0.4)
  const operatingMargins = Array(forecastPeriod).fill(metrics.medianOperatingMargin || 0.15)
  
  // Capital efficiency metrics
  const depreciationPercent = Array(forecastPeriod).fill(
    metrics.depreciationPercent.length > 0 
      ? calculateMedian(metrics.depreciationPercent) 
      : 0.03
  )
  
  const capexPercent = Array(forecastPeriod).fill(
    metrics.capexPercent.length > 0 
      ? calculateMedian(metrics.capexPercent) 
      : 0.04
  )
  
  const nwcPercent = Array(forecastPeriod).fill(
    metrics.nwcPercent.length > 0 
      ? calculateMedian(metrics.nwcPercent) 
      : 0.1
  )
  
  const stockCompensationPercent = Array(forecastPeriod).fill(
    metrics.stockCompensationPercent.length > 0 
      ? calculateMedian(metrics.stockCompensationPercent) 
      : 0.02
  )
  
  // WACC components
  const riskFreeRate = dcfData.market?.riskFreeRate || 0.0382 // 10-year Treasury yield
  const equityRiskPremium = dcfData.market?.equityRiskPremium || 0.0472 // Equity risk premium
  const beta = dcfData.market?.beta || 1.0 // Stock beta
  
  // Use median tax rate from historical data or default to 25%
  const taxRate = metrics.effectiveTaxRates.length > 0 
    ? calculateMedian(metrics.effectiveTaxRates) 
    : 0.25
  
  // Default to 20% debt in capital structure
  const targetDebtToCapital = 0.2
  
  // Default cost of debt based on risk-free rate plus spread
  const costOfDebt = riskFreeRate + 0.02 // Risk-free + 2% spread
  
  // Default to Gordon Growth for terminal value
  const terminalMethod = 'gordon' as const
  
  // Default exit multiple of 15x EBIT
  const exitMultiple = 15
  
  return {
    forecastPeriod,
    terminalMethod,
    riskFreeRate,
    equityRiskPremium,
    beta,
    costOfDebt,
    taxRate,
    targetDebtToCapital,
    revenueGrowthRates,
    terminalGrowthRate,
    exitMultiple,
    grossMargins,
    operatingMargins,
    depreciationPercent,
    capexPercent,
    nwcPercent,
    stockCompensationPercent,
    leaseAdjustment: true,
    includeStockCompensation: true,
    cashAdjustment: true,
    debtAdjustment: true,
    minorityInterestAdjustment: true,
    investmentsAdjustment: true
  }
}
