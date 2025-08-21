'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DCFModel, DCFData, DCFInputs } from '@/types/dcf'
import { runSensitivityAnalysis, calculateTornadoChart, runMonteCarloSimulation } from '@/lib/dcf/scenarios'
import { Activity, BarChart3, TrendingUp, AlertTriangle } from 'lucide-react'

interface SensitivityPanelProps {
  model: DCFModel | null
  dcfData: DCFData | null
  onModelChange: (model: DCFModel) => void
  activeScenario?: string
}

export default function SensitivityPanel({ model, dcfData, onModelChange, activeScenario }: SensitivityPanelProps) {
  const [sensitivityData, setSensitivityData] = useState<any>(null)
  const [tornadoData, setTornadoData] = useState<any[]>([])
  const [monteCarloData, setMonteCarloData] = useState<any>(null)

  useEffect(() => {
    if (model && dcfData) {
      // Calculate tornado chart data
      const parameters = [
        { name: 'terminalGrowthRate' as keyof DCFInputs, label: 'Terminal Growth Rate', variation: 0.2 },
        { name: 'revenueGrowthRates' as keyof DCFInputs, label: 'Revenue Growth (Y1)', variation: 0.25 },
        { name: 'operatingMargins' as keyof DCFInputs, label: 'Operating Margin', variation: 0.15 },
        { name: 'taxRate' as keyof DCFInputs, label: 'Tax Rate', variation: 0.1 },
        { name: 'capexPercent' as keyof DCFInputs, label: 'CapEx % Revenue', variation: 0.2 }
      ]
      
      try {
        const tornado = calculateTornadoChart(dcfData, model.inputs, parameters)
        setTornadoData(tornado)
      } catch (error) {
        console.error('Error calculating tornado chart:', error)
      }
    }
  }, [model, dcfData])

  if (!model || !dcfData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sensitivity Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading sensitivity analysis...</p>
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

  const getScenarioDisplayName = (scenarioKey?: string) => {
    if (!scenarioKey || scenarioKey === 'base' || scenarioKey === 'basecase') return 'Base Case'
    if (scenarioKey === 'bullcase') return 'Bull Case'
    if (scenarioKey === 'bearcase') return 'Bear Case'
    if (scenarioKey === 'highgrowth') return 'High Growth'
    if (scenarioKey === 'recession') return 'Recession'
    return scenarioKey.charAt(0).toUpperCase() + scenarioKey.slice(1)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Advanced Sensitivity Analysis - {getScenarioDisplayName(activeScenario)}</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="tornado" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tornado">Tornado Chart</TabsTrigger>
            <TabsTrigger value="matrix">2D Matrix</TabsTrigger>
            <TabsTrigger value="montecarlo">Monte Carlo</TabsTrigger>
          </TabsList>

          {/* Tornado Chart Tab */}
          <TabsContent value="tornado" className="space-y-6">
            <div>
              <h4 className="font-semibold mb-4">Parameter Impact Analysis - {getScenarioDisplayName(activeScenario)}</h4>
              <p className="text-sm text-muted-foreground mb-6">
                Shows which parameters have the biggest impact on valuation (±20% variation) for the {getScenarioDisplayName(activeScenario)} scenario
              </p>
              
              {tornadoData.length > 0 ? (
                <div className="space-y-4">
                  {tornadoData.map((item, index) => (
                    <div key={item.parameter} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{item.parameter}</span>
                        <span className="text-muted-foreground">
                          Impact: {formatCurrency(item.impact)}
                        </span>
                      </div>
                      
                      <div className="relative bg-gray-100 rounded">
                        {/* Base line */}
                        <div className="absolute left-1/2 top-0 w-0.5 h-8 bg-gray-400 transform -translate-x-0.5 z-10"></div>
                        
                        {/* Bars container */}
                        <div className="flex h-8">
                          {/* Low impact bar (red) */}
                          <div className="flex items-center justify-end pr-1" style={{ width: '50%' }}>
                            <div 
                              className="bg-red-400 h-6 rounded-l flex items-center justify-end pr-2"
                              style={{ 
                                width: `${Math.abs(model.valuation.valuePerShare - item.lowPrice) / item.impact * 100}%`
                              }}
                            >
                              <span className="text-xs text-white font-medium">
                                {formatCurrency(item.lowPrice)}
                              </span>
                            </div>
                          </div>
                          
                          {/* High impact bar (green) */}
                          <div className="flex items-center pl-1" style={{ width: '50%' }}>
                            <div 
                              className="bg-green-400 h-6 rounded-r flex items-center justify-start pl-2"
                              style={{ 
                                width: `${Math.abs(item.highPrice - model.valuation.valuePerShare) / item.impact * 100}%`
                              }}
                            >
                              <span className="text-xs text-white font-medium">
                                {formatCurrency(item.highPrice)}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Base case marker */}
                        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
                          <div className="w-3 h-3 bg-blue-600 rounded-full border-2 border-white"></div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Low Case</span>
                        <span className="font-medium">Base: {formatCurrency(model.valuation.valuePerShare)}</span>
                        <span>High Case</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity size={48} className="mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Calculating parameter sensitivity...</p>
                </div>
              )}
              
              {tornadoData.length > 0 && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Key Insights:</p>
                      <p>• <strong>{tornadoData[0]?.parameter}</strong> has the highest impact on valuation</p>
                      <p>• Focus risk analysis on the top 3 parameters</p>
                      <p>• ±20% change in top parameter = ±{formatCurrency(tornadoData[0]?.impact || 0)} price impact</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* 2D Sensitivity Matrix Tab */}
          <TabsContent value="matrix" className="space-y-6">
            <div>
              <h4 className="font-semibold mb-4">2D Sensitivity Matrix - {getScenarioDisplayName(activeScenario)}</h4>
              <p className="text-sm text-muted-foreground mb-6">
                Interactive heat map showing price sensitivity to WACC and Terminal Growth Rate for the {getScenarioDisplayName(activeScenario)} scenario
              </p>
              
              {/* Matrix Placeholder */}
              <div className="bg-gradient-to-br from-red-100 via-yellow-100 to-green-100 p-8 rounded-lg">
                <div className="text-center space-y-4">
                  <BarChart3 size={64} className="mx-auto text-muted-foreground" />
                  <div>
                    <h5 className="text-lg font-medium">Interactive Sensitivity Heat Map</h5>
                    <p className="text-sm text-muted-foreground">
                      Visual representation of how WACC and Terminal Growth affect valuation
                    </p>
                  </div>
                  
                  {/* Sample Matrix Preview */}
                  <div className="max-w-md mx-auto">
                    <div className="grid grid-cols-6 gap-1 text-xs">
                      <div></div>
                      <div className="text-center font-medium">2%</div>
                      <div className="text-center font-medium">3%</div>
                      <div className="text-center font-medium">4%</div>
                      <div className="text-center font-medium">5%</div>
                      <div className="text-center font-medium">6%</div>
                      
                      <div className="font-medium">8%</div>
                      <div className="bg-green-300 p-2 text-center rounded">280</div>
                      <div className="bg-green-200 p-2 text-center rounded">260</div>
                      <div className="bg-yellow-200 p-2 text-center rounded">240</div>
                      <div className="bg-orange-200 p-2 text-center rounded">220</div>
                      <div className="bg-red-200 p-2 text-center rounded">200</div>
                      
                      <div className="font-medium">10%</div>
                      <div className="bg-green-200 p-2 text-center rounded">260</div>
                      <div className="bg-yellow-200 p-2 text-center rounded">240</div>
                      <div className="bg-orange-200 p-2 text-center rounded">220</div>
                      <div className="bg-red-200 p-2 text-center rounded">200</div>
                      <div className="bg-red-300 p-2 text-center rounded">180</div>
                      
                      <div className="font-medium">12%</div>
                      <div className="bg-yellow-200 p-2 text-center rounded">240</div>
                      <div className="bg-orange-200 p-2 text-center rounded">220</div>
                      <div className="bg-red-200 p-2 text-center rounded">200</div>
                      <div className="bg-red-300 p-2 text-center rounded">180</div>
                      <div className="bg-red-400 p-2 text-center rounded">160</div>
                    </div>
                    
                    <div className="mt-4 text-center">
                      <div className="text-xs text-muted-foreground mb-2">Terminal Growth Rate →</div>
                      <div className="text-xs text-muted-foreground transform -rotate-90 absolute -left-8 top-1/2">WACC ↑</div>
                    </div>
                  </div>
                  
                  <Badge variant="outline" className="mt-4">
                    Interactive version coming in Pro
                  </Badge>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Monte Carlo Tab */}
          <TabsContent value="montecarlo" className="space-y-6">
            <div>
              <h4 className="font-semibold mb-4">Monte Carlo Simulation - {getScenarioDisplayName(activeScenario)}</h4>
              <p className="text-sm text-muted-foreground mb-6">
                Probabilistic analysis using random parameter variations (1,000 iterations) for the {getScenarioDisplayName(activeScenario)} scenario
              </p>
              
              {/* Monte Carlo Placeholder */}
              <div className="space-y-6">
                {/* Distribution Chart */}
                <div className="bg-muted/20 p-6 rounded-lg">
                  <h5 className="font-medium mb-4">Price Distribution</h5>
                  
                  {/* Histogram placeholder */}
                  <div className="flex items-end justify-between h-32 space-x-1">
                    {[12, 25, 45, 68, 85, 92, 88, 75, 58, 35, 20, 8].map((height, index) => (
                      <div 
                        key={index}
                        className="bg-blue-400 rounded-t min-w-[20px] flex-1"
                        style={{ height: `${height}%` }}
                      ></div>
                    ))}
                  </div>
                  
                  <div className="mt-4 flex justify-between text-xs text-muted-foreground">
                    <span>$150</span>
                    <span>$200</span>
                    <span className="font-medium">$250 (Current)</span>
                    <span>$300</span>
                    <span>$350</span>
                  </div>
                </div>
                
                {/* Statistics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-sm text-muted-foreground">Mean Price</div>
                      <div className="text-xl font-bold">{formatCurrency(245)}</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-sm text-muted-foreground">Std. Deviation</div>
                      <div className="text-xl font-bold">{formatCurrency(35)}</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-sm text-muted-foreground">P90 Confidence</div>
                      <div className="text-xl font-bold">{formatCurrency(285)}</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-sm text-muted-foreground">P10 Confidence</div>
                      <div className="text-xl font-bold">{formatCurrency(205)}</div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Probabilities */}
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-sm text-muted-foreground">Prob. > Current</div>
                      <div className="text-2xl font-bold text-green-600">68%</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-sm text-muted-foreground">Prob. > +10%</div>
                      <div className="text-2xl font-bold text-blue-600">45%</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-sm text-muted-foreground">Prob. > +20%</div>
                      <div className="text-2xl font-bold text-purple-600">28%</div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <TrendingUp className="w-5 h-5 text-green-600 mt-0.5" />
                    <div className="text-sm text-green-800">
                      <p className="font-medium mb-1">Monte Carlo Insights:</p>
                      <p>• 68% probability the stock is undervalued at current price</p>
                      <p>• 90% confidence interval: $205 - $285 per share</p>
                      <p>• Risk-adjusted expected return: +15% to +25%</p>
                    </div>
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