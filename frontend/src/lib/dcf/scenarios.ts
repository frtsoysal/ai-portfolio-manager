/**
 * Scenario Analysis Module
 * 
 * Handles creation and analysis of different DCF scenarios
 */

import { DCFData, DCFInputs, ValuationResults, Scenario } from '@/types/dcf'
import { runScenario } from './index'

/**
 * Create predefined scenarios based on base case inputs
 */
export const createPredefinedScenarios = (
  dcfData: DCFData,
  baseInputs: DCFInputs
): Scenario[] => {
  const scenarios: Scenario[] = []

  // Base Case - empty inputs means use original model as-is
  scenarios.push({
    name: 'Base Case',
    description: 'Original model assumptions without modifications',
    inputs: {} // Empty inputs = no changes to base model
  })

  // Bull Case - Optimistic scenario
  scenarios.push({
    name: 'Bull Case',
    description: 'Optimistic growth, higher margins, lower discount rate',
    inputs: {
      revenueGrowthRates: baseInputs.revenueGrowthRates.map(rate => rate * 1.5), // 50% higher growth
      operatingMargins: baseInputs.operatingMargins.map(margin => Math.min(margin * 1.2, 0.5)), // 20% higher margins, capped at 50%
      terminalGrowthRate: Math.min(baseInputs.terminalGrowthRate * 1.3, 0.05), // Higher terminal growth, capped at 5%
      beta: Math.max(baseInputs.beta * 0.9, 0.5), // Lower beta (less risky)
      capexPercent: baseInputs.capexPercent.map(capex => capex * 0.8), // Lower capex needs
      taxRate: baseInputs.taxRate * 1.1 // Slightly higher tax rate (more conservative)
    }
  })

  // Bear Case - Conservative scenario
  scenarios.push({
    name: 'Bear Case',
    description: 'Conservative growth, margin pressure, higher discount rate',
    inputs: {
      revenueGrowthRates: baseInputs.revenueGrowthRates.map(rate => Math.max(rate * 0.5, 0)), // 50% lower growth
      operatingMargins: baseInputs.operatingMargins.map(margin => margin * 0.8), // 20% lower margins
      terminalGrowthRate: Math.max(baseInputs.terminalGrowthRate * 0.7, 0.01), // Lower terminal growth, min 1%
      beta: baseInputs.beta * 1.2, // Higher beta (more risky)
      capexPercent: baseInputs.capexPercent.map(capex => capex * 1.3), // Higher capex needs
      costOfDebt: baseInputs.costOfDebt * 1.5 // Higher cost of debt
    }
  })

  // High Growth Case
  scenarios.push({
    name: 'High Growth',
    description: 'Sustained high growth with margin expansion',
    inputs: {
      revenueGrowthRates: Array(baseInputs.forecastPeriod).fill(0).map((_, i) => {
        const baseGrowth = 0.15 // Start with 15% growth
        const fadeRate = 0.02 // Fade by 2% each year
        return Math.max(baseGrowth - (i * fadeRate), 0.03)
      }),
      operatingMargins: baseInputs.operatingMargins.map((margin, i) => {
        return Math.min(margin + (i * 0.01), 0.4) // Gradual margin expansion
      }),
      terminalGrowthRate: 0.04 // 4% terminal growth
    }
  })

  // Recession Case
  scenarios.push({
    name: 'Recession',
    description: 'Economic downturn with reduced growth and margins',
    inputs: {
      revenueGrowthRates: baseInputs.revenueGrowthRates.map((rate, i) => {
        if (i < 2) return Math.max(rate - 0.1, -0.05) // Negative growth in first 2 years
        return Math.max(rate * 0.6, 0.01) // Slow recovery
      }),
      operatingMargins: baseInputs.operatingMargins.map(margin => margin * 0.7), // Significant margin compression
      terminalGrowthRate: 0.02, // Lower long-term growth
      riskFreeRate: Math.max(baseInputs.riskFreeRate - 0.01, 0.01), // Lower risk-free rate
      equityRiskPremium: baseInputs.equityRiskPremium * 1.5 // Higher risk premium
    }
  })

  return scenarios
}

/**
 * Run sensitivity analysis on two parameters
 */
export const runSensitivityAnalysis = (
  dcfData: DCFData,
  baseInputs: DCFInputs,
  param1: keyof DCFInputs,
  param2: keyof DCFInputs,
  param1Range: { min: number, max: number, steps: number },
  param2Range: { min: number, max: number, steps: number }
): {
  param1Name: keyof DCFInputs
  param2Name: keyof DCFInputs
  param1Values: number[]
  param2Values: number[]
  results: number[][]
  baseCase: { param1: number, param2: number, value: number }
} => {
  // Generate parameter value arrays
  const param1Values: number[] = []
  const param2Values: number[] = []

  for (let i = 0; i < param1Range.steps; i++) {
    const value = param1Range.min + (param1Range.max - param1Range.min) * (i / (param1Range.steps - 1))
    param1Values.push(value)
  }

  for (let i = 0; i < param2Range.steps; i++) {
    const value = param2Range.min + (param2Range.max - param2Range.min) * (i / (param2Range.steps - 1))
    param2Values.push(value)
  }

  // Run scenarios for each combination
  const results: number[][] = []
  
  for (let i = 0; i < param1Values.length; i++) {
    const row: number[] = []
    
    for (let j = 0; j < param2Values.length; j++) {
      const scenarioInputs: Partial<DCFInputs> = {
        [param1]: param1Values[i],
        [param2]: param2Values[j]
      }
      
      try {
        const valuation = runScenario(dcfData, { inputs: baseInputs, projections: [], valuation: {} as ValuationResults }, scenarioInputs)
        row.push(valuation.valuePerShare)
      } catch (error) {
        row.push(0) // Error case
      }
    }
    
    results.push(row)
  }

  // Get base case values
  const baseParam1 = baseInputs[param1] as number
  const baseParam2 = baseInputs[param2] as number
  const baseValuation = runScenario(dcfData, { inputs: baseInputs, projections: [], valuation: {} as ValuationResults }, {})

  return {
    param1Name: param1,
    param2Name: param2,
    param1Values,
    param2Values,
    results,
    baseCase: {
      param1: baseParam1,
      param2: baseParam2,
      value: baseValuation.valuePerShare
    }
  }
}

/**
 * Calculate tornado chart data for parameter sensitivity
 */
export const calculateTornadoChart = (
  dcfData: DCFData,
  baseInputs: DCFInputs,
  parameters: Array<{
    name: keyof DCFInputs
    label: string
    variation: number // +/- percentage variation
  }>
): Array<{
  parameter: string
  baseValue: number
  lowValue: number
  highValue: number
  lowPrice: number
  highPrice: number
  impact: number
}> => {
  const baseValuation = runScenario(dcfData, { inputs: baseInputs, projections: [], valuation: {} as ValuationResults }, {})
  const basePrice = baseValuation.valuePerShare

  return parameters.map(param => {
    const baseValue = baseInputs[param.name] as number
    const lowValue = baseValue * (1 - param.variation)
    const highValue = baseValue * (1 + param.variation)

    // Run low scenario
    const lowScenario = runScenario(dcfData, { inputs: baseInputs, projections: [], valuation: {} as ValuationResults }, {
      [param.name]: lowValue
    })

    // Run high scenario
    const highScenario = runScenario(dcfData, { inputs: baseInputs, projections: [], valuation: {} as ValuationResults }, {
      [param.name]: highValue
    })

    const impact = Math.abs(highScenario.valuePerShare - lowScenario.valuePerShare)

    return {
      parameter: param.label,
      baseValue,
      lowValue,
      highValue,
      lowPrice: lowScenario.valuePerShare,
      highPrice: highScenario.valuePerShare,
      impact
    }
  }).sort((a, b) => b.impact - a.impact) // Sort by impact (highest first)
}

/**
 * Monte Carlo simulation (simplified)
 */
export const runMonteCarloSimulation = (
  dcfData: DCFData,
  baseInputs: DCFInputs,
  parameters: Array<{
    name: keyof DCFInputs
    distribution: 'normal' | 'uniform'
    mean?: number
    stdDev?: number
    min?: number
    max?: number
  }>,
  iterations: number = 1000
): {
  results: number[]
  statistics: {
    mean: number
    median: number
    stdDev: number
    percentiles: { p10: number, p25: number, p75: number, p90: number }
    probability: { above0: number, above10: number, above20: number }
  }
} => {
  const results: number[] = []

  for (let i = 0; i < iterations; i++) {
    const scenarioInputs: Partial<DCFInputs> = {}

    // Generate random values for each parameter
    parameters.forEach(param => {
      const baseValue = (baseInputs[param.name] as number) || param.mean || 0

      let randomValue: number

      if (param.distribution === 'normal') {
        // Simple Box-Muller transformation for normal distribution
        const u1 = Math.random()
        const u2 = Math.random()
        const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
        randomValue = (param.mean || baseValue) + z0 * (param.stdDev || baseValue * 0.1)
      } else {
        // Uniform distribution
        const min = param.min || baseValue * 0.8
        const max = param.max || baseValue * 1.2
        randomValue = min + Math.random() * (max - min)
      }

      (scenarioInputs as any)[param.name] = randomValue
    })

    try {
      const valuation = runScenario(dcfData, { inputs: baseInputs, projections: [], valuation: {} as ValuationResults }, scenarioInputs)
      results.push(valuation.valuePerShare)
    } catch (error) {
      // Skip failed iterations
    }
  }

  // Calculate statistics
  const sortedResults = results.sort((a, b) => a - b)
  const mean = results.reduce((sum, val) => sum + val, 0) / results.length
  const median = sortedResults[Math.floor(sortedResults.length / 2)]
  
  const variance = results.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / results.length
  const stdDev = Math.sqrt(variance)

  const p10 = sortedResults[Math.floor(sortedResults.length * 0.1)]
  const p25 = sortedResults[Math.floor(sortedResults.length * 0.25)]
  const p75 = sortedResults[Math.floor(sortedResults.length * 0.75)]
  const p90 = sortedResults[Math.floor(sortedResults.length * 0.9)]

  const currentPrice = dcfData.market.currentPrice
  const above0 = results.filter(r => r > currentPrice).length / results.length
  const above10 = results.filter(r => r > currentPrice * 1.1).length / results.length
  const above20 = results.filter(r => r > currentPrice * 1.2).length / results.length

  return {
    results: sortedResults,
    statistics: {
      mean,
      median,
      stdDev,
      percentiles: { p10, p25, p75, p90 },
      probability: { above0, above10, above20 }
    }
  }
}
