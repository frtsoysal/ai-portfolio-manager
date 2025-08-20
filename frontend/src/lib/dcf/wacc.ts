/**
 * WACC Calculation Module
 * 
 * Calculates Weighted Average Cost of Capital (WACC) based on various inputs
 */

/**
 * Calculate Cost of Equity using CAPM
 * 
 * Cost of Equity = Risk-Free Rate + Beta * Equity Risk Premium
 */
export const calculateCostOfEquity = (
  riskFreeRate: number,
  beta: number,
  equityRiskPremium: number
): number => {
  return riskFreeRate + beta * equityRiskPremium
}

/**
 * Calculate After-Tax Cost of Debt
 * 
 * After-Tax Cost of Debt = Pre-Tax Cost of Debt * (1 - Tax Rate)
 */
export const calculateAfterTaxCostOfDebt = (
  costOfDebt: number,
  taxRate: number
): number => {
  return costOfDebt * (1 - taxRate)
}

/**
 * Calculate WACC
 * 
 * WACC = (E / (D + E)) * Cost of Equity + (D / (D + E)) * After-Tax Cost of Debt
 * 
 * Where:
 * - E = Equity value (or target equity weight)
 * - D = Debt value (or target debt weight)
 */
export const calculateWACC = (
  costOfEquity: number,
  afterTaxCostOfDebt: number,
  debtToCapital: number
): number => {
  // Convert debt-to-capital ratio to equity weight and debt weight
  const debtWeight = debtToCapital
  const equityWeight = 1 - debtWeight
  
  return equityWeight * costOfEquity + debtWeight * afterTaxCostOfDebt
}

/**
 * Calculate full WACC from inputs
 */
export const calculateFullWACC = (
  riskFreeRate: number,
  beta: number,
  equityRiskPremium: number,
  costOfDebt: number,
  taxRate: number,
  debtToCapital: number
): {
  costOfEquity: number
  afterTaxCostOfDebt: number
  wacc: number
} => {
  const costOfEquity = calculateCostOfEquity(riskFreeRate, beta, equityRiskPremium)
  const afterTaxCostOfDebt = calculateAfterTaxCostOfDebt(costOfDebt, taxRate)
  const wacc = calculateWACC(costOfEquity, afterTaxCostOfDebt, debtToCapital)
  
  return {
    costOfEquity,
    afterTaxCostOfDebt,
    wacc
  }
}

/**
 * Estimate Cost of Debt from credit rating or default inputs
 */
export const estimateCostOfDebt = (
  riskFreeRate: number,
  interestCoverage: number | null = null,
  defaultSpread = 0.03 // Default spread of 3%
): number => {
  // If we don't have interest coverage, use default spread
  if (!interestCoverage) {
    return riskFreeRate + defaultSpread
  }
  
  // Estimate credit spread based on interest coverage ratio
  let creditSpread: number
  
  if (interestCoverage > 8.5) {
    creditSpread = 0.0075 // AAA/AA (0.75%)
  } else if (interestCoverage > 6.5) {
    creditSpread = 0.01 // A (1%)
  } else if (interestCoverage > 4.25) {
    creditSpread = 0.015 // BBB (1.5%)
  } else if (interestCoverage > 3) {
    creditSpread = 0.025 // BB (2.5%)
  } else if (interestCoverage > 1.75) {
    creditSpread = 0.04 // B (4%)
  } else if (interestCoverage > 1.25) {
    creditSpread = 0.06 // CCC (6%)
  } else {
    creditSpread = 0.1 // CC or below (10%)
  }
  
  return riskFreeRate + creditSpread
}

/**
 * Calculate interest coverage ratio
 */
export const calculateInterestCoverage = (
  ebit: number,
  interestExpense: number
): number => {
  if (!interestExpense || interestExpense === 0) {
    return Number.POSITIVE_INFINITY // No debt or interest expense
  }
  
  return ebit / interestExpense
}

/**
 * Estimate beta from industry or sector average
 */
export const getIndustryBeta = (industry: string): number => {
  // These are example industry betas, would need to be updated regularly
  const industryBetas: Record<string, number> = {
    'Technology': 1.2,
    'Software': 1.3,
    'Consumer Electronics': 1.15,
    'Healthcare': 0.9,
    'Financial Services': 1.1,
    'Energy': 1.4,
    'Utilities': 0.7,
    'Consumer Staples': 0.6,
    'Retail': 1.0,
    'Telecommunications': 0.8,
    'Industrial': 1.1,
    'Materials': 1.2,
    'Real Estate': 0.8
  }
  
  return industryBetas[industry] || 1.0 // Default to 1.0 if industry not found
}
