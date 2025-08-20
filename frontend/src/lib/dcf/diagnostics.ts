/**
 * DCF Model Diagnostics Module
 * 
 * Comprehensive model quality assessment and validation
 */

import { DCFData, DCFModel, DCFInputs } from '@/types/dcf'

export interface DiagnosticCheck {
  id: string
  name: string
  category: 'Data Quality' | 'Model Consistency' | 'Assumption Reasonableness' | 'Output Validation'
  status: 'Pass' | 'Warning' | 'Fail'
  score: number // 0-100
  message: string
  details?: string
  recommendation?: string
}

export interface DiagnosticReport {
  overallScore: number // 0-100
  confidenceLevel: 'High' | 'Medium' | 'Low'
  checks: DiagnosticCheck[]
  summary: {
    passed: number
    warnings: number
    failed: number
  }
  keyIssues: string[]
  recommendations: string[]
}

/**
 * Run comprehensive diagnostics on DCF model
 */
export const runModelDiagnostics = (
  dcfData: DCFData,
  model: DCFModel
): DiagnosticReport => {
  try {
    const checks: DiagnosticCheck[] = []
    
    // Data Quality Checks
    try {
      checks.push(...runDataQualityChecks(dcfData))
    } catch (error) {
      console.error('Error in data quality checks:', error)
      checks.push({
        id: 'data_quality_error',
        name: 'Data Quality Analysis',
        category: 'Data Quality',
        status: 'Fail',
        score: 0,
        message: 'Error analyzing data quality'
      })
    }
    
    // Model Consistency Checks
    try {
      checks.push(...runConsistencyChecks(model, dcfData))
    } catch (error) {
      console.error('Error in consistency checks:', error)
      checks.push({
        id: 'consistency_error',
        name: 'Model Consistency Analysis',
        category: 'Model Consistency',
        status: 'Fail',
        score: 0,
        message: 'Error analyzing model consistency'
      })
    }
    
    // Assumption Reasonableness Checks
    try {
      checks.push(...runAssumptionChecks(model.inputs, dcfData))
    } catch (error) {
      console.error('Error in assumption checks:', error)
      checks.push({
        id: 'assumption_error',
        name: 'Assumption Analysis',
        category: 'Assumption Reasonableness',
        status: 'Fail',
        score: 0,
        message: 'Error analyzing assumptions'
      })
    }
    
    // Output Validation Checks
    try {
      checks.push(...runOutputValidationChecks(model))
    } catch (error) {
      console.error('Error in output validation:', error)
      checks.push({
        id: 'output_error',
        name: 'Output Validation',
        category: 'Output Validation',
        status: 'Fail',
        score: 0,
        message: 'Error validating outputs'
      })
    }
    
    // Ensure we have at least some checks
    if (checks.length === 0) {
      checks.push({
        id: 'no_checks',
        name: 'Diagnostic Analysis',
        category: 'Data Quality',
        status: 'Fail',
        score: 0,
        message: 'No diagnostic checks could be performed'
      })
    }
    
    // Calculate overall score
    const validScores = checks.filter(c => !isNaN(c.score) && isFinite(c.score))
    const totalScore = validScores.reduce((sum, check) => sum + check.score, 0)
    const overallScore = validScores.length > 0 ? Math.round(totalScore / validScores.length) : 0
    
    // Determine confidence level
    let confidenceLevel: 'High' | 'Medium' | 'Low' = 'High'
    if (overallScore < 70) confidenceLevel = 'Low'
    else if (overallScore < 85) confidenceLevel = 'Medium'
    
    // Count results
    const summary = {
      passed: checks.filter(c => c.status === 'Pass').length,
      warnings: checks.filter(c => c.status === 'Warning').length,
      failed: checks.filter(c => c.status === 'Fail').length
    }
    
    // Extract key issues and recommendations
    const keyIssues = checks
      .filter(c => c.status === 'Fail')
      .map(c => c.message)
      .slice(0, 5)
    
    const recommendations = checks
      .filter(c => c.recommendation)
      .map(c => c.recommendation!)
      .slice(0, 5)
    
    return {
      overallScore,
      confidenceLevel,
      checks,
      summary,
      keyIssues,
      recommendations
    }
  } catch (error) {
    console.error('Error in runModelDiagnostics:', error)
    
    // Return a basic error report
    return {
      overallScore: 0,
      confidenceLevel: 'Low',
      checks: [{
        id: 'general_error',
        name: 'Diagnostic Analysis',
        category: 'Data Quality',
        status: 'Fail',
        score: 0,
        message: 'Unable to run diagnostics due to error'
      }],
      summary: {
        passed: 0,
        warnings: 0,
        failed: 1
      },
      keyIssues: ['Unable to run diagnostics due to error'],
      recommendations: ['Check console for detailed error information']
    }
  }
}

/**
 * Data Quality Checks
 */
const runDataQualityChecks = (dcfData: DCFData): DiagnosticCheck[] => {
  const checks: DiagnosticCheck[] = []
  
  try {
    // Historical data completeness
    const historicalYears = dcfData?.historical?.length || 0
    checks.push({
      id: 'historical_completeness',
      name: 'Historical Data Completeness',
      category: 'Data Quality',
      status: historicalYears >= 5 ? 'Pass' : historicalYears >= 3 ? 'Warning' : 'Fail',
      score: Math.min(historicalYears * 20, 100),
      message: `${historicalYears} years of historical data available`,
      details: historicalYears < 5 ? 'DCF models typically require 5+ years of historical data for reliable projections' : undefined,
      recommendation: historicalYears < 5 ? 'Consider using industry averages to supplement limited historical data' : undefined
    })
  } catch (error) {
    console.error('Error in historical completeness check:', error)
    checks.push({
      id: 'historical_completeness_error',
      name: 'Historical Data Completeness',
      category: 'Data Quality',
      status: 'Fail',
      score: 0,
      message: 'Unable to analyze historical data completeness'
    })
  }
  
  try {
    // Revenue consistency
    const revenues = dcfData?.historical?.map(f => f?.revenue || 0).filter(r => r > 0) || []
    
    if (revenues.length >= 2) {
      const revenueGrowthRates = revenues.slice(1).map((rev, i) => (rev - revenues[i]) / revenues[i]).filter(rate => !isNaN(rate) && isFinite(rate))
      
      if (revenueGrowthRates.length > 0) {
        const avgGrowthRate = revenueGrowthRates.reduce((sum, rate) => sum + rate, 0) / revenueGrowthRates.length
        const growthVolatility = Math.sqrt(revenueGrowthRates.reduce((sum, rate) => sum + Math.pow(rate - avgGrowthRate, 2), 0) / revenueGrowthRates.length)
        
        checks.push({
          id: 'revenue_consistency',
          name: 'Revenue Growth Consistency',
          category: 'Data Quality',
          status: growthVolatility < 0.2 ? 'Pass' : growthVolatility < 0.4 ? 'Warning' : 'Fail',
          score: Math.max(100 - growthVolatility * 200, 0),
          message: `Revenue growth volatility: ${(growthVolatility * 100).toFixed(1)}%`,
          details: growthVolatility > 0.2 ? 'High revenue volatility may indicate cyclical business or data quality issues' : undefined,
          recommendation: growthVolatility > 0.3 ? 'Consider using normalized growth rates or industry-adjusted figures' : undefined
        })
      } else {
        checks.push({
          id: 'revenue_consistency',
          name: 'Revenue Growth Consistency',
          category: 'Data Quality',
          status: 'Warning',
          score: 50,
          message: 'Unable to calculate revenue growth rates from available data'
        })
      }
    } else {
      checks.push({
        id: 'revenue_consistency',
        name: 'Revenue Growth Consistency',
        category: 'Data Quality',
        status: 'Fail',
        score: 0,
        message: 'Insufficient revenue data for consistency analysis'
      })
    }
  } catch (error) {
    console.error('Error in revenue consistency check:', error)
    checks.push({
      id: 'revenue_consistency_error',
      name: 'Revenue Growth Consistency',
      category: 'Data Quality',
      status: 'Fail',
      score: 0,
      message: 'Error analyzing revenue consistency'
    })
  }
  
  try {
    // Margin consistency
    const margins = dcfData?.historical?.map(f => {
      const revenue = f?.revenue || 0
      const ebit = f?.ebit || 0
      return revenue > 0 ? ebit / revenue : 0
    }).filter(m => !isNaN(m) && isFinite(m)) || []
    
    if (margins.length >= 2) {
      const avgMargin = margins.reduce((sum, margin) => sum + margin, 0) / margins.length
      const marginVolatility = Math.sqrt(margins.reduce((sum, margin) => sum + Math.pow(margin - avgMargin, 2), 0) / margins.length)
      
      checks.push({
        id: 'margin_consistency',
        name: 'Operating Margin Stability',
        category: 'Data Quality',
        status: marginVolatility < 0.05 ? 'Pass' : marginVolatility < 0.1 ? 'Warning' : 'Fail',
        score: Math.max(100 - marginVolatility * 500, 0),
        message: `Operating margin volatility: ${(marginVolatility * 100).toFixed(1)}%`,
        details: marginVolatility > 0.05 ? 'High margin volatility suggests operational instability or accounting irregularities' : undefined
      })
    } else {
      checks.push({
        id: 'margin_consistency',
        name: 'Operating Margin Stability',
        category: 'Data Quality',
        status: 'Warning',
        score: 50,
        message: 'Insufficient data for margin stability analysis'
      })
    }
  } catch (error) {
    console.error('Error in margin consistency check:', error)
    checks.push({
      id: 'margin_consistency_error',
      name: 'Operating Margin Stability',
      category: 'Data Quality',
      status: 'Fail',
      score: 0,
      message: 'Error analyzing margin consistency'
    })
  }
  
  try {
    // Cash flow quality
    const fcfToNetIncomeRatios = dcfData?.historical?.map(f => {
      const fcf = f?.fcff || 0
      const nopat = f?.nopat || 0
      return nopat !== 0 ? fcf / nopat : 0
    }).filter(ratio => !isNaN(ratio) && isFinite(ratio)) || []
    
    if (fcfToNetIncomeRatios.length > 0) {
      const avgFCFRatio = fcfToNetIncomeRatios.reduce((sum, ratio) => sum + ratio, 0) / fcfToNetIncomeRatios.length
      
      checks.push({
        id: 'cash_flow_quality',
        name: 'Cash Flow Quality',
        category: 'Data Quality',
        status: avgFCFRatio > 0.8 ? 'Pass' : avgFCFRatio > 0.6 ? 'Warning' : 'Fail',
        score: Math.min(Math.abs(avgFCFRatio) * 100, 100),
        message: `Average FCF/NOPAT ratio: ${avgFCFRatio.toFixed(2)}`,
        details: avgFCFRatio < 0.8 ? 'Low cash conversion suggests working capital issues or aggressive accounting' : undefined,
        recommendation: avgFCFRatio < 0.7 ? 'Investigate working capital trends and accounting policies' : undefined
      })
    } else {
      checks.push({
        id: 'cash_flow_quality',
        name: 'Cash Flow Quality',
        category: 'Data Quality',
        status: 'Warning',
        score: 50,
        message: 'Unable to analyze cash flow quality - insufficient data'
      })
    }
  } catch (error) {
    console.error('Error in cash flow quality check:', error)
    checks.push({
      id: 'cash_flow_quality_error',
      name: 'Cash Flow Quality',
      category: 'Data Quality',
      status: 'Fail',
      score: 0,
      message: 'Error analyzing cash flow quality'
    })
  }
  
  return checks
}

/**
 * Model Consistency Checks
 */
const runConsistencyChecks = (model: DCFModel, dcfData: DCFData): DiagnosticCheck[] => {
  const checks: DiagnosticCheck[] = []
  
  // WACC reasonableness
  const wacc = model.valuation.wacc
  checks.push({
    id: 'wacc_reasonableness',
    name: 'WACC Reasonableness',
    category: 'Model Consistency',
    status: wacc >= 0.05 && wacc <= 0.20 ? 'Pass' : wacc >= 0.03 && wacc <= 0.25 ? 'Warning' : 'Fail',
    score: wacc >= 0.05 && wacc <= 0.20 ? 100 : wacc >= 0.03 && wacc <= 0.25 ? 70 : 30,
    message: `WACC: ${(wacc * 100).toFixed(1)}%`,
    details: wacc < 0.05 || wacc > 0.20 ? 'WACC outside typical range for public companies (5%-20%)' : undefined,
    recommendation: wacc < 0.05 ? 'Consider higher risk premium' : wacc > 0.20 ? 'Review beta and risk assumptions' : undefined
  })
  
  // Terminal value dependency
  const terminalValuePercent = model.valuation.pvTerminal / model.valuation.enterpriseValue
  checks.push({
    id: 'terminal_value_dependency',
    name: 'Terminal Value Dependency',
    category: 'Model Consistency',
    status: terminalValuePercent < 0.75 ? 'Pass' : terminalValuePercent < 0.85 ? 'Warning' : 'Fail',
    score: Math.max(100 - (terminalValuePercent - 0.5) * 200, 0),
    message: `Terminal value: ${(terminalValuePercent * 100).toFixed(0)}% of enterprise value`,
    details: terminalValuePercent > 0.75 ? 'High terminal value dependency reduces model reliability' : undefined,
    recommendation: terminalValuePercent > 0.8 ? 'Extend forecast period or reduce terminal growth assumptions' : undefined
  })
  
  // Growth rate progression
  const growthRates = model.inputs.revenueGrowthRates
  const growthDecline = growthRates.every((rate, i) => i === 0 || rate <= growthRates[i - 1] + 0.02)
  
  checks.push({
    id: 'growth_progression',
    name: 'Growth Rate Progression',
    category: 'Model Consistency',
    status: growthDecline ? 'Pass' : 'Warning',
    score: growthDecline ? 100 : 70,
    message: growthDecline ? 'Growth rates decline over time' : 'Growth rates increase over forecast period',
    details: !growthDecline ? 'Accelerating growth rates over time are typically unrealistic' : undefined,
    recommendation: !growthDecline ? 'Consider tapering growth rates over the forecast period' : undefined
  })
  
  // Margin progression reasonableness
  const margins = model.inputs.operatingMargins
  const marginExpansion = margins[margins.length - 1] - margins[0]
  
  checks.push({
    id: 'margin_progression',
    name: 'Margin Expansion Reasonableness',
    category: 'Model Consistency',
    status: Math.abs(marginExpansion) < 0.05 ? 'Pass' : Math.abs(marginExpansion) < 0.1 ? 'Warning' : 'Fail',
    score: Math.max(100 - Math.abs(marginExpansion) * 500, 0),
    message: `Margin change: ${(marginExpansion * 100).toFixed(1)}pp over forecast period`,
    details: Math.abs(marginExpansion) > 0.05 ? 'Large margin changes require strong business case justification' : undefined,
    recommendation: Math.abs(marginExpansion) > 0.08 ? 'Validate margin assumptions with industry analysis' : undefined
  })
  
  return checks
}

/**
 * Assumption Reasonableness Checks
 */
const runAssumptionChecks = (inputs: DCFInputs, dcfData: DCFData): DiagnosticCheck[] => {
  const checks: DiagnosticCheck[] = []
  
  // Terminal growth vs GDP
  const terminalGrowth = inputs.terminalGrowthRate
  checks.push({
    id: 'terminal_growth_gdp',
    name: 'Terminal Growth vs GDP',
    category: 'Assumption Reasonableness',
    status: terminalGrowth <= 0.04 ? 'Pass' : terminalGrowth <= 0.06 ? 'Warning' : 'Fail',
    score: terminalGrowth <= 0.04 ? 100 : terminalGrowth <= 0.06 ? 70 : 30,
    message: `Terminal growth: ${(terminalGrowth * 100).toFixed(1)}%`,
    details: terminalGrowth > 0.04 ? 'Terminal growth above long-term GDP growth (3-4%) is typically unsustainable' : undefined,
    recommendation: terminalGrowth > 0.05 ? 'Consider reducing terminal growth to 3-4% range' : undefined
  })
  
  // Beta reasonableness
  const beta = inputs.beta
  checks.push({
    id: 'beta_reasonableness',
    name: 'Beta Reasonableness',
    category: 'Assumption Reasonableness',
    status: beta >= 0.5 && beta <= 2.5 ? 'Pass' : beta >= 0.2 && beta <= 3.0 ? 'Warning' : 'Fail',
    score: beta >= 0.5 && beta <= 2.5 ? 100 : beta >= 0.2 && beta <= 3.0 ? 70 : 30,
    message: `Beta: ${beta.toFixed(2)}`,
    details: beta < 0.5 || beta > 2.5 ? 'Beta outside typical range for most public companies' : undefined,
    recommendation: beta > 2.5 ? 'High beta suggests very risky business - validate with peer analysis' : undefined
  })
  
  // Tax rate reasonableness
  const taxRate = inputs.taxRate
  checks.push({
    id: 'tax_rate_reasonableness',
    name: 'Tax Rate Reasonableness',
    category: 'Assumption Reasonableness',
    status: taxRate >= 0.15 && taxRate <= 0.35 ? 'Pass' : taxRate >= 0.10 && taxRate <= 0.45 ? 'Warning' : 'Fail',
    score: taxRate >= 0.15 && taxRate <= 0.35 ? 100 : taxRate >= 0.10 && taxRate <= 0.45 ? 70 : 30,
    message: `Tax rate: ${(taxRate * 100).toFixed(1)}%`,
    details: taxRate < 0.15 || taxRate > 0.35 ? 'Tax rate outside typical corporate range (15%-35%)' : undefined
  })
  
  // CapEx as % of revenue reasonableness
  const avgCapexPercent = inputs.capexPercent.reduce((sum, pct) => sum + pct, 0) / inputs.capexPercent.length
  checks.push({
    id: 'capex_reasonableness',
    name: 'CapEx Intensity Reasonableness',
    category: 'Assumption Reasonableness',
    status: avgCapexPercent <= 0.15 ? 'Pass' : avgCapexPercent <= 0.25 ? 'Warning' : 'Fail',
    score: avgCapexPercent <= 0.15 ? 100 : avgCapexPercent <= 0.25 ? 70 : 30,
    message: `Average CapEx: ${(avgCapexPercent * 100).toFixed(1)}% of revenue`,
    details: avgCapexPercent > 0.15 ? 'High CapEx intensity may indicate capital-intensive business or growth phase' : undefined,
    recommendation: avgCapexPercent > 0.20 ? 'Validate CapEx assumptions with industry benchmarks' : undefined
  })
  
  return checks
}

/**
 * Output Validation Checks
 */
const runOutputValidationChecks = (model: DCFModel): DiagnosticCheck[] => {
  const checks: DiagnosticCheck[] = []
  
  // Valuation reasonableness
  const upside = model.valuation.upside
  checks.push({
    id: 'valuation_reasonableness',
    name: 'Valuation Upside/Downside',
    category: 'Output Validation',
    status: Math.abs(upside) <= 0.5 ? 'Pass' : Math.abs(upside) <= 1.0 ? 'Warning' : 'Fail',
    score: Math.max(100 - Math.abs(upside) * 100, 0),
    message: `Price difference: ${(upside * 100).toFixed(1)}%`,
    details: Math.abs(upside) > 0.5 ? 'Large valuation differences may indicate model issues or market inefficiency' : undefined,
    recommendation: Math.abs(upside) > 0.8 ? 'Review all assumptions and consider alternative valuation methods' : undefined
  })
  
  // ROIC reasonableness (calculated from projections)
  const latestProjection = model.projections[model.projections.length - 2] // Exclude terminal year
  if (latestProjection) {
    const roic = latestProjection.nopat / (latestProjection.revenue * 0.3) // Assuming invested capital ~30% of revenue
    checks.push({
      id: 'roic_reasonableness',
      name: 'Return on Invested Capital',
      category: 'Output Validation',
      status: roic >= 0.10 && roic <= 0.50 ? 'Pass' : roic >= 0.05 && roic <= 0.70 ? 'Warning' : 'Fail',
      score: roic >= 0.10 && roic <= 0.50 ? 100 : roic >= 0.05 && roic <= 0.70 ? 70 : 30,
      message: `Implied ROIC: ${(roic * 100).toFixed(1)}%`,
      details: roic < 0.10 || roic > 0.50 ? 'ROIC outside typical range suggests model inconsistencies' : undefined,
      recommendation: roic < 0.08 ? 'Low ROIC may not justify growth assumptions' : roic > 0.60 ? 'Very high ROIC may be unsustainable' : undefined
    })
  }
  
  // FCF growth reasonableness
  const fcfGrowthRates = model.projections.slice(0, -1).map((proj, i) => {
    if (i === 0) return 0
    const prevProj = model.projections[i - 1]
    return (proj.fcff - prevProj.fcff) / prevProj.fcff
  }).filter(rate => !isNaN(rate) && isFinite(rate))
  
  if (fcfGrowthRates.length > 0) {
    const avgFCFGrowth = fcfGrowthRates.reduce((sum, rate) => sum + rate, 0) / fcfGrowthRates.length
    checks.push({
      id: 'fcf_growth_reasonableness',
      name: 'Free Cash Flow Growth',
      category: 'Output Validation',
      status: avgFCFGrowth <= 0.25 ? 'Pass' : avgFCFGrowth <= 0.40 ? 'Warning' : 'Fail',
      score: Math.max(100 - Math.max(avgFCFGrowth - 0.15, 0) * 200, 0),
      message: `Average FCF growth: ${(avgFCFGrowth * 100).toFixed(1)}%`,
      details: avgFCFGrowth > 0.25 ? 'High FCF growth rates may be difficult to sustain long-term' : undefined,
      recommendation: avgFCFGrowth > 0.35 ? 'Consider more conservative growth assumptions' : undefined
    })
  }
  
  return checks
}

/**
 * Get diagnostic summary for quick overview
 */
export const getDiagnosticSummary = (report: DiagnosticReport): {
  overallHealth: 'Excellent' | 'Good' | 'Fair' | 'Poor'
  keyStrengths: string[]
  majorConcerns: string[]
  confidenceIndicators: Array<{ metric: string, status: 'Good' | 'Caution' | 'Risk' }>
} => {
  let overallHealth: 'Excellent' | 'Good' | 'Fair' | 'Poor' = 'Poor'
  if (report.overallScore >= 90) overallHealth = 'Excellent'
  else if (report.overallScore >= 80) overallHealth = 'Good'
  else if (report.overallScore >= 70) overallHealth = 'Fair'
  
  const keyStrengths = report.checks
    .filter(c => c.status === 'Pass' && c.score >= 90)
    .map(c => c.name)
    .slice(0, 3)
  
  const majorConcerns = report.checks
    .filter(c => c.status === 'Fail')
    .map(c => c.name)
    .slice(0, 3)
  
  const confidenceIndicators = [
    {
      metric: 'Data Quality',
      status: report.checks.filter(c => c.category === 'Data Quality').every(c => c.status === 'Pass') ? 'Good' as const :
              report.checks.filter(c => c.category === 'Data Quality').some(c => c.status === 'Fail') ? 'Risk' as const : 'Caution' as const
    },
    {
      metric: 'Model Consistency',
      status: report.checks.filter(c => c.category === 'Model Consistency').every(c => c.status === 'Pass') ? 'Good' as const :
              report.checks.filter(c => c.category === 'Model Consistency').some(c => c.status === 'Fail') ? 'Risk' as const : 'Caution' as const
    },
    {
      metric: 'Assumptions',
      status: report.checks.filter(c => c.category === 'Assumption Reasonableness').every(c => c.status === 'Pass') ? 'Good' as const :
              report.checks.filter(c => c.category === 'Assumption Reasonableness').some(c => c.status === 'Fail') ? 'Risk' as const : 'Caution' as const
    }
  ]
  
  return {
    overallHealth,
    keyStrengths,
    majorConcerns,
    confidenceIndicators
  }
}
