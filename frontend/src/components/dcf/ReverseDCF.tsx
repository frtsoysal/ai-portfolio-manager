'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DCFModel, DCFData } from '@/types/dcf'
import { runReverseDCFAnalysis, runWhatIfAnalysis } from '@/lib/dcf/reverse'
import { Calculator, Target, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

interface ReverseDCFProps {
  model: DCFModel | null
  dcfData: DCFData | null
}

export default function ReverseDCF({ model, dcfData }: ReverseDCFProps) {
  const [reverseAnalysis, setReverseAnalysis] = useState<any>(null)
  const [whatIfAnalysis, setWhatIfAnalysis] = useState<any[]>([])
  const [customTargetPrice, setCustomTargetPrice] = useState<string>('')
  const [isCalculating, setIsCalculating] = useState(false)

  useEffect(() => {
    if (model && dcfData) {
      calculateReverseAnalysis()
    }
  }, [model, dcfData])

  const calculateReverseAnalysis = async () => {
    if (!model || !dcfData) return
    
    setIsCalculating(true)
    try {
      // Run reverse analysis for current market price
      const analysis = runReverseDCFAnalysis(dcfData, model.inputs)
      setReverseAnalysis(analysis)
      
      // Run what-if analysis for different price targets
      const currentPrice = dcfData.market?.currentPrice || 0
      const priceTargets = [
        currentPrice * 0.8,  // -20%
        currentPrice * 0.9,  // -10%
        currentPrice,        // Current
        currentPrice * 1.1,  // +10%
        currentPrice * 1.2,  // +20%
        currentPrice * 1.3   // +30%
      ]
      
      const whatIf = runWhatIfAnalysis(dcfData, model.inputs, priceTargets)
      setWhatIfAnalysis(whatIf)
    } catch (error) {
      console.error('Error calculating reverse DCF:', error)
    } finally {
      setIsCalculating(false)
    }
  }

  const calculateCustomTarget = () => {
    if (!model || !dcfData || !customTargetPrice) return
    
    const targetPrice = parseFloat(customTargetPrice)
    if (isNaN(targetPrice) || targetPrice <= 0) return
    
    setIsCalculating(true)
    try {
      const analysis = runReverseDCFAnalysis(dcfData, model.inputs, targetPrice)
      setReverseAnalysis(analysis)
    } catch (error) {
      console.error('Error calculating custom target:', error)
    } finally {
      setIsCalculating(false)
    }
  }

  if (!model || !dcfData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reverse DCF Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading reverse DCF analysis...</p>
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

  const getFeasibilityIcon = (feasible: boolean) => {
    return feasible ? <CheckCircle className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-red-600" />
  }

  const getFeasibilityColor = (feasibility: string) => {
    switch (feasibility) {
      case 'High': return 'text-green-600 bg-green-50'
      case 'Medium': return 'text-yellow-600 bg-yellow-50'
      case 'Low': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calculator className="w-5 h-5" />
          <span>Reverse DCF Analysis</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="implied" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="implied">Market Expectations</TabsTrigger>
            <TabsTrigger value="whatif">What-If Analysis</TabsTrigger>
            <TabsTrigger value="custom">Custom Target</TabsTrigger>
          </TabsList>

          {/* Market Expectations Tab */}
          <TabsContent value="implied" className="space-y-6">
            {isCalculating ? (
              <div className="text-center py-8">
                <Calculator size={48} className="mx-auto text-muted-foreground mb-4 animate-pulse" />
                <p className="text-muted-foreground">Calculating implied assumptions...</p>
              </div>
            ) : reverseAnalysis ? (
              <div className="space-y-6">
                {/* Price Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-sm text-muted-foreground">Current Market Price</div>
                      <div className="text-2xl font-bold">{formatCurrency(reverseAnalysis.targetPrice)}</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-sm text-muted-foreground">DCF Model Price</div>
                      <div className="text-2xl font-bold">{formatCurrency(reverseAnalysis.currentModelPrice)}</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-sm text-muted-foreground">Market Premium</div>
                      <div className={`text-2xl font-bold ${reverseAnalysis.marketExpectations.isOptimistic ? 'text-red-600' : 'text-green-600'}`}>
                        {reverseAnalysis.marketExpectations.isOptimistic ? <TrendingUp className="w-6 h-6 mx-auto mb-1" /> : <TrendingDown className="w-6 h-6 mx-auto mb-1" />}
                        {formatPercent((reverseAnalysis.targetPrice - reverseAnalysis.currentModelPrice) / reverseAnalysis.currentModelPrice)}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Implied Assumptions */}
                <div>
                  <h4 className="font-semibold mb-4">What the Market is Pricing In</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardContent className="p-4">
                        <h5 className="font-medium mb-4">Required Assumptions</h5>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Terminal Growth Rate</span>
                            <div className="flex items-center space-x-2">
                              {getFeasibilityIcon(reverseAnalysis.feasibilityAssessment.terminalGrowthFeasible)}
                              <span className="font-medium">
                                {formatPercent(reverseAnalysis.impliedAssumptions.terminalGrowth.impliedTerminalGrowth)}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-sm">WACC</span>
                            <div className="flex items-center space-x-2">
                              {getFeasibilityIcon(reverseAnalysis.feasibilityAssessment.waccReasonable)}
                              <span className="font-medium">
                                {formatPercent(reverseAnalysis.impliedAssumptions.wacc.impliedWACC)}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Avg. Revenue Growth</span>
                            <div className="flex items-center space-x-2">
                              {getFeasibilityIcon(reverseAnalysis.feasibilityAssessment.growthAchievable)}
                              <span className="font-medium">
                                {formatPercent(reverseAnalysis.impliedAssumptions.revenueGrowth.avgGrowthRate)}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Avg. Operating Margin</span>
                            <div className="flex items-center space-x-2">
                              {getFeasibilityIcon(reverseAnalysis.feasibilityAssessment.marginsRealistic)}
                              <span className="font-medium">
                                {formatPercent(reverseAnalysis.impliedAssumptions.operatingMargins.avgMargin)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <h5 className="font-medium mb-4">Feasibility Assessment</h5>
                        
                        <div className="space-y-4">
                          <div className="text-center">
                            <Badge className={`text-lg px-4 py-2 ${getFeasibilityColor(reverseAnalysis.feasibilityAssessment.overallFeasibility)}`}>
                              {reverseAnalysis.feasibilityAssessment.overallFeasibility} Feasibility
                            </Badge>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="text-sm font-medium">Key Drivers:</div>
                            {reverseAnalysis.marketExpectations.keyDrivers.map((driver: string, index: number) => (
                              <div key={index} className="text-sm text-muted-foreground flex items-center space-x-2">
                                <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                                <span>{driver}</span>
                              </div>
                            ))}
                          </div>
                          
                          {reverseAnalysis.marketExpectations.riskFactors.length > 0 && (
                            <div className="space-y-2">
                              <div className="text-sm font-medium text-red-600">Risk Factors:</div>
                              {reverseAnalysis.marketExpectations.riskFactors.map((risk: string, index: number) => (
                                <div key={index} className="text-sm text-red-600 flex items-center space-x-2">
                                  <AlertTriangle className="w-3 h-3" />
                                  <span>{risk}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Market Conclusion */}
                <div className={`p-4 rounded-lg ${reverseAnalysis.marketExpectations.isRealistic ? 'bg-green-50' : 'bg-red-50'}`}>
                  <div className="flex items-start space-x-2">
                    {reverseAnalysis.marketExpectations.isRealistic ? 
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" /> : 
                      <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    }
                    <div className={`text-sm ${reverseAnalysis.marketExpectations.isRealistic ? 'text-green-800' : 'text-red-800'}`}>
                      <p className="font-medium mb-1">Market Expectations Analysis:</p>
                      {reverseAnalysis.marketExpectations.isRealistic ? (
                        <p>The market's implied assumptions appear <strong>reasonable</strong> and achievable based on the company's fundamentals and industry context.</p>
                      ) : (
                        <p>The market's implied assumptions appear <strong>overly optimistic</strong> and may be difficult to achieve based on historical performance and industry benchmarks.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </TabsContent>

          {/* What-If Analysis Tab */}
          <TabsContent value="whatif" className="space-y-6">
            <div>
              <h4 className="font-semibold mb-4">Price Target Scenarios</h4>
              <p className="text-sm text-muted-foreground mb-6">
                What assumptions would be required to justify different price targets?
              </p>
              
              {whatIfAnalysis.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-2">Target Price</th>
                        <th className="text-right py-3 px-2">vs Current</th>
                        <th className="text-right py-3 px-2">Terminal Growth</th>
                        <th className="text-right py-3 px-2">WACC</th>
                        <th className="text-right py-3 px-2">Revenue Growth</th>
                        <th className="text-right py-3 px-2">Op. Margin</th>
                        <th className="text-center py-3 px-2">Feasibility</th>
                        <th className="text-center py-3 px-2">Recommendation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {whatIfAnalysis.map((scenario, index) => (
                        <tr key={index} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-2 font-medium">
                            {formatCurrency(scenario.targetPrice)}
                          </td>
                          <td className={`text-right py-3 px-2 ${
                            scenario.targetPrice > (dcfData.market?.currentPrice || 0) ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {formatPercent((scenario.targetPrice - (dcfData.market?.currentPrice || 0)) / (dcfData.market?.currentPrice || 1))}
                          </td>
                          <td className="text-right py-3 px-2">
                            {formatPercent(scenario.requiredAssumptions.terminalGrowth)}
                          </td>
                          <td className="text-right py-3 px-2">
                            {formatPercent(scenario.requiredAssumptions.wacc)}
                          </td>
                          <td className="text-right py-3 px-2">
                            {formatPercent(scenario.requiredAssumptions.avgRevenueGrowth)}
                          </td>
                          <td className="text-right py-3 px-2">
                            {formatPercent(scenario.requiredAssumptions.avgOperatingMargin)}
                          </td>
                          <td className="text-center py-3 px-2">
                            <Badge className={getFeasibilityColor(scenario.feasibility)}>
                              {scenario.feasibility}
                            </Badge>
                          </td>
                          <td className="text-center py-3 px-2 text-xs">
                            {scenario.recommendation}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Custom Target Tab */}
          <TabsContent value="custom" className="space-y-6">
            <div>
              <h4 className="font-semibold mb-4">Custom Price Target Analysis</h4>
              <p className="text-sm text-muted-foreground mb-6">
                Enter a custom price target to see what assumptions would be required
              </p>
              
              <div className="flex space-x-4 items-end mb-6">
                <div className="flex-1">
                  <label htmlFor="custom-target" className="text-sm font-medium mb-2 block">
                    Target Price ($)
                  </label>
                  <Input
                    id="custom-target"
                    type="number"
                    placeholder="Enter target price"
                    value={customTargetPrice}
                    onChange={(e) => setCustomTargetPrice(e.target.value)}
                    min="0"
                    step="0.01"
                  />
                </div>
                <Button 
                  onClick={calculateCustomTarget}
                  disabled={!customTargetPrice || isCalculating}
                >
                  <Target className="w-4 h-4 mr-2" />
                  Analyze
                </Button>
              </div>
              
              {reverseAnalysis && parseFloat(customTargetPrice) === reverseAnalysis.targetPrice && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <h5 className="font-medium mb-3">Required Assumptions</h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Terminal Growth:</span>
                            <span className="font-medium">
                              {formatPercent(reverseAnalysis.impliedAssumptions.terminalGrowth.impliedTerminalGrowth)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>WACC:</span>
                            <span className="font-medium">
                              {formatPercent(reverseAnalysis.impliedAssumptions.wacc.impliedWACC)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Revenue Growth:</span>
                            <span className="font-medium">
                              {formatPercent(reverseAnalysis.impliedAssumptions.revenueGrowth.avgGrowthRate)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Operating Margin:</span>
                            <span className="font-medium">
                              {formatPercent(reverseAnalysis.impliedAssumptions.operatingMargins.avgMargin)}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <h5 className="font-medium mb-3">Feasibility Check</h5>
                        <div className="space-y-2">
                          <Badge className={`${getFeasibilityColor(reverseAnalysis.feasibilityAssessment.overallFeasibility)} text-center w-full`}>
                            {reverseAnalysis.feasibilityAssessment.overallFeasibility} Feasibility
                          </Badge>
                          
                          <div className="text-sm space-y-1">
                            <div className="flex items-center space-x-2">
                              {getFeasibilityIcon(reverseAnalysis.feasibilityAssessment.terminalGrowthFeasible)}
                              <span>Terminal Growth Rate</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              {getFeasibilityIcon(reverseAnalysis.feasibilityAssessment.waccReasonable)}
                              <span>WACC Assumptions</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              {getFeasibilityIcon(reverseAnalysis.feasibilityAssessment.growthAchievable)}
                              <span>Revenue Growth</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              {getFeasibilityIcon(reverseAnalysis.feasibilityAssessment.marginsRealistic)}
                              <span>Operating Margins</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
