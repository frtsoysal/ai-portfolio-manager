/**
 * Reverse DCF Analysis Module
 * 
 * Calculates implied assumptions from current market price
 */

import { DCFData, DCFInputs, ValuationResults, DCFModel } from '@/types/dcf'
import { runDCFModel } from './index'

/**
 * Calculate implied terminal growth rate from current price
 */
export const calculateImpliedTerminalGrowth = (
  dcfData: DCFData,
  baseInputs: DCFInputs,
  targetPrice: number,
  tolerance: number = 0.01,
  maxIterations: number = 100
): {
  impliedTerminalGrowth: number
  iterations: number
  converged: boolean
  finalPrice: number
} => {
  let low = 0.005  // 0.5%
  let high = 0.08  // 8%
  let iterations = 0
  
  while (iterations < maxIterations && (high - low) > tolerance) {
    const mid = (low + high) / 2
    
    const testInputs: DCFInputs = {
      ...baseInputs,
      terminalGrowthRate: mid,
      terminalMethod: 'gordon'
    }
    
    try {
      const result = runDCFModel(dcfData, testInputs)
      const calculatedPrice = result.valuation.valuePerShare
      
      if (Math.abs(calculatedPrice - targetPrice) < tolerance) {
        return {
          impliedTerminalGrowth: mid,
          iterations: iterations + 1,
          converged: true,
          finalPrice: calculatedPrice
        }
      }
      
      if (calculatedPrice < targetPrice) {
        low = mid
      } else {
        high = mid
      }
    } catch (error) {
      // If calculation fails, adjust bounds
      high = mid
    }
    
    iterations++
  }
  
  const finalGrowth = (low + high) / 2
  const testResult = runDCFModel(dcfData, { ...baseInputs, terminalGrowthRate: finalGrowth, terminalMethod: 'gordon' })
  
  return {
    impliedTerminalGrowth: finalGrowth,
    iterations,
    converged: false,
    finalPrice: testResult.valuation.valuePerShare
  }
}

/**
 * Calculate implied WACC from current price
 */
export const calculateImpliedWACC = (
  dcfData: DCFData,
  baseInputs: DCFInputs,
  targetPrice: number,
  tolerance: number = 0.01,
  maxIterations: number = 100
): {
  impliedWACC: number
  iterations: number
  converged: boolean
  finalPrice: number
} => {
  let low = 0.04   // 4%
  let high = 0.20  // 20%
  let iterations = 0
  
  while (iterations < maxIterations && (high - low) > tolerance) {
    const mid = (low + high) / 2
    
    // Calculate implied cost of equity from WACC
    const impliedCostOfEquity = mid / (1 - baseInputs.targetDebtToCapital * (1 - baseInputs.taxRate))
    const impliedEquityRiskPremium = impliedCostOfEquity - baseInputs.riskFreeRate
    
    const testInputs: DCFInputs = {
      ...baseInputs,
      equityRiskPremium: impliedEquityRiskPremium
    }
    
    try {
      const result = runDCFModel(dcfData, testInputs)
      const calculatedPrice = result.valuation.valuePerShare
      
      if (Math.abs(calculatedPrice - targetPrice) < tolerance) {
        return {
          impliedWACC: mid,
          iterations: iterations + 1,
          converged: true,
          finalPrice: calculatedPrice
        }
      }
      
      if (calculatedPrice < targetPrice) {
        high = mid  // Lower WACC needed
      } else {
        low = mid   // Higher WACC needed
      }
    } catch (error) {
      low = mid
    }
    
    iterations++
  }
  
  const finalWACC = (low + high) / 2
  const impliedCostOfEquity = finalWACC / (1 - baseInputs.targetDebtToCapital * (1 - baseInputs.taxRate))
  const testResult = runDCFModel(dcfData, { 
    ...baseInputs, 
    equityRiskPremium: impliedCostOfEquity - baseInputs.riskFreeRate 
  })
  
  return {
    impliedWACC: finalWACC,
    iterations,
    converged: false,
    finalPrice: testResult.valuation.valuePerShare
  }
}

/**
 * Calculate implied revenue growth rates from current price
 */
export const calculateImpliedRevenueGrowth = (
  dcfData: DCFData,
  baseInputs: DCFInputs,
  targetPrice: number,
  tolerance: number = 0.01,
  maxIterations: number = 100
): {
  impliedGrowthRates: number[]
  avgGrowthRate: number
  iterations: number
  converged: boolean
  finalPrice: number
} => {
  let low = -0.1   // -10%
  let high = 0.5   // 50%
  let iterations = 0
  
  while (iterations < maxIterations && (high - low) > tolerance) {
    const mid = (low + high) / 2
    
    // Create growth pattern: high initially, tapering down
    const impliedGrowthRates = baseInputs.revenueGrowthRates.map((_, index) => {
      const fadeRate = 0.8 // 20% reduction each year
      return mid * Math.pow(fadeRate, index)
    })
    
    const testInputs: DCFInputs = {
      ...baseInputs,
      revenueGrowthRates: impliedGrowthRates
    }
    
    try {
      const result = runDCFModel(dcfData, testInputs)
      const calculatedPrice = result.valuation.valuePerShare
      
      if (Math.abs(calculatedPrice - targetPrice) < tolerance) {
        return {
          impliedGrowthRates,
          avgGrowthRate: impliedGrowthRates.reduce((sum, rate) => sum + rate, 0) / impliedGrowthRates.length,
          iterations: iterations + 1,
          converged: true,
          finalPrice: calculatedPrice
        }
      }
      
      if (calculatedPrice < targetPrice) {
        low = mid
      } else {
        high = mid
      }
    } catch (error) {
      high = mid
    }
    
    iterations++
  }
  
  const finalGrowth = (low + high) / 2
  const finalGrowthRates = baseInputs.revenueGrowthRates.map((_, index) => {
    const fadeRate = 0.8
    return finalGrowth * Math.pow(fadeRate, index)
  })
  
  const testResult = runDCFModel(dcfData, { ...baseInputs, revenueGrowthRates: finalGrowthRates })
  
  return {
    impliedGrowthRates: finalGrowthRates,
    avgGrowthRate: finalGrowthRates.reduce((sum, rate) => sum + rate, 0) / finalGrowthRates.length,
    iterations,
    converged: false,
    finalPrice: testResult.valuation.valuePerShare
  }
}

/**
 * Calculate implied operating margins from current price
 */
export const calculateImpliedMargins = (
  dcfData: DCFData,
  baseInputs: DCFInputs,
  targetPrice: number,
  tolerance: number = 0.01,
  maxIterations: number = 100
): {
  impliedMargins: number[]
  avgMargin: number
  iterations: number
  converged: boolean
  finalPrice: number
} => {
  let low = 0.01   // 1%
  let high = 0.6   // 60%
  let iterations = 0
  
  while (iterations < maxIterations && (high - low) > tolerance) {
    const mid = (low + high) / 2
    
    // Create margin expansion pattern
    const impliedMargins = baseInputs.operatingMargins.map((baseMargin, index) => {
      const expansion = (mid - baseMargin) / baseInputs.forecastPeriod * (index + 1)
      return Math.max(baseMargin + expansion, 0.01) // Minimum 1% margin
    })
    
    const testInputs: DCFInputs = {
      ...baseInputs,
      operatingMargins: impliedMargins
    }
    
    try {
      const result = runDCFModel(dcfData, testInputs)
      const calculatedPrice = result.valuation.valuePerShare
      
      if (Math.abs(calculatedPrice - targetPrice) < tolerance) {
        return {
          impliedMargins,
          avgMargin: impliedMargins.reduce((sum, margin) => sum + margin, 0) / impliedMargins.length,
          iterations: iterations + 1,
          converged: true,
          finalPrice: calculatedPrice
        }
      }
      
      if (calculatedPrice < targetPrice) {
        low = mid
      } else {
        high = mid
      }
    } catch (error) {
      high = mid
    }
    
    iterations++
  }
  
  const finalMargin = (low + high) / 2
  const finalMargins = baseInputs.operatingMargins.map((baseMargin, index) => {
    const expansion = (finalMargin - baseMargin) / baseInputs.forecastPeriod * (index + 1)
    return Math.max(baseMargin + expansion, 0.01)
  })
  
  const testResult = runDCFModel(dcfData, { ...baseInputs, operatingMargins: finalMargins })
  
  return {
    impliedMargins: finalMargins,
    avgMargin: finalMargins.reduce((sum, margin) => sum + margin, 0) / finalMargins.length,
    iterations,
    converged: false,
    finalPrice: testResult.valuation.valuePerShare
  }
}

/**
 * Comprehensive reverse DCF analysis
 */
export const runReverseDCFAnalysis = (
  dcfData: DCFData,
  baseInputs: DCFInputs,
  targetPrice?: number
): {
  targetPrice: number
  currentModelPrice: number
  impliedAssumptions: {
    terminalGrowth: ReturnType<typeof calculateImpliedTerminalGrowth>
    wacc: ReturnType<typeof calculateImpliedWACC>
    revenueGrowth: ReturnType<typeof calculateImpliedRevenueGrowth>
    operatingMargins: ReturnType<typeof calculateImpliedMargins>
  }
  marketExpectations: {
    isOptimistic: boolean
    isRealistic: boolean
    keyDrivers: string[]
    riskFactors: string[]
  }
  feasibilityAssessment: {
    terminalGrowthFeasible: boolean
    waccReasonable: boolean
    growthAchievable: boolean
    marginsRealistic: boolean
    overallFeasibility: 'High' | 'Medium' | 'Low'
  }
} => {
  const currentPrice = targetPrice || dcfData.market?.currentPrice || 0
  const currentModel = runDCFModel(dcfData, baseInputs)
  
  // Calculate all implied assumptions
  const impliedTerminalGrowth = calculateImpliedTerminalGrowth(dcfData, baseInputs, currentPrice)
  const impliedWACC = calculateImpliedWACC(dcfData, baseInputs, currentPrice)
  const impliedRevenueGrowth = calculateImpliedRevenueGrowth(dcfData, baseInputs, currentPrice)
  const impliedMargins = calculateImpliedMargins(dcfData, baseInputs, currentPrice)
  
  // Analyze market expectations
  const isOptimistic = currentPrice > currentModel.valuation.valuePerShare
  const terminalGrowthHigh = impliedTerminalGrowth.impliedTerminalGrowth > 0.04
  const waccLow = impliedWACC.impliedWACC < 0.08
  const growthHigh = impliedRevenueGrowth.avgGrowthRate > 0.15
  const marginsHigh = impliedMargins.avgMargin > 0.25
  
  const keyDrivers: string[] = []
  const riskFactors: string[] = []
  
  if (terminalGrowthHigh) {
    keyDrivers.push('High terminal growth expectations')
    if (impliedTerminalGrowth.impliedTerminalGrowth > 0.05) {
      riskFactors.push('Terminal growth above GDP growth rate')
    }
  }
  
  if (waccLow) {
    keyDrivers.push('Low discount rate assumptions')
    if (impliedWACC.impliedWACC < 0.06) {
      riskFactors.push('WACC below risk-free rate + reasonable risk premium')
    }
  }
  
  if (growthHigh) {
    keyDrivers.push('Aggressive revenue growth expectations')
    if (impliedRevenueGrowth.avgGrowthRate > 0.20) {
      riskFactors.push('Revenue growth above historical industry averages')
    }
  }
  
  if (marginsHigh) {
    keyDrivers.push('Margin expansion expectations')
    if (impliedMargins.avgMargin > 0.30) {
      riskFactors.push('Operating margins above industry benchmarks')
    }
  }
  
  // Feasibility assessment
  const terminalGrowthFeasible = impliedTerminalGrowth.impliedTerminalGrowth <= 0.045 && impliedTerminalGrowth.impliedTerminalGrowth >= 0.015
  const waccReasonable = impliedWACC.impliedWACC >= 0.06 && impliedWACC.impliedWACC <= 0.15
  const growthAchievable = impliedRevenueGrowth.avgGrowthRate <= 0.25 && impliedRevenueGrowth.avgGrowthRate >= -0.05
  const marginsRealistic = impliedMargins.avgMargin <= 0.35 && impliedMargins.avgMargin >= 0.05
  
  let overallFeasibility: 'High' | 'Medium' | 'Low' = 'High'
  const feasibleCount = [terminalGrowthFeasible, waccReasonable, growthAchievable, marginsRealistic].filter(Boolean).length
  
  if (feasibleCount < 2) {
    overallFeasibility = 'Low'
  } else if (feasibleCount < 4) {
    overallFeasibility = 'Medium'
  }
  
  return {
    targetPrice: currentPrice,
    currentModelPrice: currentModel.valuation.valuePerShare,
    impliedAssumptions: {
      terminalGrowth: impliedTerminalGrowth,
      wacc: impliedWACC,
      revenueGrowth: impliedRevenueGrowth,
      operatingMargins: impliedMargins
    },
    marketExpectations: {
      isOptimistic,
      isRealistic: overallFeasibility !== 'Low',
      keyDrivers,
      riskFactors
    },
    feasibilityAssessment: {
      terminalGrowthFeasible,
      waccReasonable,
      growthAchievable,
      marginsRealistic,
      overallFeasibility
    }
  }
}

/**
 * What-if analysis: Given a target price, what assumptions are needed?
 */
export const runWhatIfAnalysis = (
  dcfData: DCFData,
  baseInputs: DCFInputs,
  targetPrices: number[]
): Array<{
  targetPrice: number
  requiredAssumptions: {
    terminalGrowth: number
    wacc: number
    avgRevenueGrowth: number
    avgOperatingMargin: number
  }
  feasibility: 'High' | 'Medium' | 'Low'
  recommendation: string
}> => {
  return targetPrices.map(targetPrice => {
    const analysis = runReverseDCFAnalysis(dcfData, baseInputs, targetPrice)
    
    let recommendation = ''
    if (analysis.feasibilityAssessment.overallFeasibility === 'High') {
      recommendation = targetPrice > (dcfData.market?.currentPrice || 0) ? 'Achievable upside' : 'Fair value'
    } else if (analysis.feasibilityAssessment.overallFeasibility === 'Medium') {
      recommendation = 'Requires optimistic assumptions'
    } else {
      recommendation = 'Unrealistic expectations'
    }
    
    return {
      targetPrice,
      requiredAssumptions: {
        terminalGrowth: analysis.impliedAssumptions.terminalGrowth.impliedTerminalGrowth,
        wacc: analysis.impliedAssumptions.wacc.impliedWACC,
        avgRevenueGrowth: analysis.impliedAssumptions.revenueGrowth.avgGrowthRate,
        avgOperatingMargin: analysis.impliedAssumptions.operatingMargins.avgMargin
      },
      feasibility: analysis.feasibilityAssessment.overallFeasibility,
      recommendation
    }
  })
}
