'use client'

import { LineChart, Line, ResponsiveContainer } from 'recharts'

interface SparklineProps {
  data: number[]
  width?: number
  height?: number
  color?: string
  strokeWidth?: number
  className?: string
}

export default function Sparkline({ 
  data, 
  width = 80, 
  height = 32, 
  color = '#3B82F6',
  strokeWidth = 1.5,
  className = ''
}: SparklineProps) {
  if (!data || data.length === 0) {
    return (
      <div 
        className={`bg-gray-100 rounded flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <span className="text-xs text-gray-400">—</span>
      </div>
    )
  }

  // Transform data for Recharts
  const chartData = data.map((value, index) => ({
    index,
    value
  }))

  // Determine trend color based on first vs last value
  const trendColor = data[data.length - 1] >= data[0] ? '#10B981' : '#EF4444'
  const lineColor = color === 'auto' ? trendColor : color

  return (
    <div className={className} style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={lineColor}
            strokeWidth={strokeWidth}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

// Enhanced Sparkline for detail views
interface DetailSparklineProps {
  data: number[]
  height?: number
  showGrid?: boolean
  showTooltip?: boolean
}

export function DetailSparkline({ 
  data, 
  height = 120,
  showGrid = true,
  showTooltip = true
}: DetailSparklineProps) {
  if (!data || data.length === 0) {
    return (
      <div 
        className="bg-gray-50 rounded-lg flex items-center justify-center"
        style={{ height }}
      >
        <div className="text-center text-gray-500">
          <div className="text-2xl mb-2">📈</div>
          <div className="text-sm">No chart data</div>
        </div>
      </div>
    )
  }

  // Transform data for Recharts with dates (mock for now)
  const chartData = data.map((value, index) => ({
    day: index + 1,
    value,
    date: new Date(Date.now() - (data.length - index) * 24 * 60 * 60 * 1000).toLocaleDateString()
  }))

  // Calculate stats
  const minValue = Math.min(...data)
  const maxValue = Math.max(...data)
  const firstValue = data[0]
  const lastValue = data[data.length - 1]
  const change = lastValue - firstValue
  const changePercent = (change / firstValue) * 100

  const lineColor = change >= 0 ? '#10B981' : '#EF4444'

  return (
    <div>
      {/* Chart Stats */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center space-x-4">
          <div>
            <span className="text-sm text-gray-600">Current: </span>
            <span className="font-medium">${lastValue.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-sm text-gray-600">Change: </span>
            <span className={`font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change >= 0 ? '+' : ''}{change.toFixed(2)} ({changePercent.toFixed(1)}%)
            </span>
          </div>
        </div>
        <div className="text-xs text-gray-500">
          30-day trend
        </div>
      </div>

      {/* Chart */}
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            {showGrid && (
              <>
                <defs>
                  <linearGradient id="sparklineGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={lineColor} stopOpacity={0.1}/>
                    <stop offset="95%" stopColor={lineColor} stopOpacity={0}/>
                  </linearGradient>
                </defs>
              </>
            )}
            <Line
              type="monotone"
              dataKey="value"
              stroke={lineColor}
              strokeWidth={2}
              dot={false}
              fill="url(#sparklineGradient)"
            />
            {showTooltip && (
              <defs>
                <filter id="shadow">
                  <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.1"/>
                </filter>
              </defs>
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Range info */}
      <div className="flex justify-between text-xs text-gray-500 mt-2">
        <span>Low: ${minValue.toFixed(2)}</span>
        <span>High: ${maxValue.toFixed(2)}</span>
      </div>
    </div>
  )
}
