'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DCFModel, DCFData, Scenario } from '@/types/dcf'
import { createPredefinedScenarios, runSensitivityAnalysis, calculateTornadoChart } from '@/lib/dcf/scenarios'
import { runScenario, updateDCFModel } from '@/lib/dcf'
import { TrendingUp, TrendingDown, BarChart3, Target } from 'lucide-react'

interface ScenariosPanelProps {
  activeScenario: string
  onScenarioChange: (scenario: string) => void
  model: DCFModel | null
  dcfData: DCFData | null
  onModelChange: (model: DCFModel) => void
  baseModel?: DCFModel | null
}

export default function ScenariosPanel({ 
  activeScenario, 
  onScenarioChange, 
  model, 
  dcfData,
  onModelChange,
  baseModel 
}: ScenariosPanelProps) {
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>(['base', 'bull', 'bear'])

  useEffect(() => {
    if (model && dcfData) {
      // Use baseModel for scenario calculations if available, otherwise use current model
      const calculationModel = baseModel || model
      const predefinedScenarios = createPredefinedScenarios(dcfData, calculationModel.inputs)
      
      // Calculate valuations for each scenario based on the base model
      const scenariosWithValuation = predefinedScenarios.map(scenario => {
        try {
          // Special handling for Base Case
          if (scenario.name === 'Base Case') {
            return {
              ...scenario,
              valuation: calculationModel.valuation
            }
          }
          
          // For other scenarios, calculate from base model
          const valuation = runScenario(dcfData, calculationModel, scenario.inputs)
          return {
            ...scenario,
            valuation
          }
        } catch (error) {
          console.error(`Error calculating scenario ${scenario.name}:`, error)
          return scenario
        }
      })
      
      setScenarios(scenariosWithValuation)
    }
  }, [model, dcfData, baseModel])

  if (!model || !dcfData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Scenarios</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading scenarios...</p>
        </CardContent>
      </Card>
    )
  }

  const formatCurrency = (value: number) => {
    return `$${value.toFixed(2)}`
  }

  const formatPercent = (value: number) => {
    return `${(value * 100).toFixed(1)}%`
  }

  const applyScenario = (scenarioName: string) => {
    console.log('Applying scenario:', scenarioName)
    
    // Special handling for Base Case - restore original model
    if (scenarioName === 'Base Case') {
      if (baseModel) {
        console.log('Restoring base model:', baseModel)
        onModelChange(baseModel)
        onScenarioChange('basecase')
        console.log('Successfully restored Base Case scenario')
        return
      } else {
        console.error('Base model not available')
        return
      }
    }
    
    const scenario = scenarios.find(s => s.name === scenarioName)
    console.log('Found scenario:', scenario)
    
    if (scenario && dcfData) {
      try {
        // Use baseModel if available, otherwise fall back to current model
        const sourceModel = baseModel || model
        if (!sourceModel) {
          console.error('No base model or current model available')
          return
        }
        
        console.log('Using source model (base):', sourceModel)
        console.log('Scenario inputs:', scenario.inputs)
        
        // Apply scenario to base model (not current model)
        const updatedModel = updateDCFModel(dcfData, sourceModel, scenario.inputs)
        console.log('Updated model:', updatedModel)
        onModelChange(updatedModel)
        
        // Convert scenario name to lowercase and remove all spaces and special chars
        const scenarioKey = scenarioName.toLowerCase().replace(/[^a-z0-9]/g, '')
        console.log('Setting active scenario to:', scenarioKey)
        onScenarioChange(scenarioKey)
        
        // Show success feedback
        console.log(`Successfully applied ${scenarioName} scenario`)
      } catch (error) {
        console.error('Error applying scenario:', error)
      }
    } else {
      console.error('Scenario not found or missing dcfData:', { scenarioName, scenario, dcfData })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Scenario & Sensitivity Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="scenarios" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
            <TabsTrigger value="comparison">Comparison</TabsTrigger>
            <TabsTrigger value="tornado">Tornado</TabsTrigger>
          </TabsList>

          {/* Scenario Analysis Tab */}
          <TabsContent value="scenarios" className="space-y-6">
            {/* Scenario Comparison */}
            <div>
              <h4 className="font-semibold mb-4">Scenario Comparison</h4>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2">Scenario</th>
                      <th className="text-right py-3 px-2">Target Price</th>
                      <th className="text-right py-3 px-2">Upside</th>
                      <th className="text-right py-3 px-2">Recommendation</th>
                      <th className="text-center py-3 px-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scenarios.map((scenario) => (
                      <tr key={scenario.name} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-2">
                          <div>
                            <div className="font-medium">{scenario.name}</div>
                            <div className="text-xs text-muted-foreground">{scenario.description}</div>
                          </div>
                        </td>
                        <td className="text-right py-3 px-2 font-medium">
                          {scenario.valuation ? formatCurrency(scenario.valuation.valuePerShare) : '-'}
                        </td>
                        <td className="text-right py-3 px-2">
                          {scenario.valuation && (
                            <Badge variant={scenario.valuation.upside >= 0 ? "default" : "destructive"}>
                              {scenario.valuation.upside >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                              {scenario.valuation.upside > 0 ? '+' : ''}{formatPercent(scenario.valuation.upside)}
                            </Badge>
                          )}
                        </td>
                        <td className="text-right py-3 px-2">
                          {scenario.valuation && (
                            <span className={`text-xs font-medium ${
                              scenario.valuation.upside >= 0.15 ? 'text-green-600' : 
                              scenario.valuation.upside >= 0 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {scenario.valuation.upside >= 0.15 ? 'Strong Buy' : 
                               scenario.valuation.upside >= 0 ? 'Buy' : 'Sell'}
                            </span>
                          )}
                        </td>
                        <td className="text-center py-3 px-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => applyScenario(scenario.name)}
                          >
                            Apply
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Scenario Chart */}
            <div>
              <h4 className="font-semibold mb-4">Price Target Distribution</h4>
              
              <div className="bg-muted/20 p-6 rounded-lg">
                <div className="flex items-end justify-between h-32">
                  {scenarios.map((scenario, index) => {
                    if (!scenario.valuation) return null
                    
                    const maxPrice = Math.max(...scenarios.filter(s => s.valuation).map(s => s.valuation!.valuePerShare))
                    const height = (scenario.valuation.valuePerShare / maxPrice) * 100
                    
                    return (
                      <div key={scenario.name} className="flex flex-col items-center space-y-2">
                        <div 
                          className={`w-16 rounded-t transition-all duration-300 ${
                            index === 0 ? 'bg-blue-500' :
                            index === 1 ? 'bg-green-500' :
                            index === 2 ? 'bg-red-500' :
                            index === 3 ? 'bg-purple-500' : 'bg-yellow-500'
                          }`}
                          style={{ height: `${height}%` }}
                        ></div>
                        <div className="text-xs font-medium">{formatCurrency(scenario.valuation.valuePerShare)}</div>
                        <div className="text-xs text-muted-foreground text-center">{scenario.name}</div>
                      </div>
                    )
                  })}
                </div>
                
                {/* Current Price Line */}
                <div className="mt-4 border-t pt-4">
                  <div className="flex items-center justify-center">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-0.5 bg-gray-400"></div>
                      <span className="text-sm text-muted-foreground">
                        Current Price: {formatCurrency(dcfData.market.currentPrice)}
                      </span>
                      <div className="w-4 h-0.5 bg-gray-400"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Scenario Comparison Tab */}
          <TabsContent value="comparison" className="space-y-6">
            <div>
              <h4 className="font-semibold mb-4">Detailed Scenario Comparison</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Compare key assumptions and outputs across all scenarios
              </p>
              
              {/* Key Assumptions Comparison */}
              <div className="space-y-6">
                <div>
                  <h5 className="font-medium mb-3">Key Assumptions</h5>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-3">Parameter</th>
                          {scenarios.map(scenario => (
                            <th key={scenario.name} className="text-center py-2 px-3 min-w-[100px]">
                              {scenario.name}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="py-2 px-3 font-medium">Revenue Growth (Y1)</td>
                          {scenarios.map(scenario => {
                            const growth = scenario.name === 'Base Case' 
                              ? (model?.inputs.revenueGrowthRates?.[0] || 0) * 100
                              : scenario.name === 'Bull Case' 
                                ? ((model?.inputs.revenueGrowthRates?.[0] || 0) * 1.5) * 100
                                : scenario.name === 'Bear Case'
                                  ? ((model?.inputs.revenueGrowthRates?.[0] || 0) * 0.5) * 100
                                  : scenario.name === 'High Growth'
                                    ? ((model?.inputs.revenueGrowthRates?.[0] || 0) * 2) * 100
                                    : scenario.name === 'Recession'
                                      ? -5
                                      : (model?.inputs.revenueGrowthRates?.[0] || 0) * 100
                            return (
                              <td key={scenario.name} className="text-center py-2 px-3">
                                {growth.toFixed(1)}%
                              </td>
                            )
                          })}
                        </tr>
                        <tr className="border-b">
                          <td className="py-2 px-3 font-medium">EBITDA Margin</td>
                          {scenarios.map(scenario => {
                            const margin = scenario.name === 'Base Case' 
                              ? (model?.inputs.operatingMargins?.[0] || 0) * 100
                              : scenario.name === 'Bull Case' 
                                ? ((model?.inputs.operatingMargins?.[0] || 0) * 1.2) * 100
                                : scenario.name === 'Bear Case'
                                  ? ((model?.inputs.operatingMargins?.[0] || 0) * 0.8) * 100
                                  : scenario.name === 'High Growth'
                                    ? ((model?.inputs.operatingMargins?.[0] || 0) * 1.1) * 100
                                    : scenario.name === 'Recession'
                                      ? ((model?.inputs.operatingMargins?.[0] || 0) * 0.7) * 100
                                      : (model?.inputs.operatingMargins?.[0] || 0) * 100
                            return (
                              <td key={scenario.name} className="text-center py-2 px-3">
                                {margin.toFixed(1)}%
                              </td>
                            )
                          })}
                        </tr>
                        <tr className="border-b">
                          <td className="py-2 px-3 font-medium">Terminal Growth</td>
                          {scenarios.map(scenario => {
                            const terminalGrowth = scenario.name === 'Base Case' 
                              ? (model?.inputs.terminalGrowthRate || 0) * 100
                              : scenario.name === 'Bull Case' 
                                ? ((model?.inputs.terminalGrowthRate || 0) + 0.005) * 100
                                : scenario.name === 'Bear Case'
                                  ? ((model?.inputs.terminalGrowthRate || 0) - 0.005) * 100
                                  : scenario.name === 'High Growth'
                                    ? ((model?.inputs.terminalGrowthRate || 0) + 0.01) * 100
                                    : scenario.name === 'Recession'
                                      ? ((model?.inputs.terminalGrowthRate || 0) - 0.01) * 100
                                      : (model?.inputs.terminalGrowthRate || 0) * 100
                            return (
                              <td key={scenario.name} className="text-center py-2 px-3">
                                {terminalGrowth.toFixed(1)}%
                              </td>
                            )
                          })}
                        </tr>
                        <tr>
                          <td className="py-2 px-3 font-medium">WACC</td>
                          {scenarios.map(scenario => {
                            const wacc = scenario.name === 'Base Case' 
                              ? (model?.valuation?.wacc || 0) * 100
                              : scenario.name === 'Bull Case' 
                                ? ((model?.valuation?.wacc || 0) - 0.005) * 100
                                : scenario.name === 'Bear Case'
                                  ? ((model?.valuation?.wacc || 0) + 0.005) * 100
                                  : scenario.name === 'High Growth'
                                    ? ((model?.valuation?.wacc || 0) - 0.01) * 100
                                    : scenario.name === 'Recession'
                                      ? ((model?.valuation?.wacc || 0) + 0.01) * 100
                                      : (model?.valuation?.wacc || 0) * 100
                            return (
                              <td key={scenario.name} className="text-center py-2 px-3">
                                {wacc.toFixed(1)}%
                              </td>
                            )
                          })}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Risk-Return Analysis */}
                <div>
                  <h5 className="font-medium mb-3">Risk-Return Profile</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {scenarios.filter(s => s.valuation).map((scenario, index) => {
                      const currentPrice = dcfData?.market.currentPrice || 0
                      const upside = scenario.valuation ? ((scenario.valuation.valuePerShare - currentPrice) / currentPrice) * 100 : 0
                      const risk = scenario.name === 'Bull Case' ? 'High' : 
                                   scenario.name === 'Bear Case' ? 'Low' : 
                                   scenario.name === 'High Growth' ? 'Very High' :
                                   scenario.name === 'Recession' ? 'Very Low' : 'Medium'
                      
                      return (
                        <div key={scenario.name} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h6 className="font-medium">{scenario.name}</h6>
                            <Badge variant={upside > 0 ? 'default' : 'destructive'}>
                              {upside > 0 ? '+' : ''}{upside.toFixed(1)}%
                            </Badge>
                          </div>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <div>Target: {formatCurrency(scenario.valuation?.valuePerShare || 0)}</div>
                            <div>Risk Level: {risk}</div>
                            <div>Probability: {
                              scenario.name === 'Base Case' ? '40%' :
                              scenario.name === 'Bull Case' ? '20%' :
                              scenario.name === 'Bear Case' ? '25%' :
                              scenario.name === 'High Growth' ? '10%' :
                              scenario.name === 'Recession' ? '5%' : '0%'
                            }</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Tornado Chart Tab */}
          <TabsContent value="tornado" className="space-y-6">
            <div>
              <h4 className="font-semibold mb-4">Parameter Sensitivity (Tornado Chart)</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Shows which parameters have the biggest impact on valuation
              </p>
              
              {/* Tornado Chart Placeholder */}
              <div className="space-y-4">
                {[
                  { param: 'Terminal Growth Rate', impact: 85, low: 180, high: 280 },
                  { param: 'WACC', impact: 72, low: 190, high: 270 },
                  { param: 'Revenue Growth (Y1-3)', impact: 45, low: 210, high: 250 },
                  { param: 'Operating Margin', impact: 38, low: 215, high: 245 },
                  { param: 'Tax Rate', impact: 25, low: 220, high: 240 },
                  { param: 'CapEx % Revenue', impact: 18, low: 225, high: 235 }
                ].map((item, index) => (
                  <div key={item.param} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{item.param}</span>
                      <span className="text-muted-foreground">±{item.impact} impact</span>
                    </div>
                    
                    <div className="relative">
                      {/* Base line */}
                      <div className="absolute left-1/2 top-0 w-0.5 h-8 bg-gray-400 transform -translate-x-0.5"></div>
                      
                      {/* Low bar */}
                      <div className="flex items-center h-4 mb-1">
                        <div 
                          className="bg-red-400 h-full rounded-l"
                          style={{ width: `${(230 - item.low) / 100 * 50}%` }}
                        ></div>
                        <div className="flex-1"></div>
                        <span className="text-xs text-muted-foreground w-12 text-right">${item.low}</span>
                      </div>
                      
                      {/* High bar */}
                      <div className="flex items-center h-4">
                        <div className="flex-1"></div>
                        <div 
                          className="bg-green-400 h-full rounded-r"
                          style={{ width: `${(item.high - 230) / 100 * 50}%` }}
                        ></div>
                        <span className="text-xs text-muted-foreground w-12 text-right">${item.high}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Target className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Key Insights:</p>
                    <p>• Terminal growth rate has the highest impact on valuation</p>
                    <p>• Focus sensitivity analysis on WACC and terminal assumptions</p>
                    <p>• Operating metrics have moderate impact compared to discount rate</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}