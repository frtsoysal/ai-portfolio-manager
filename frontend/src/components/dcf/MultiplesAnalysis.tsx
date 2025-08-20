'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DCFModel } from '@/types/dcf'

interface MultiplesAnalysisProps {
  model: DCFModel | null
  currency: string
}

export default function MultiplesAnalysis({ model, currency }: MultiplesAnalysisProps) {
  if (!model) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Multiples Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading multiples analysis...</p>
        </CardContent>
      </Card>
    )
  }

  const valuation = model.valuation
  const latestHistorical = model.projections.find(p => p.isHistory)
  const terminalYear = model.projections.find(p => p.isTerminal)

  // Industry benchmark multiples (these would typically come from a database)
  const industryBenchmarks = {
    'Consumer Electronics': {
      evRevenue: { low: 2.5, median: 4.2, high: 6.8 },
      evEbit: { low: 12, median: 18, high: 25 },
      pe: { low: 15, median: 22, high: 30 }
    },
    'Technology': {
      evRevenue: { low: 4.0, median: 7.5, high: 12.0 },
      evEbit: { low: 15, median: 25, high: 40 },
      pe: { low: 20, median: 28, high: 45 }
    },
    'Healthcare': {
      evRevenue: { low: 3.5, median: 5.8, high: 9.2 },
      evEbit: { low: 14, median: 20, high: 28 },
      pe: { low: 18, median: 24, high: 35 }
    }
  }

  // Default to Technology if industry not found
  const benchmarks = industryBenchmarks['Technology'] // Would use actual industry from model.company

  const formatCurrency = (value: number) => {
    if (Math.abs(value) >= 1e9) return `${currency} ${(value / 1e9).toFixed(1)}B`
    if (Math.abs(value) >= 1e6) return `${currency} ${(value / 1e6).toFixed(1)}M`
    return `${currency} ${value.toFixed(0)}`
  }

  const getMultipleRating = (actual: number, benchmark: { low: number, median: number, high: number }) => {
    if (actual < benchmark.low) return { rating: 'Undervalued', color: 'text-green-600', bgColor: 'bg-green-50' }
    if (actual < benchmark.median) return { rating: 'Fair Value', color: 'text-blue-600', bgColor: 'bg-blue-50' }
    if (actual < benchmark.high) return { rating: 'Premium', color: 'text-yellow-600', bgColor: 'bg-yellow-50' }
    return { rating: 'Expensive', color: 'text-red-600', bgColor: 'bg-red-50' }
  }

  const evRevenueRating = getMultipleRating(valuation.impliedEVRevenue, benchmarks.evRevenue)
  const evEbitRating = getMultipleRating(valuation.impliedEVEBIT, benchmarks.evEbit)
  const peRating = getMultipleRating(valuation.impliedPE, benchmarks.pe)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Multiples Analysis & Benchmarking</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current vs Historical Multiples */}
        <div>
          <h4 className="font-semibold mb-4">DCF Implied Multiples</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* EV/Revenue */}
            <Card className={evRevenueRating.bgColor}>
              <CardContent className="p-4">
                <div className="text-center space-y-2">
                  <div className="text-sm text-muted-foreground">EV / Revenue (TTM)</div>
                  <div className="text-2xl font-bold">{valuation.impliedEVRevenue.toFixed(1)}x</div>
                  <Badge variant="outline" className={evRevenueRating.color}>
                    {evRevenueRating.rating}
                  </Badge>
                  <div className="text-xs text-muted-foreground mt-2">
                    Industry: {benchmarks.evRevenue.low.toFixed(1)}x - {benchmarks.evRevenue.high.toFixed(1)}x
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* EV/EBIT */}
            <Card className={evEbitRating.bgColor}>
              <CardContent className="p-4">
                <div className="text-center space-y-2">
                  <div className="text-sm text-muted-foreground">EV / EBIT (TTM)</div>
                  <div className="text-2xl font-bold">{valuation.impliedEVEBIT.toFixed(1)}x</div>
                  <Badge variant="outline" className={evEbitRating.color}>
                    {evEbitRating.rating}
                  </Badge>
                  <div className="text-xs text-muted-foreground mt-2">
                    Industry: {benchmarks.evEbit.low.toFixed(0)}x - {benchmarks.evEbit.high.toFixed(0)}x
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* P/E */}
            <Card className={peRating.bgColor}>
              <CardContent className="p-4">
                <div className="text-center space-y-2">
                  <div className="text-sm text-muted-foreground">Price / Earnings</div>
                  <div className="text-2xl font-bold">{valuation.impliedPE.toFixed(1)}x</div>
                  <Badge variant="outline" className={peRating.color}>
                    {peRating.rating}
                  </Badge>
                  <div className="text-xs text-muted-foreground mt-2">
                    Industry: {benchmarks.pe.low.toFixed(0)}x - {benchmarks.pe.high.toFixed(0)}x
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Multiple Comparison Chart */}
        <div>
          <h4 className="font-semibold mb-4">Multiple Comparison</h4>
          
          <div className="space-y-4">
            {/* EV/Revenue Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>EV/Revenue</span>
                <span>{valuation.impliedEVRevenue.toFixed(1)}x</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 relative">
                <div 
                  className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((valuation.impliedEVRevenue / benchmarks.evRevenue.high) * 100, 100)}%` }}
                ></div>
                <div className="absolute inset-0 flex justify-between text-xs text-gray-600 px-2 items-center">
                  <span>{benchmarks.evRevenue.low}x</span>
                  <span>{benchmarks.evRevenue.median}x</span>
                  <span>{benchmarks.evRevenue.high}x</span>
                </div>
              </div>
            </div>

            {/* EV/EBIT Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>EV/EBIT</span>
                <span>{valuation.impliedEVEBIT.toFixed(1)}x</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 relative">
                <div 
                  className="bg-green-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((valuation.impliedEVEBIT / benchmarks.evEbit.high) * 100, 100)}%` }}
                ></div>
                <div className="absolute inset-0 flex justify-between text-xs text-gray-600 px-2 items-center">
                  <span>{benchmarks.evEbit.low}x</span>
                  <span>{benchmarks.evEbit.median}x</span>
                  <span>{benchmarks.evEbit.high}x</span>
                </div>
              </div>
            </div>

            {/* P/E Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>P/E Ratio</span>
                <span>{valuation.impliedPE.toFixed(1)}x</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 relative">
                <div 
                  className="bg-purple-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((valuation.impliedPE / benchmarks.pe.high) * 100, 100)}%` }}
                ></div>
                <div className="absolute inset-0 flex justify-between text-xs text-gray-600 px-2 items-center">
                  <span>{benchmarks.pe.low}x</span>
                  <span>{benchmarks.pe.median}x</span>
                  <span>{benchmarks.pe.high}x</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Forward Multiples */}
        {terminalYear && (
          <div>
            <h4 className="font-semibold mb-4">Forward Multiples (Terminal Year)</h4>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-sm text-muted-foreground">EV/Revenue</div>
                <div className="text-xl font-bold">{valuation.terminalEVRevenue.toFixed(1)}x</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">EV/EBIT</div>
                <div className="text-xl font-bold">{valuation.terminalEVEBIT.toFixed(1)}x</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">FCF Yield</div>
                <div className="text-xl font-bold">{(valuation.terminalFcffYield * 100).toFixed(1)}%</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">ROIC</div>
                <div className="text-xl font-bold">--%</div>
                <div className="text-xs text-muted-foreground">Coming Soon</div>
              </div>
            </div>
          </div>
        )}

        {/* Multiple-based Valuations */}
        <div>
          <h4 className="font-semibold mb-4">Multiple-Based Valuation Cross-Check</h4>
          
          {latestHistorical && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">EV/Revenue @ Industry Median</div>
                    <div className="text-lg font-bold">
                      {formatCurrency(latestHistorical.revenue * benchmarks.evRevenue.median)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      vs DCF: {formatCurrency(valuation.enterpriseValue)}
                    </div>
                    <Badge variant={
                      (latestHistorical.revenue * benchmarks.evRevenue.median) > valuation.enterpriseValue ? "destructive" : "default"
                    }>
                      {(((latestHistorical.revenue * benchmarks.evRevenue.median) / valuation.enterpriseValue - 1) * 100).toFixed(0)}% diff
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">EV/EBIT @ Industry Median</div>
                    <div className="text-lg font-bold">
                      {formatCurrency(latestHistorical.ebit * benchmarks.evEbit.median)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      vs DCF: {formatCurrency(valuation.enterpriseValue)}
                    </div>
                    <Badge variant={
                      (latestHistorical.ebit * benchmarks.evEbit.median) > valuation.enterpriseValue ? "destructive" : "default"
                    }>
                      {(((latestHistorical.ebit * benchmarks.evEbit.median) / valuation.enterpriseValue - 1) * 100).toFixed(0)}% diff
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">P/E @ Industry Median</div>
                    <div className="text-lg font-bold">
                      {currency} {((latestHistorical.nopat / valuation.sharesOutstanding) * benchmarks.pe.median).toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      vs DCF: {currency} {valuation.valuePerShare.toFixed(2)}
                    </div>
                    <Badge variant={
                      ((latestHistorical.nopat / valuation.sharesOutstanding) * benchmarks.pe.median) > valuation.valuePerShare ? "destructive" : "default"
                    }>
                      {(((((latestHistorical.nopat / valuation.sharesOutstanding) * benchmarks.pe.median) / valuation.valuePerShare) - 1) * 100).toFixed(0)}% diff
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="border-t pt-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h5 className="font-medium mb-2">Multiples Analysis Summary</h5>
            <div className="text-sm text-blue-800 space-y-1">
              <p>• DCF implies EV/Revenue of <strong>{valuation.impliedEVRevenue.toFixed(1)}x</strong> vs industry median of <strong>{benchmarks.evRevenue.median.toFixed(1)}x</strong></p>
              <p>• DCF implies EV/EBIT of <strong>{valuation.impliedEVEBIT.toFixed(1)}x</strong> vs industry median of <strong>{benchmarks.evEbit.median.toFixed(0)}x</strong></p>
              <p>• Multiple-based valuations provide {valuation.impliedEVRevenue > benchmarks.evRevenue.median ? 'lower' : 'higher'} target prices than DCF</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
