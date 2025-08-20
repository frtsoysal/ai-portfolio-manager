'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProjectionLine } from '@/types/dcf'

interface ForecastChartsProps {
  projections: ProjectionLine[]
  currency: string
}

export default function ForecastCharts({ projections, currency }: ForecastChartsProps) {
  if (!projections || projections.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Loading chart data...</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>FCFF Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Loading chart data...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Prepare data for charts
  const forecastData = projections.filter(p => !p.isHistory)
  const allData = [...projections.filter(p => p.isHistory).slice(-2), ...forecastData]

  // Simple SVG-based mini charts
  const createMiniChart = (data: number[], color = '#3b82f6', height = 80) => {
    if (data.length === 0) return null
    
    const max = Math.max(...data)
    const min = Math.min(...data)
    const range = max - min || 1
    
    const width = 300
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * width
      const y = height - ((value - min) / range) * height
      return `${x},${y}`
    }).join(' ')
    
    return (
      <svg width={width} height={height} className="w-full h-full">
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          className="drop-shadow-sm"
        />
        {data.map((value, index) => {
          const x = (index / (data.length - 1)) * width
          const y = height - ((value - min) / range) * height
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="3"
              fill={color}
              className="drop-shadow-sm"
            />
          )
        })}
      </svg>
    )
  }

  const formatCurrency = (value: number) => {
    if (Math.abs(value) >= 1e9) return `${currency} ${(value / 1e9).toFixed(1)}B`
    if (Math.abs(value) >= 1e6) return `${currency} ${(value / 1e6).toFixed(1)}M`
    return `${currency} ${value.toFixed(0)}`
  }

  const revenueData = allData.map(p => p.revenue / 1e9) // Convert to billions
  const fcffData = allData.map(p => p.fcff / 1e9) // Convert to billions
  const marginData = allData.map(p => p.operatingMargin * 100) // Convert to percentage

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Revenue Growth Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Revenue Trend</CardTitle>
          <div className="text-sm text-muted-foreground">
            {allData.length > 1 && (
              <span>
                CAGR: {(Math.pow(allData[allData.length - 1].revenue / allData[0].revenue, 1 / (allData.length - 1)) - 1 * 100).toFixed(1)}%
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-20 mb-4">
            {createMiniChart(revenueData, '#3b82f6')}
          </div>
          <div className="space-y-2">
            {allData.map((projection, index) => (
              <div key={projection.year} className="flex justify-between text-xs">
                <span className={projection.isHistory ? 'text-muted-foreground' : 'font-medium'}>
                  {projection.year}
                </span>
                <span className={projection.isHistory ? 'text-muted-foreground' : 'font-medium'}>
                  {formatCurrency(projection.revenue)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* FCFF Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Free Cash Flow</CardTitle>
          <div className="text-sm text-muted-foreground">
            To Firm (FCFF)
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-20 mb-4">
            {createMiniChart(fcffData, '#10b981')}
          </div>
          <div className="space-y-2">
            {allData.map((projection, index) => (
              <div key={projection.year} className="flex justify-between text-xs">
                <span className={projection.isHistory ? 'text-muted-foreground' : 'font-medium'}>
                  {projection.year}
                </span>
                <span className={`${projection.isHistory ? 'text-muted-foreground' : 'font-medium'} ${projection.fcff < 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {formatCurrency(projection.fcff)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Operating Margin Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Operating Margins</CardTitle>
          <div className="text-sm text-muted-foreground">
            EBIT / Revenue
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-20 mb-4">
            {createMiniChart(marginData, '#f59e0b')}
          </div>
          <div className="space-y-2">
            {allData.map((projection, index) => (
              <div key={projection.year} className="flex justify-between text-xs">
                <span className={projection.isHistory ? 'text-muted-foreground' : 'font-medium'}>
                  {projection.year}
                </span>
                <span className={projection.isHistory ? 'text-muted-foreground' : 'font-medium'}>
                  {(projection.operatingMargin * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
