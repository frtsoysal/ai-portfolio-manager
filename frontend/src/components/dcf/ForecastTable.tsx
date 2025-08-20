'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ProjectionLine } from '@/types/dcf'

interface ForecastTableProps {
  projections: ProjectionLine[]
  currency: string
}

export default function ForecastTable({ projections, currency }: ForecastTableProps) {
  if (!projections || projections.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Financial Forecasts</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading forecast data...</p>
        </CardContent>
      </Card>
    )
  }

  // Separate historical and forecast data
  const historicalData = projections.filter(p => p.isHistory)
  const forecastData = projections.filter(p => !p.isHistory)
  const allData = [...historicalData.slice(-3), ...forecastData] // Show last 3 historical + all forecasts

  const formatCurrency = (value: number, compact = true) => {
    if (compact) {
      if (Math.abs(value) >= 1e9) return `${currency} ${(value / 1e9).toFixed(1)}B`
      if (Math.abs(value) >= 1e6) return `${currency} ${(value / 1e6).toFixed(1)}M`
      if (Math.abs(value) >= 1e3) return `${currency} ${(value / 1e3).toFixed(1)}K`
    }
    return `${currency} ${value.toFixed(0)}`
  }

  const formatPercent = (value: number) => {
    return `${(value * 100).toFixed(1)}%`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Financial Forecasts
          <div className="flex gap-2">
            <Badge variant="outline">Historical</Badge>
            <Badge variant="default">Forecast</Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-2 font-medium">Metric</th>
                {allData.map((projection) => (
                  <th key={projection.year} className="text-right py-3 px-2 font-medium min-w-[100px]">
                    <div className="flex flex-col items-end">
                      <span>{projection.year}</span>
                      {projection.isHistory ? (
                        <Badge variant="outline" className="text-xs mt-1">LTM</Badge>
                      ) : projection.isTerminal ? (
                        <Badge variant="default" className="text-xs mt-1">Terminal</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs mt-1">Y+{typeof projection.year === 'number' ? projection.year - new Date().getFullYear() : 1}</Badge>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Revenue */}
              <tr className="border-b hover:bg-muted/50">
                <td className="py-3 px-2 font-medium">Revenue</td>
                {allData.map((projection) => (
                  <td key={projection.year} className="text-right py-3 px-2">
                    {formatCurrency(projection.revenue)}
                  </td>
                ))}
              </tr>

              {/* Revenue Growth */}
              <tr className="border-b hover:bg-muted/50 bg-muted/20">
                <td className="py-3 px-2 text-muted-foreground text-xs pl-4">Revenue Growth</td>
                {allData.map((projection) => (
                  <td key={projection.year} className="text-right py-3 px-2 text-xs text-muted-foreground">
                    {projection.revenueGrowth !== 0 ? formatPercent(projection.revenueGrowth) : '-'}
                  </td>
                ))}
              </tr>

              {/* Gross Profit */}
              <tr className="border-b hover:bg-muted/50">
                <td className="py-3 px-2 font-medium">Gross Profit</td>
                {allData.map((projection) => (
                  <td key={projection.year} className="text-right py-3 px-2">
                    {formatCurrency(projection.grossProfit)}
                  </td>
                ))}
              </tr>

              {/* Gross Margin */}
              <tr className="border-b hover:bg-muted/50 bg-muted/20">
                <td className="py-3 px-2 text-muted-foreground text-xs pl-4">Gross Margin</td>
                {allData.map((projection) => (
                  <td key={projection.year} className="text-right py-3 px-2 text-xs text-muted-foreground">
                    {formatPercent(projection.grossMargin)}
                  </td>
                ))}
              </tr>

              {/* EBIT */}
              <tr className="border-b hover:bg-muted/50">
                <td className="py-3 px-2 font-medium">EBIT</td>
                {allData.map((projection) => (
                  <td key={projection.year} className="text-right py-3 px-2">
                    {formatCurrency(projection.ebit)}
                  </td>
                ))}
              </tr>

              {/* Operating Margin */}
              <tr className="border-b hover:bg-muted/50 bg-muted/20">
                <td className="py-3 px-2 text-muted-foreground text-xs pl-4">Operating Margin</td>
                {allData.map((projection) => (
                  <td key={projection.year} className="text-right py-3 px-2 text-xs text-muted-foreground">
                    {formatPercent(projection.operatingMargin)}
                  </td>
                ))}
              </tr>

              {/* NOPAT */}
              <tr className="border-b hover:bg-muted/50">
                <td className="py-3 px-2 font-medium">NOPAT</td>
                {allData.map((projection) => (
                  <td key={projection.year} className="text-right py-3 px-2">
                    {formatCurrency(projection.nopat)}
                  </td>
                ))}
              </tr>

              {/* Depreciation */}
              <tr className="border-b hover:bg-muted/50">
                <td className="py-3 px-2 font-medium">Depreciation</td>
                {allData.map((projection) => (
                  <td key={projection.year} className="text-right py-3 px-2">
                    {formatCurrency(projection.depreciation)}
                  </td>
                ))}
              </tr>

              {/* CapEx */}
              <tr className="border-b hover:bg-muted/50">
                <td className="py-3 px-2 font-medium">CapEx</td>
                {allData.map((projection) => (
                  <td key={projection.year} className="text-right py-3 px-2 text-red-600">
                    ({formatCurrency(projection.capex)})
                  </td>
                ))}
              </tr>

              {/* Change in NWC */}
              <tr className="border-b hover:bg-muted/50">
                <td className="py-3 px-2 font-medium">Δ Working Capital</td>
                {allData.map((projection) => (
                  <td key={projection.year} className={`text-right py-3 px-2 ${projection.changeInWorkingCapital > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {projection.changeInWorkingCapital > 0 ? '(' : ''}
                    {formatCurrency(Math.abs(projection.changeInWorkingCapital))}
                    {projection.changeInWorkingCapital > 0 ? ')' : ''}
                  </td>
                ))}
              </tr>

              {/* Stock Compensation */}
              <tr className="border-b hover:bg-muted/50">
                <td className="py-3 px-2 font-medium">Stock Compensation</td>
                {allData.map((projection) => (
                  <td key={projection.year} className="text-right py-3 px-2">
                    {formatCurrency(projection.stockCompensation)}
                  </td>
                ))}
              </tr>

              {/* FCFF - Highlighted */}
              <tr className="border-b-2 border-primary bg-primary/5 hover:bg-primary/10">
                <td className="py-4 px-2 font-bold text-primary">Free Cash Flow to Firm</td>
                {allData.map((projection) => (
                  <td key={projection.year} className="text-right py-4 px-2 font-bold text-primary">
                    {formatCurrency(projection.fcff)}
                  </td>
                ))}
              </tr>

              {/* Discount Factor */}
              <tr className="border-b hover:bg-muted/50 bg-muted/20">
                <td className="py-3 px-2 text-muted-foreground text-xs pl-4">Discount Factor</td>
                {allData.map((projection) => (
                  <td key={projection.year} className="text-right py-3 px-2 text-xs text-muted-foreground">
                    {projection.isHistory ? '-' : projection.discountFactor.toFixed(3)}
                  </td>
                ))}
              </tr>

              {/* Present Value */}
              <tr className="border-b hover:bg-muted/50 bg-muted/20">
                <td className="py-3 px-2 text-muted-foreground text-xs pl-4">Present Value</td>
                {allData.map((projection) => (
                  <td key={projection.year} className="text-right py-3 px-2 text-xs text-muted-foreground">
                    {projection.isHistory ? '-' : formatCurrency(projection.discountedFcff)}
                  </td>
                ))}
              </tr>

              {/* Terminal Value (only for terminal year) */}
              {forecastData.some(p => p.isTerminal && (p.terminalValue || p.discountedTerminalValue)) && (
                <>
                  <tr className="border-b hover:bg-muted/50 bg-green-50">
                    <td className="py-3 px-2 font-medium text-green-700">Terminal Value</td>
                    {allData.map((projection) => (
                      <td key={projection.year} className="text-right py-3 px-2 font-medium text-green-700">
                        {projection.isTerminal && projection.terminalValue 
                          ? formatCurrency(projection.terminalValue)
                          : '-'
                        }
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b hover:bg-muted/50 bg-green-50">
                    <td className="py-3 px-2 text-muted-foreground text-xs pl-4 text-green-600">PV of Terminal Value</td>
                    {allData.map((projection) => (
                      <td key={projection.year} className="text-right py-3 px-2 text-xs text-green-600">
                        {projection.isTerminal && projection.discountedTerminalValue 
                          ? formatCurrency(projection.discountedTerminalValue)
                          : '-'
                        }
                      </td>
                    ))}
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Sum of PV of FCFs</div>
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(forecastData.reduce((sum, p) => sum + p.discountedFcff, 0))}
              </div>
            </CardContent>
          </Card>

          {forecastData.find(p => p.isTerminal && p.discountedTerminalValue) && (
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">PV of Terminal Value</div>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(forecastData.find(p => p.isTerminal)?.discountedTerminalValue || 0)}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Enterprise Value</div>
              <div className="text-2xl font-bold">
                {formatCurrency(
                  forecastData.reduce((sum, p) => sum + p.discountedFcff, 0) + 
                  (forecastData.find(p => p.isTerminal)?.discountedTerminalValue || 0)
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  )
}