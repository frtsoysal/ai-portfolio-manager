'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronRight, Home } from 'lucide-react'
import { Company, MarketData, ValuationResults } from '@/types/dcf'

interface DCFHeaderProps {
  company: Company
  market: MarketData
  valuation?: ValuationResults | null
}

export default function DCFHeader({ company, market, valuation }: DCFHeaderProps) {
  const formatCurrency = (value: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  const formatLargeNumber = (value: number, currency = 'USD') => {
    if (value >= 1e12) return `${currency} ${(value / 1e12).toFixed(1)}T`
    if (value >= 1e9) return `${currency} ${(value / 1e9).toFixed(1)}B`
    if (value >= 1e6) return `${currency} ${(value / 1e6).toFixed(1)}M`
    return formatCurrency(value, currency)
  }

  const upside = valuation ? valuation.upside : 0
  const myValue = valuation ? valuation.valuePerShare : 0

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground flex items-center">
          <Home className="h-4 w-4" />
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/screener" className="hover:text-foreground">
          Screener
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground font-medium">DCF Analysis: {company.symbol}</span>
      </nav>

      {/* Company Title */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{company.symbol}</h1>
            <Badge variant="secondary">{company.sector}</Badge>
          </div>
          <p className="text-lg text-muted-foreground mt-1">{company.name}</p>
          <p className="text-sm text-muted-foreground">
            {company.industry} • {company.country}
          </p>
        </div>
        
        <div className="text-right">
          <div className="text-sm text-muted-foreground">Last Updated</div>
          <div className="text-sm font-medium">{market.lastUpdated}</div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Current Price */}
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Current Price</div>
            <div className="text-2xl font-bold">
              {formatCurrency(market.currentPrice, market.currency)}
            </div>
          </CardContent>
        </Card>

        {/* My Value */}
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">My Value</div>
            <div className="text-2xl font-bold text-primary">
              {myValue > 0 ? formatCurrency(myValue, market.currency) : '-'}
            </div>
          </CardContent>
        </Card>

        {/* Upside */}
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Upside</div>
            <div className={`text-2xl font-bold ${upside >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {valuation ? `${upside > 0 ? '+' : ''}${(upside * 100).toFixed(1)}%` : '-'}
            </div>
          </CardContent>
        </Card>

        {/* Enterprise Value */}
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Enterprise Value</div>
            <div className="text-2xl font-bold">
              {formatLargeNumber(market.enterpriseValue, market.currency)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Model Summary */}
      {valuation && (
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">
            WACC: {(valuation.wacc * 100).toFixed(1)}%
          </Badge>
          <Badge variant="outline">
            Revenue CAGR: {(valuation.revenueCAGR * 100).toFixed(1)}%
          </Badge>
          <Badge variant="outline">
            Avg. Margin: {(valuation.averageMargin * 100).toFixed(1)}%
          </Badge>
          <Badge variant="outline">
            Terminal Method: {valuation.terminalMethod}
          </Badge>
        </div>
      )}
    </div>
  )
}
