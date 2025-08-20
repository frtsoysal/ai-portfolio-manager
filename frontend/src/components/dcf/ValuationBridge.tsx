'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DCFModel } from '@/types/dcf'
import { ArrowDown, ArrowRight, TrendingUp, TrendingDown } from 'lucide-react'

interface ValuationBridgeProps {
  model: DCFModel | null
  currency: string
}

export default function ValuationBridge({ model, currency }: ValuationBridgeProps) {
  if (!model) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Valuation Bridge</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading valuation bridge...</p>
        </CardContent>
      </Card>
    )
  }

  const valuation = model.valuation

  const formatCurrency = (value: number, compact = true) => {
    if (compact) {
      if (Math.abs(value) >= 1e9) return `${currency} ${(value / 1e9).toFixed(1)}B`
      if (Math.abs(value) >= 1e6) return `${currency} ${(value / 1e6).toFixed(1)}M`
    }
    return `${currency} ${value.toLocaleString()}`
  }

  const formatPercent = (value: number) => {
    return `${(value * 100).toFixed(1)}%`
  }

  // Calculate percentages for waterfall
  const totalAdjustments = Math.abs(valuation.netDebt) + Math.abs(valuation.minorityInterest) + Math.abs(valuation.investments)
  const adjustmentPercentage = totalAdjustments > 0 ? (totalAdjustments / valuation.enterpriseValue) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Main Valuation Bridge */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Valuation Bridge: Enterprise Value → Equity Value
            <Badge variant={valuation.upside >= 0 ? "default" : "destructive"}>
              {valuation.upside >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
              {valuation.upside > 0 ? '+' : ''}{formatPercent(valuation.upside)}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Waterfall Chart (SVG-based) */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold">Waterfall Analysis</h4>
              <div className="text-sm text-muted-foreground">
                From Enterprise Value to Share Price
              </div>
            </div>
            
            {/* SVG Waterfall */}
            <div className="bg-muted/20 p-6 rounded-lg overflow-x-auto">
              <div className="flex items-end justify-between min-w-[800px] h-48 relative">
                {/* Enterprise Value */}
                <div className="flex flex-col items-center">
                  <div className="bg-blue-500 text-white px-3 py-8 rounded-t text-center min-w-[120px] flex items-center justify-center">
                    <div>
                      <div className="text-xs">Enterprise</div>
                      <div className="text-xs">Value</div>
                      <div className="font-bold text-sm mt-1">{formatCurrency(valuation.enterpriseValue)}</div>
                    </div>
                  </div>
                  <div className="text-xs text-center mt-2 font-medium">Starting Point</div>
                </div>

                <ArrowRight className="text-muted-foreground" size={20} />

                {/* Net Debt Adjustment */}
                <div className="flex flex-col items-center">
                  <div className={`${valuation.netDebt > 0 ? 'bg-red-500' : 'bg-green-500'} text-white px-3 py-4 rounded-t text-center min-w-[100px] flex items-center justify-center`}>
                    <div>
                      <div className="text-xs">{valuation.netDebt > 0 ? '(-)' : '(+)'} Net Debt</div>
                      <div className="font-bold text-sm mt-1">
                        {valuation.netDebt > 0 ? '(' : ''}{formatCurrency(Math.abs(valuation.netDebt))}{valuation.netDebt > 0 ? ')' : ''}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-center mt-2">
                    <div>Cash: {formatCurrency(valuation.cash)}</div>
                    <div>Debt: {formatCurrency(valuation.debt)}</div>
                  </div>
                </div>

                <ArrowRight className="text-muted-foreground" size={20} />

                {/* Minority Interest */}
                {valuation.minorityInterest > 0 && (
                  <>
                    <div className="flex flex-col items-center">
                      <div className="bg-red-500 text-white px-3 py-4 rounded-t text-center min-w-[100px] flex items-center justify-center">
                        <div>
                          <div className="text-xs">(-) Minority</div>
                          <div className="text-xs">Interest</div>
                          <div className="font-bold text-sm mt-1">({formatCurrency(valuation.minorityInterest)})</div>
                        </div>
                      </div>
                      <div className="text-xs text-center mt-2">Non-controlling</div>
                    </div>
                    <ArrowRight className="text-muted-foreground" size={20} />
                  </>
                )}

                {/* Investments */}
                {valuation.investments > 0 && (
                  <>
                    <div className="flex flex-col items-center">
                      <div className="bg-green-500 text-white px-3 py-4 rounded-t text-center min-w-[100px] flex items-center justify-center">
                        <div>
                          <div className="text-xs">(+) Investments</div>
                          <div className="font-bold text-sm mt-1">{formatCurrency(valuation.investments)}</div>
                        </div>
                      </div>
                      <div className="text-xs text-center mt-2">Non-core assets</div>
                    </div>
                    <ArrowRight className="text-muted-foreground" size={20} />
                  </>
                )}

                {/* Equity Value */}
                <div className="flex flex-col items-center">
                  <div className="bg-purple-500 text-white px-3 py-8 rounded-t text-center min-w-[120px] flex items-center justify-center">
                    <div>
                      <div className="text-xs">Equity</div>
                      <div className="text-xs">Value</div>
                      <div className="font-bold text-sm mt-1">{formatCurrency(valuation.equityValue)}</div>
                    </div>
                  </div>
                  <div className="text-xs text-center mt-2 font-medium">Total Equity</div>
                </div>

                <ArrowDown className="text-muted-foreground" size={20} />

                {/* Per Share Value */}
                <div className="flex flex-col items-center">
                  <div className="bg-green-600 text-white px-3 py-8 rounded-t text-center min-w-[120px] flex items-center justify-center">
                    <div>
                      <div className="text-xs">Value per</div>
                      <div className="text-xs">Share</div>
                      <div className="font-bold text-lg mt-1">{currency} {valuation.valuePerShare.toFixed(2)}</div>
                    </div>
                  </div>
                  <div className="text-xs text-center mt-2">
                    <div className="font-medium">Target Price</div>
                    <div>vs {currency} {valuation.currentPrice.toFixed(2)} current</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Breakdown Table */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Bridge Calculation */}
            <div className="space-y-4">
              <h4 className="font-semibold">Bridge Calculation</h4>
              
              <div className="space-y-3 border rounded-lg p-4">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="font-medium text-blue-600">Enterprise Value</span>
                  <span className="font-bold text-blue-600">{formatCurrency(valuation.enterpriseValue, false)}</span>
                </div>
                
                <div className="flex justify-between items-center py-1">
                  <span className="text-sm pl-4">Present Value of FCFs</span>
                  <span className="text-sm">{formatCurrency(valuation.pvFcff, false)}</span>
                </div>
                
                <div className="flex justify-between items-center py-1 border-b">
                  <span className="text-sm pl-4">Present Value of Terminal</span>
                  <span className="text-sm">{formatCurrency(valuation.pvTerminal, false)}</span>
                </div>

                <div className="flex justify-between items-center py-2 text-red-600">
                  <span>(-) Net Debt</span>
                  <span>{valuation.netDebt > 0 ? '(' : ''}{formatCurrency(Math.abs(valuation.netDebt), false)}{valuation.netDebt > 0 ? ')' : ''}</span>
                </div>
                
                <div className="flex justify-between items-center py-1 text-red-600">
                  <span className="text-xs pl-4">Cash & Equivalents</span>
                  <span className="text-xs">{formatCurrency(valuation.cash, false)}</span>
                </div>
                
                <div className="flex justify-between items-center py-1 text-red-600 border-b">
                  <span className="text-xs pl-4">Total Debt</span>
                  <span className="text-xs">({formatCurrency(valuation.debt, false)})</span>
                </div>

                {valuation.minorityInterest > 0 && (
                  <div className="flex justify-between items-center py-2 text-red-600">
                    <span>(-) Minority Interest</span>
                    <span>({formatCurrency(valuation.minorityInterest, false)})</span>
                  </div>
                )}

                {valuation.investments > 0 && (
                  <div className="flex justify-between items-center py-2 text-green-600">
                    <span>(+) Investments</span>
                    <span>{formatCurrency(valuation.investments, false)}</span>
                  </div>
                )}

                <div className="flex justify-between items-center py-3 border-t-2 border-purple-200">
                  <span className="font-bold text-purple-600">Equity Value</span>
                  <span className="font-bold text-purple-600">{formatCurrency(valuation.equityValue, false)}</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b">
                  <span>Shares Outstanding (M)</span>
                  <span>{(valuation.sharesOutstanding / 1e6).toFixed(1)}M</span>
                </div>

                <div className="flex justify-between items-center py-3 border-t-2 border-green-200">
                  <span className="font-bold text-green-600 text-lg">Value per Share</span>
                  <span className="font-bold text-green-600 text-xl">{currency} {valuation.valuePerShare.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Right Column - Analysis & Context */}
            <div className="space-y-4">
              <h4 className="font-semibold">Valuation Analysis</h4>
              
              {/* Current vs Target */}
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Current Price</span>
                      <span className="font-medium">{currency} {valuation.currentPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">DCF Target Price</span>
                      <span className="font-bold text-primary">{currency} {valuation.valuePerShare.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="font-medium">Upside/Downside</span>
                      <Badge variant={valuation.upside >= 0 ? "default" : "destructive"} className="text-sm">
                        {valuation.upside > 0 ? '+' : ''}{formatPercent(valuation.upside)}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Price Target</span>
                      <span className={`font-medium ${valuation.upside >= 0.15 ? 'text-green-600' : valuation.upside >= 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {valuation.upside >= 0.15 ? 'Strong Buy' : valuation.upside >= 0 ? 'Buy' : 'Sell'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Key Metrics */}
              <Card>
                <CardContent className="p-4">
                  <h5 className="font-medium mb-3">Key Valuation Metrics</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Enterprise Value</span>
                      <span>{formatCurrency(valuation.enterpriseValue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Market Cap (Current)</span>
                      <span>{formatCurrency(valuation.currentPrice * valuation.sharesOutstanding)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Market Cap (DCF)</span>
                      <span>{formatCurrency(valuation.equityValue)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-muted-foreground">EV/Revenue (TTM)</span>
                      <span>{valuation.impliedEVRevenue.toFixed(1)}x</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">EV/EBIT (TTM)</span>
                      <span>{valuation.impliedEVEBIT.toFixed(1)}x</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Implied P/E</span>
                      <span>{valuation.impliedPE.toFixed(1)}x</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Risk Factors */}
              <Card>
                <CardContent className="p-4">
                  <h5 className="font-medium mb-3">Key Risk Factors</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Terminal Value % of EV</span>
                      <span className={`font-medium ${(valuation.pvTerminal / valuation.enterpriseValue) > 0.7 ? 'text-red-600' : 'text-green-600'}`}>
                        {((valuation.pvTerminal / valuation.enterpriseValue) * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Net Debt Impact</span>
                      <span>{((Math.abs(valuation.netDebt) / valuation.enterpriseValue) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">WACC Sensitivity</span>
                      <span className="text-yellow-600">High</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
