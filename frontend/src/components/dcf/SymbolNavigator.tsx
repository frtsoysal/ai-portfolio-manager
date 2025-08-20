'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp } from 'lucide-react'

const popularStocks = [
  { symbol: 'AAPL', name: 'Apple Inc.', sector: 'Technology' },
  { symbol: 'MSFT', name: 'Microsoft Corp.', sector: 'Technology' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', sector: 'Technology' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', sector: 'Consumer Discretionary' },
  { symbol: 'TSLA', name: 'Tesla Inc.', sector: 'Consumer Discretionary' },
  { symbol: 'META', name: 'Meta Platforms Inc.', sector: 'Technology' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', sector: 'Technology' },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', sector: 'Financial Services' },
  { symbol: 'V', name: 'Visa Inc.', sector: 'Financial Services' },
  { symbol: 'JNJ', name: 'Johnson & Johnson', sector: 'Healthcare' },
  { symbol: 'WMT', name: 'Walmart Inc.', sector: 'Consumer Staples' },
  { symbol: 'PG', name: 'Procter & Gamble Co.', sector: 'Consumer Staples' },
]

export default function SymbolNavigator() {
  const params = useParams()
  const currentSymbol = params.symbol as string

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Quick DCF Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Analyze popular stocks with one click
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {popularStocks.map((stock) => {
              const isActive = stock.symbol === currentSymbol
              
              return (
                <Link key={stock.symbol} href={`/dcf/${stock.symbol}`}>
                  <Button
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    className="w-full h-auto p-3 flex flex-col items-start space-y-1"
                  >
                    <div className="font-semibold">{stock.symbol}</div>
                    <div className="text-xs opacity-75 truncate w-full text-left">
                      {stock.name}
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {stock.sector.split(' ')[0]}
                    </Badge>
                  </Button>
                </Link>
              )
            })}
          </div>
          
          <div className="pt-2 border-t">
            <Link href="/screener">
              <Button variant="ghost" size="sm" className="w-full">
                ← Back to S&P 500 Screener
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
