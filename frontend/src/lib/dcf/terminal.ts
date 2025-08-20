/**
 * Terminal Value Calculation Module
 * 
 * Calculates terminal value using Gordon Growth and Exit Multiple methods
 */

import { ProjectionLine } from '@/types/dcf'

/**
 * Calculate terminal value using Gordon Growth Method
 * 
 * Terminal Value = FCF_t+1 / (WACC - g)
 * 
 * Where:
 * - FCF_t+1 = Free Cash Flow in the first year after the forecast period
 * - WACC = Weighted Average Cost of Capital
 * - g = Terminal growth rate
 */
export const calculateGordonGrowthTerminalValue = (
  terminalFcff: number,
  wacc: number,
  terminalGrowthRate: number
): number => {
  // Safety check to prevent division by zero or negative denominator
  if (wacc <= terminalGrowthRate) {
    // If WACC is less than or equal to growth rate, use a minimum spread of 1%
    return terminalFcff / 0.01
  }
  
  return terminalFcff / (wacc - terminalGrowthRate)
}

/**
 * Calculate terminal value using Exit Multiple Method
 * 
 * Terminal Value = Terminal Year Metric × Multiple
 * 
 * Common metrics:
 * - EBITDA
 * - EBIT
 * - Revenue
 */
export const calculateExitMultipleTerminalValue = (
  terminalMetric: number,
  multiple: number
): number => {
  return terminalMetric * multiple
}

/**
 * Calculate terminal value based on the chosen method
 */
export const calculateTerminalValue = (
  terminalYear: ProjectionLine,
  wacc: number,
  terminalGrowthRate: number,
  exitMultiple: number,
  method: 'gordon' | 'exitMultiple'
): number => {
  if (method === 'gordon') {
    // For Gordon Growth, we need the FCF in the first year AFTER the terminal year
    // So we grow the terminal year FCF by the terminal growth rate
    const terminalFcff = terminalYear.fcff * (1 + terminalGrowthRate)
    return calculateGordonGrowthTerminalValue(terminalFcff, wacc, terminalGrowthRate)
  } else {
    // For Exit Multiple, we use the terminal year EBIT
    return calculateExitMultipleTerminalValue(terminalYear.ebit, exitMultiple)
  }
}

/**
 * Calculate discounted terminal value
 */
export const calculateDiscountedTerminalValue = (
  terminalValue: number,
  discountFactor: number
): number => {
  return terminalValue / discountFactor
}

/**
 * Calculate terminal year metrics for analysis
 */
export const calculateTerminalMetrics = (
  terminalYear: ProjectionLine,
  terminalValue: number
): {
  terminalEVRevenue: number
  terminalEVEBIT: number
  terminalFcffYield: number
} => {
  // Calculate terminal year multiples
  const terminalEVRevenue = terminalValue / terminalYear.revenue
  const terminalEVEBIT = terminalValue / terminalYear.ebit
  
  // Calculate FCF yield (FCF / Terminal Value)
  const terminalFcffYield = terminalYear.fcff / terminalValue
  
  return {
    terminalEVRevenue,
    terminalEVEBIT,
    terminalFcffYield
  }
}
