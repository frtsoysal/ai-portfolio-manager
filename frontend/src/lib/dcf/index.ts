/**
 * DCF Model Engine
 * 
 * Main entry point for DCF calculations
 */

import { DCFData, DCFInputs, DCFModel, ProjectionLine, ValuationResults } from '@/types/dcf'
import { buildDefaultInputs, generateHistoricalProjections, generateForecastProjections } from './projections'
import { calculateFullWACC } from './wacc'
import { runDCFValuation } from './valuation'

/**
 * Run the complete DCF model
 */
export const runDCFModel = (
  dcfData: DCFData,
  inputs: DCFInputs
): DCFModel => {
  // Calculate WACC
  const { wacc } = calculateFullWACC(
    inputs.riskFreeRate,
    inputs.beta,
    inputs.equityRiskPremium,
    inputs.costOfDebt,
    inputs.taxRate,
    inputs.targetDebtToCapital
  )
  
  // Generate historical projections
  const historicalProjections = generateHistoricalProjections(dcfData.historical)
  
  // Generate forecast projections
  const forecastProjections = generateForecastProjections(
    historicalProjections,
    inputs,
    wacc
  )
  
  // Run valuation
  const valuation = runDCFValuation(
    historicalProjections,
    forecastProjections,
    inputs,
    dcfData.market?.currentPrice || 0,
    dcfData.company.dilutedShares,
    dcfData.historical[0] // Latest historical (assuming sorted with most recent first)
  )
  
  // Combine all projections
  const projections = [...historicalProjections, ...forecastProjections]
  
  // Add terminal value to the terminal year projection
  const terminalYearIndex = projections.length - 1
  projections[terminalYearIndex] = {
    ...projections[terminalYearIndex],
    terminalValue: valuation.pvTerminal * projections[terminalYearIndex].discountFactor,
    discountedTerminalValue: valuation.pvTerminal
  }
  
  return {
    inputs,
    projections,
    valuation
  }
}

/**
 * Initialize a DCF model with default inputs
 */
export const initializeDCFModel = (dcfData: DCFData): DCFModel => {
  // Build default inputs based on historical data
  const inputs = buildDefaultInputs(dcfData)
  
  // Run the model with default inputs
  return runDCFModel(dcfData, inputs)
}

/**
 * Update a DCF model with new inputs
 */
export const updateDCFModel = (
  dcfData: DCFData,
  currentModel: DCFModel,
  newInputs: Partial<DCFInputs>
): DCFModel => {
  // Merge current inputs with new inputs
  const updatedInputs: DCFInputs = {
    ...currentModel.inputs,
    ...newInputs
  }
  
  // Run the model with updated inputs
  return runDCFModel(dcfData, updatedInputs)
}

/**
 * Run a scenario analysis
 */
export const runScenario = (
  dcfData: DCFData,
  baseModel: DCFModel,
  scenarioInputs: Partial<DCFInputs>
): ValuationResults => {
  // Merge base inputs with scenario inputs
  const inputs: DCFInputs = {
    ...baseModel.inputs,
    ...scenarioInputs
  }
  
  // Generate historical projections
  const historicalProjections = generateHistoricalProjections(dcfData.historical)
  
  // Calculate WACC
  const { wacc } = calculateFullWACC(
    inputs.riskFreeRate,
    inputs.beta,
    inputs.equityRiskPremium,
    inputs.costOfDebt,
    inputs.taxRate,
    inputs.targetDebtToCapital
  )
  
  // Generate forecast projections
  const forecastProjections = generateForecastProjections(
    historicalProjections,
    inputs,
    wacc
  )
  
  // Run valuation
  return runDCFValuation(
    historicalProjections,
    forecastProjections,
    inputs,
    dcfData.market?.currentPrice || 0,
    dcfData.company.dilutedShares,
    dcfData.historical[0] // Latest historical (assuming sorted with most recent first)
  )
}

/**
 * Run sensitivity analysis
 */
export const runSensitivityAnalysis = (
  dcfData: DCFData,
  baseModel: DCFModel,
  param1: keyof DCFInputs,
  param2: keyof DCFInputs,
  param1Values: number[],
  param2Values: number[]
): {
  param1: keyof DCFInputs
  param2: keyof DCFInputs
  param1Values: number[]
  param2Values: number[]
  results: number[][]
} => {
  // Create a matrix of results
  const results: number[][] = []
  
  // Run the model for each combination of parameter values
  for (const value1 of param1Values) {
    const row: number[] = []
    
    for (const value2 of param2Values) {
      // Create scenario inputs with the current parameter values
      const scenarioInputs: Partial<DCFInputs> = {
        [param1]: value1,
        [param2]: value2
      }
      
      // Run the scenario
      const valuation = runScenario(dcfData, baseModel, scenarioInputs)
      
      // Store the result (share price)
      row.push(valuation.valuePerShare)
    }
    
    results.push(row)
  }
  
  return {
    param1,
    param2,
    param1Values,
    param2Values,
    results
  }
}

export * from './projections'
export * from './wacc'
export * from './terminal'
export * from './valuation'
