'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ValuationResults } from '@/types/dcf'

interface ValuationCardProps {
  valuation: ValuationResults | null
  currency: string
}

export default function ValuationCard({ valuation, currency }: ValuationCardProps) {
  const formatCurrency = (value: number) => {
    if (value >= 1e9) return `${currency} ${(value / 1e9).toFixed(1)}B`
    if (value >= 1e6) return `${currency} ${(value / 1e6).toFixed(1)}M`
    return `${currency} ${value.toFixed(2)}`
  }

  if (!valuation) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>DCF Valuation</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Valuation will be calculated when inputs are provided</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Enterprise Value */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Enterprise Value</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">PV of FCF</span>
              <span className="font-medium">{formatCurrency(valuation.pvFcff)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Terminal Value</span>
              <span className="font-medium">{formatCurrency(valuation.pvTerminal)}</span>
            </div>
            <div className="border-t pt-2 flex justify-between font-bold">
              <span>Enterprise Value</span>
              <span>{formatCurrency(valuation.enterpriseValue)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Equity Bridge */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Equity Value Bridge</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Enterprise Value</span>
              <span className="font-medium">{formatCurrency(valuation.enterpriseValue)}</span>
            </div>
            <div className="flex justify-between text-red-600">
              <span className="text-sm">(-) Net Debt</span>
              <span className="font-medium">({formatCurrency(valuation.netDebt)})</span>
            </div>
            <div className="flex justify-between text-red-600">
              <span className="text-sm">(-) Minority Int.</span>
              <span className="font-medium">({formatCurrency(valuation.minorityInterest)})</span>
            </div>
            <div className="border-t pt-2 flex justify-between font-bold">
              <span>Equity Value</span>
              <span>{formatCurrency(valuation.equityValue)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Per Share Value */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Per Share Value</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Equity Value</span>
              <span className="font-medium">{formatCurrency(valuation.equityValue)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Diluted Shares</span>
              <span className="font-medium">{(valuation.sharesOutstanding / 1e6).toFixed(0)}M</span>
            </div>
            <div className="border-t pt-2 space-y-2">
              <div className="flex justify-between font-bold text-lg">
                <span>Value per Share</span>
                <span className="text-primary">
                  {currency} {valuation.valuePerShare.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Current Price</span>
                <span>{currency} {valuation.currentPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Upside</span>
                <Badge variant={valuation.upside >= 0 ? "default" : "destructive"}>
                  {valuation.upside > 0 ? '+' : ''}{(valuation.upside * 100).toFixed(1)}%
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
