'use client'

import { ScreenerRow } from '../app/api/screener/route'
import { DetailSparkline } from './Sparkline'
import { useCompare } from './CompareContext'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'

interface CompanyDetailDrawerProps {
  company: ScreenerRow | null
  isOpen: boolean
  onClose: () => void
}

export default function CompanyDetailDrawer({ company, isOpen, onClose }: CompanyDetailDrawerProps) {
  const { addToCompare, isInCompare } = useCompare()
  
  if (!company) return null
  
  const isAlreadyInCompare = isInCompare(company.symbol)

  const formatMarketCap = (value: number) => {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
    return `$${value.toLocaleString()}`
  }

  const formatPercent = (value: number | undefined) => {
    if (value === undefined) return 'N/A'
    return `${(value * 100).toFixed(2)}%`
  }

  const formatNumber = (value: number | undefined, decimals = 2) => {
    if (value === undefined) return 'N/A'
    return value.toFixed(decimals)
  }

  // Get logo from Clearbit or use placeholder
  const logoUrl = `https://logo.clearbit.com/${company.company_name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`
  const fallbackLogo = `https://ui-avatars.com/api/?name=${company.symbol}&size=64&background=3B82F6&color=ffffff&format=svg`

  // Calculate 52-week position color
  const get52WeekColor = (position: number | undefined) => {
    if (position === undefined) return 'text-gray-500'
    const percent = position * 100
    if (percent >= 80) return 'text-green-600'
    if (percent >= 60) return 'text-blue-600'
    if (percent >= 40) return 'text-yellow-600'
    if (percent >= 20) return 'text-orange-600'
    return 'text-red-600'
  }

  // Get risk level based on beta
  const getRiskLevel = (beta: number | undefined) => {
    if (beta === undefined) return { level: 'Unknown', color: 'text-gray-500' }
    if (beta < 0.8) return { level: 'Low Risk', color: 'text-green-600' }
    if (beta < 1.2) return { level: 'Medium Risk', color: 'text-yellow-600' }
    return { level: 'High Risk', color: 'text-red-600' }
  }

  const riskLevel = getRiskLevel(company.beta)

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div className={`fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="h-full flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                  <img
                    src={logoUrl}
                    alt={company.company_name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = fallbackLogo
                    }}
                  />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{company.symbol}</h2>
                  <p className="text-sm text-gray-600 truncate max-w-48">{company.company_name}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Quick Stats */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-3">
                      <div className="text-sm text-muted-foreground">Current Price</div>
                      <div className="text-lg font-semibold">${company.price.toFixed(2)}</div>
                      <Badge variant={company.changePct >= 0 ? "default" : "destructive"} className="text-xs">
                        {company.changePct >= 0 ? '+' : ''}{company.changePct.toFixed(2)}% today
                      </Badge>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-3">
                      <div className="text-sm text-muted-foreground">Market Cap</div>
                      <div className="text-lg font-semibold">{formatMarketCap(company.marketCap)}</div>
                      <Badge variant="secondary" className="text-xs">{company.sector}</Badge>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            {/* Valuation Metrics */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Valuation</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">P/E Ratio</span>
                  <span className="font-medium">{formatNumber(company.pe, 1)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Forward P/E</span>
                  <span className="font-medium">{formatNumber(company.forwardPE, 1)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">P/B Ratio</span>
                  <span className="font-medium">{formatNumber(company.pb, 1)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">P/S Ratio</span>
                  <span className="font-medium">{formatNumber(company.ps, 1)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">EV/EBITDA</span>
                  <span className="font-medium">{formatNumber(company.evEbitda, 1)}</span>
                </div>
              </div>
            </div>

            {/* Financial Health */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Financial Health</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">ROE</span>
                  <span className="font-medium">{formatPercent(company.roeTTM)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">ROA</span>
                  <span className="font-medium">{formatPercent(company.roaTTM)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Net Margin</span>
                  <span className="font-medium">{formatPercent(company.netMarginTTM)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Revenue Growth</span>
                  <span className="font-medium">{formatPercent(company.revenueGrowthTTM)}</span>
                </div>
              </div>
            </div>

            {/* Risk & Returns */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Risk & Returns</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Beta</span>
                  <div className="text-right">
                    <span className="font-medium">{formatNumber(company.beta, 2)}</span>
                    <div className={`text-xs ${riskLevel.color}`}>{riskLevel.level}</div>
                  </div>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Dividend Yield</span>
                  <span className="font-medium">{formatPercent(company.dividendYield)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">52-Week Position</span>
                  <div className="text-right">
                    <span className="font-medium">
                      {company.week52Position ? `${(company.week52Position * 100).toFixed(0)}%` : 'N/A'}
                    </span>
                    {company.week52Position && (
                      <div className={`text-xs ${get52WeekColor(company.week52Position)}`}>
                        {company.week52Position >= 0.8 ? 'Near High' :
                         company.week52Position >= 0.6 ? 'Above Mid' :
                         company.week52Position >= 0.4 ? 'Mid Range' :
                         company.week52Position >= 0.2 ? 'Below Mid' : 'Near Low'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 52-Week Range Visual */}
            {company.week52High && company.week52Low && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">52-Week Range</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>${company.week52Low.toFixed(2)}</span>
                    <span>${company.week52High.toFixed(2)}</span>
                  </div>
                  <div className="relative h-2 bg-gray-200 rounded-full">
                    <div 
                      className="absolute h-2 bg-gradient-to-r from-red-400 to-green-400 rounded-full"
                      style={{ width: '100%' }}
                    />
                    {company.week52Position && (
                      <div 
                        className="absolute w-3 h-3 bg-blue-600 rounded-full transform -translate-x-1/2 -translate-y-0.5 border-2 border-white shadow"
                        style={{ left: `${company.week52Position * 100}%`, top: '50%' }}
                      />
                    )}
                  </div>
                  <div className="text-center mt-2">
                    <span className="text-sm font-medium text-gray-900">
                      Current: ${company.price.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Industry Info */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Company Info</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Sector</span>
                  <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    {company.sector}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Industry</span>
                  <span className="text-sm font-medium text-gray-900">{company.industry}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Avg Volume</span>
                  <span className="font-medium">
                    {company.avgVolume ? (company.avgVolume / 1e6).toFixed(1) + 'M' : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Price Chart */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Price Trend (30D)</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <DetailSparkline 
                  data={company.sparkline || []}
                  height={120}
                  showGrid={true}
                  showTooltip={true}
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-3">
              <Button 
                onClick={() => addToCompare(company)}
                disabled={isAlreadyInCompare}
                variant={isAlreadyInCompare ? "secondary" : "default"}
                className="w-full"
              >
                <span className="mr-2">{isAlreadyInCompare ? '✓' : '⭐'}</span>
                {isAlreadyInCompare ? 'Added to Compare' : 'Add to Compare'}
              </Button>
              <Button 
                asChild
                variant="outline"
                className="w-full"
              >
                <a
                  href={`https://financialmodelingprep.com/financial-summary/${company.symbol}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="mr-2">🔗</span>
                  View on FMP
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
