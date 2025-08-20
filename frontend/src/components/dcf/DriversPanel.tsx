'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
// import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { DCFInputs, HistoricalFinancials } from '@/types/dcf'
import { calculateHistoricalMetrics } from '@/lib/dcf/projections'

interface DriversPanelProps {
  inputs: DCFInputs | null | undefined
  historical: HistoricalFinancials[]
  onChange: (newInputs: Partial<DCFInputs>) => void
}

export default function DriversPanel({ inputs, historical, onChange }: DriversPanelProps) {
  if (!inputs) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Growth & Margins</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading drivers...</p>
        </CardContent>
      </Card>
    )
  }

  // Calculate historical metrics for reference
  const metrics = calculateHistoricalMetrics(historical)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Growth & Margins</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Historical Reference */}
        <div className="space-y-2 p-3 bg-muted rounded-lg">
          <h5 className="text-sm font-medium">Historical Averages</h5>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">
              Revenue CAGR: {(metrics.revenueCAGR * 100).toFixed(1)}%
            </Badge>
            <Badge variant="outline">
              Gross Margin: {(metrics.medianGrossMargin * 100).toFixed(1)}%
            </Badge>
            <Badge variant="outline">
              Operating Margin: {(metrics.medianOperatingMargin * 100).toFixed(1)}%
            </Badge>
          </div>
        </div>

        {/* Revenue Growth */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold">Revenue Growth Rates (%)</h4>
          
          {inputs.revenueGrowthRates.map((rate, index) => (
            <div key={index} className="space-y-2">
              <label htmlFor={`growth-${index}`} className="text-sm font-medium">Year {index + 1}</label>
              <Input
                id={`growth-${index}`}
                type="number"
                step="0.1"
                value={(rate * 100).toFixed(1)}
                onChange={(e) => {
                  const newRates = [...inputs.revenueGrowthRates]
                  newRates[index] = parseFloat(e.target.value) / 100
                  onChange({ revenueGrowthRates: newRates })
                }}
              />
            </div>
          ))}
        </div>

        {/* Margins */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold">Operating Margins (%)</h4>
          
          {inputs.operatingMargins.map((margin, index) => (
            <div key={index} className="space-y-2">
              <label htmlFor={`margin-${index}`} className="text-sm font-medium">Year {index + 1}</label>
              <Input
                id={`margin-${index}`}
                type="number"
                step="0.1"
                value={(margin * 100).toFixed(1)}
                onChange={(e) => {
                  const newMargins = [...inputs.operatingMargins]
                  newMargins[index] = parseFloat(e.target.value) / 100
                  onChange({ operatingMargins: newMargins })
                }}
              />
            </div>
          ))}
        </div>

        {/* Capital Efficiency */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold">Capital Efficiency</h4>
          
          <div className="space-y-2">
            <label htmlFor="capex-percent" className="text-sm font-medium">CapEx (% of Revenue)</label>
            <Input
              id="capex-percent"
              type="number"
              step="0.1"
              value={(inputs.capexPercent[0] * 100).toFixed(1)}
              onChange={(e) => {
                const newPercent = parseFloat(e.target.value) / 100
                const newCapexPercent = Array(inputs.forecastPeriod).fill(newPercent)
                onChange({ capexPercent: newCapexPercent })
              }}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="depreciation-percent" className="text-sm font-medium">Depreciation (% of Revenue)</label>
            <Input
              id="depreciation-percent"
              type="number"
              step="0.1"
              value={(inputs.depreciationPercent[0] * 100).toFixed(1)}
              onChange={(e) => {
                const newPercent = parseFloat(e.target.value) / 100
                const newDepreciationPercent = Array(inputs.forecastPeriod).fill(newPercent)
                onChange({ depreciationPercent: newDepreciationPercent })
              }}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="nwc-percent" className="text-sm font-medium">Working Capital Change (% of Revenue Change)</label>
            <Input
              id="nwc-percent"
              type="number"
              step="0.1"
              value={(inputs.nwcPercent[0] * 100).toFixed(1)}
              onChange={(e) => {
                const newPercent = parseFloat(e.target.value) / 100
                const newNwcPercent = Array(inputs.forecastPeriod).fill(newPercent)
                onChange({ nwcPercent: newNwcPercent })
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}