'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DCFModel } from '@/types/dcf'

interface TerminalValueCardProps {
  model: DCFModel | null
  currency: string
}

export default function TerminalValueCard({ model, currency }: TerminalValueCardProps) {
  if (!model) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Terminal Value Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading terminal value analysis...</p>
        </CardContent>
      </Card>
    )
  }

  const terminalYear = model.projections.find(p => p.isTerminal)
  const valuation = model.valuation

  const formatCurrency = (value: number) => {
    if (Math.abs(value) >= 1e9) return `${currency} ${(value / 1e9).toFixed(1)}B`
    if (Math.abs(value) >= 1e6) return `${currency} ${(value / 1e6).toFixed(1)}M`
    return `${currency} ${value.toFixed(0)}`
  }

  const formatPercent = (value: number) => {
    return `${(value * 100).toFixed(1)}%`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Terminal Value Analysis
          <Badge variant={model.inputs.terminalMethod === 'gordon' ? 'default' : 'secondary'}>
            {model.inputs.terminalMethod === 'gordon' ? 'Gordon Growth' : 'Exit Multiple'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Method Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="font-semibold">Method & Assumptions</h4>
            
            {model.inputs.terminalMethod === 'gordon' ? (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Terminal Growth Rate:</span>
                  <span className="font-medium">{formatPercent(model.inputs.terminalGrowthRate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">WACC:</span>
                  <span className="font-medium">{formatPercent(valuation.wacc)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Spread (WACC - g):</span>
                  <span className="font-medium">{formatPercent(valuation.wacc - model.inputs.terminalGrowthRate)}</span>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Exit Multiple:</span>
                  <span className="font-medium">{model.inputs.exitMultiple.toFixed(1)}x EBIT</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Terminal EBIT:</span>
                  <span className="font-medium">{terminalYear ? formatCurrency(terminalYear.ebit) : '-'}</span>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold">Terminal Year Metrics</h4>
            
            {terminalYear && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Revenue:</span>
                  <span className="font-medium">{formatCurrency(terminalYear.revenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">FCFF:</span>
                  <span className="font-medium">{formatCurrency(terminalYear.fcff)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Operating Margin:</span>
                  <span className="font-medium">{formatPercent(terminalYear.operatingMargin)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Terminal Value Calculation */}
        <div className="border-t pt-4">
          <h4 className="font-semibold mb-3">Terminal Value Calculation</h4>
          
          <div className="space-y-3">
            {model.inputs.terminalMethod === 'gordon' && terminalYear ? (
              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <div className="text-sm font-mono">
                  Terminal Value = FCF<sub>t+1</sub> / (WACC - g)
                </div>
                <div className="text-sm font-mono">
                  = {formatCurrency(terminalYear.fcff * (1 + model.inputs.terminalGrowthRate))} / ({formatPercent(valuation.wacc)} - {formatPercent(model.inputs.terminalGrowthRate)})
                </div>
                <div className="text-lg font-bold text-primary">
                  = {formatCurrency(valuation.pvTerminal * terminalYear.discountFactor)}
                </div>
              </div>
            ) : (
              terminalYear && (
                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                  <div className="text-sm font-mono">
                    Terminal Value = EBIT × Exit Multiple
                  </div>
                  <div className="text-sm font-mono">
                    = {formatCurrency(terminalYear.ebit)} × {model.inputs.exitMultiple.toFixed(1)}x
                  </div>
                  <div className="text-lg font-bold text-primary">
                    = {formatCurrency(terminalYear.ebit * model.inputs.exitMultiple)}
                  </div>
                </div>
              )
            )}

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <div className="text-sm text-muted-foreground">Terminal Value</div>
                <div className="text-xl font-bold">
                  {formatCurrency(valuation.pvTerminal * (terminalYear?.discountFactor || 1))}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Present Value</div>
                <div className="text-xl font-bold text-green-600">
                  {formatCurrency(valuation.pvTerminal)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Terminal Multiples */}
        <div className="border-t pt-4">
          <h4 className="font-semibold mb-3">Implied Terminal Multiples</h4>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-sm text-muted-foreground">EV/Revenue</div>
              <div className="text-lg font-bold">{valuation.terminalEVRevenue.toFixed(1)}x</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">EV/EBIT</div>
              <div className="text-lg font-bold">{valuation.terminalEVEBIT.toFixed(1)}x</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">FCF Yield</div>
              <div className="text-lg font-bold">{formatPercent(valuation.terminalFcffYield)}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">% of EV</div>
              <div className="text-lg font-bold">
                {((valuation.pvTerminal / valuation.enterpriseValue) * 100).toFixed(0)}%
              </div>
            </div>
          </div>
        </div>

        {/* Sensitivity Note */}
        <div className="border-t pt-4">
          <div className="bg-yellow-50 p-3 rounded-lg">
            <div className="text-sm text-yellow-800">
              <strong>Note:</strong> Terminal value represents {((valuation.pvTerminal / valuation.enterpriseValue) * 100).toFixed(0)}% 
              of total enterprise value. Small changes in terminal assumptions can significantly impact valuation.
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
