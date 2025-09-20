'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'

interface ScreenerRow {
  symbol: string
  name: string
  sector: string
  industry: string
  price: number
  changePct: number
  marketCap: number
  pe?: number
  ps?: number
  pb?: number
  dividendYield?: number
  beta?: number
  week52Position?: number
  revenueGrowthTTM?: number
  netMarginTTM?: number
  roeTTM?: number
  roaTTM?: number
  avgVolume?: number
  week52High?: number
  week52Low?: number
  ev?: number
  ebitda?: number
  sparkline?: number[]
}

interface Filters {
  search: string
  sector: string
  industry: string
  country: string
  exchange: string
  minMarketCap: number
  maxMarketCap: number
  minPrice: number
  maxPrice: number
  minVolume: number
  maxVolume: number
  minBeta: number
  maxBeta: number
  minDividendYield: number
  maxDividendYield: number
  maxPE: number
  isEtf: boolean
  isFund: boolean
  isActivelyTrading: boolean
  profitable: boolean
}

export default function ScreenerPage() {
  const [data, setData] = useState<ScreenerRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [lastUpdate, setLastUpdate] = useState<string>('')
  
  const [filters, setFilters] = useState<Filters>({
    search: '',
    sector: '',
    industry: '',
    country: 'US',
    exchange: '',
    minMarketCap: 0,
    maxMarketCap: 0,
    minPrice: 0,
    maxPrice: 0,
    minVolume: 0,
    maxVolume: 0,
    minBeta: 0,
    maxBeta: 0,
    minDividendYield: 0,
    maxDividendYield: 0,
    maxPE: 0,
    isEtf: false,
    isFund: false,
    isActivelyTrading: true,
    profitable: false
  })

  const [sortBy, setSortBy] = useState<keyof ScreenerRow>('marketCap')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    fetchData()
  }, [])

  // Refetch data when filters change (with debounce)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchData()
    }, 1000) // 1 second debounce

    return () => clearTimeout(timeoutId)
  }, [filters])

  const fetchData = async (refresh = false) => {
    try {
      setLoading(true)
      setError('')
      
      // Build query parameters from filters
      const queryParams = new URLSearchParams()
      if (refresh) queryParams.append('refresh', '1')
      
      // Add all filter parameters
      if (filters.sector) queryParams.append('sector', filters.sector)
      if (filters.industry) queryParams.append('industry', filters.industry)
      if (filters.country) queryParams.append('country', filters.country)
      if (filters.exchange) queryParams.append('exchange', filters.exchange)
      if (filters.minMarketCap > 0) queryParams.append('marketCapMoreThan', (filters.minMarketCap * 1e9).toString())
      if (filters.maxMarketCap > 0) queryParams.append('marketCapLowerThan', (filters.maxMarketCap * 1e9).toString())
      if (filters.minPrice > 0) queryParams.append('priceMoreThan', filters.minPrice.toString())
      if (filters.maxPrice > 0) queryParams.append('priceLowerThan', filters.maxPrice.toString())
      if (filters.minVolume > 0) queryParams.append('volumeMoreThan', filters.minVolume.toString())
      if (filters.maxVolume > 0) queryParams.append('volumeLowerThan', filters.maxVolume.toString())
      if (filters.minBeta > 0) queryParams.append('betaMoreThan', filters.minBeta.toString())
      if (filters.maxBeta > 0) queryParams.append('betaLowerThan', filters.maxBeta.toString())
      // Note: Dividend filtering is done client-side since FMP uses absolute dividend amounts, not yield percentages
      queryParams.append('isEtf', filters.isEtf.toString())
      queryParams.append('isFund', filters.isFund.toString())
      queryParams.append('isActivelyTrading', filters.isActivelyTrading.toString())
      
      const url = `/api/screener?${queryParams.toString()}`
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      
      if (result.error) {
        throw new Error(result.error)
      }

      setData(result.data || [])
      setLastUpdate(result.lastUpdate || new Date().toISOString())
      
    } catch (err) {
      console.error('Fetch error:', err)
      setError(err instanceof Error ? err.message : 'Veri yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  // Format functions
  const formatMarketCap = (value: number) => {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`
    return `$${value.toLocaleString()}`
  }

  const formatPercent = (value: number | undefined) => {
    if (value === undefined || value === null) return 'N/A'
    return `${(value * 100).toFixed(2)}%`
  }

  const formatNumber = (value: number | undefined, decimals = 2) => {
    if (value === undefined || value === null) return 'N/A'
    return value.toFixed(decimals)
  }

  // Get unique sectors for filter
  const sectors = useMemo(() => {
    const uniqueSectors = [...new Set(data.map(item => item.sector))].filter(Boolean)
    return uniqueSectors.sort()
  }, [data])

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let filtered = data.filter(item => {
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase()
        if (!item.symbol.toLowerCase().includes(searchTerm) && 
            !item.name.toLowerCase().includes(searchTerm)) {
          return false
        }
      }

      // Sector filter
      if (filters.sector && item.sector !== filters.sector) {
        return false
      }

      // Market cap filter
      if (filters.minMarketCap > 0 && item.marketCap < filters.minMarketCap * 1e9) {
        return false
      }

      // P/E filter
      if (filters.maxPE < 100 && item.pe && item.pe > filters.maxPE) {
        return false
      }

      // Dividend yield filters (client-side since FMP uses absolute amounts)
      if (filters.minDividendYield > 0 && (!item.dividendYield || item.dividendYield < filters.minDividendYield / 100)) {
        return false
      }
      
      if (filters.maxDividendYield > 0 && item.dividendYield && item.dividendYield > filters.maxDividendYield / 100) {
        return false
      }

      // Profitable filter
      if (filters.profitable && (!item.netMarginTTM || item.netMarginTTM <= 0)) {
        return false
      }

      return true
    })

    // Sort data
    filtered.sort((a, b) => {
      const aVal = a[sortBy]
      const bVal = b[sortBy]
      
      if (aVal === undefined || aVal === null) return 1
      if (bVal === undefined || bVal === null) return -1
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
      }
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal
      }
      
      return 0
    })

    return filtered
  }, [data, filters, sortBy, sortOrder])

  const handleSort = (column: keyof ScreenerRow) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('desc')
    }
  }

  const getSortIcon = (column: keyof ScreenerRow) => {
    if (sortBy !== column) return '↕️'
    return sortOrder === 'asc' ? '↑' : '↓'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-64"></div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Hata</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">{error}</p>
            <Button onClick={() => fetchData()} className="w-full">
              Tekrar Dene
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
        {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex justify-between items-center">
                <div>
              <h1 className="text-3xl font-bold text-gray-900">S&P 500 Screener</h1>
              <p className="text-gray-600 mt-1">
                Son güncelleme: {new Date(lastUpdate).toLocaleString('tr-TR')}
                  </p>
                </div>
            <Button 
                onClick={() => fetchData(true)}
                disabled={loading}
              variant="outline"
            >
              🔄 Yenile
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-blue-600 text-xl">📊</span>
              </div>
              <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{filteredAndSortedData.length}</p>
                  <p className="text-sm text-gray-600">Şirket</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-green-600 text-xl">💰</span>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                    {filteredAndSortedData.length > 0 ? 
                      (filteredAndSortedData
                        .filter(d => d.pe && d.pe > 0 && d.pe < 100)
                        .reduce((sum, d) => sum + (d.pe || 0), 0) / 
                       filteredAndSortedData.filter(d => d.pe && d.pe > 0 && d.pe < 100).length || 0
                      ).toFixed(1) : '0'
                  }
                </p>
                  <p className="text-sm text-gray-600">Ort. P/E</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-purple-600 text-xl">📈</span>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                    {formatMarketCap(filteredAndSortedData.reduce((sum, d) => sum + d.marketCap, 0))}
                </p>
                  <p className="text-sm text-gray-600">Toplam Piyasa Değeri</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                  <span className="text-yellow-600 text-xl">💎</span>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                    {filteredAndSortedData.filter(d => d.dividendYield && d.dividendYield > 0).length}
                  </p>
                  <p className="text-sm text-gray-600">Temettü Veren</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Advanced Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Gelişmiş Filtreler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Basic Filters */}
              <div>
                <h3 className="text-lg font-medium mb-3">Temel Filtreler</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Arama</label>
                    <Input
                      placeholder="Sembol veya şirket adı"
                      value={filters.search}
                      onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ülke</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={filters.country}
                      onChange={(e) => setFilters(prev => ({ ...prev, country: e.target.value }))}
                    >
                      <option value="US">Amerika (US)</option>
                      <option value="CA">Kanada (CA)</option>
                      <option value="GB">İngiltere (GB)</option>
                      <option value="DE">Almanya (DE)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Borsa</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={filters.exchange}
                      onChange={(e) => setFilters(prev => ({ ...prev, exchange: e.target.value }))}
                    >
                      <option value="">Tüm Borsalar</option>
                      <option value="NYSE">NYSE</option>
                      <option value="NASDAQ">NASDAQ</option>
                      <option value="AMEX">AMEX</option>
                    </select>
                  </div>

                  <div className="flex items-end space-x-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={filters.isActivelyTrading}
                        onChange={(e) => setFilters(prev => ({ ...prev, isActivelyTrading: e.target.checked }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Aktif İşlem</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Price & Market Cap Filters */}
              <div>
                <h3 className="text-lg font-medium mb-3">Fiyat & Piyasa Değeri</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Min Fiyat ($)</label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0"
                      value={filters.minPrice || ''}
                      onChange={(e) => setFilters(prev => ({ ...prev, minPrice: Number(e.target.value) || 0 }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Fiyat ($)</label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Sınırsız"
                      value={filters.maxPrice || ''}
                      onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: Number(e.target.value) || 0 }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Min Piyasa Değeri (B$)</label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="0"
                      value={filters.minMarketCap || ''}
                      onChange={(e) => setFilters(prev => ({ ...prev, minMarketCap: Number(e.target.value) || 0 }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Piyasa Değeri (B$)</label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="Sınırsız"
                      value={filters.maxMarketCap || ''}
                      onChange={(e) => setFilters(prev => ({ ...prev, maxMarketCap: Number(e.target.value) || 0 }))}
                    />
                  </div>
                </div>
              </div>

              {/* Volume & Beta Filters */}
              <div>
                <h3 className="text-lg font-medium mb-3">Hacim & Beta</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Min Hacim</label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={filters.minVolume || ''}
                      onChange={(e) => setFilters(prev => ({ ...prev, minVolume: Number(e.target.value) || 0 }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Hacim</label>
                    <Input
                      type="number"
                      placeholder="Sınırsız"
                      value={filters.maxVolume || ''}
                      onChange={(e) => setFilters(prev => ({ ...prev, maxVolume: Number(e.target.value) || 0 }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Min Beta</label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="0"
                      value={filters.minBeta || ''}
                      onChange={(e) => setFilters(prev => ({ ...prev, minBeta: Number(e.target.value) || 0 }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Beta</label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="Sınırsız"
                      value={filters.maxBeta || ''}
                      onChange={(e) => setFilters(prev => ({ ...prev, maxBeta: Number(e.target.value) || 0 }))}
                    />
            </div>
          </div>
        </div>

              {/* Dividend Filters */}
              <div>
                <h3 className="text-lg font-medium mb-3">Temettü</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Min Temettü Verimi (%)</label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="0"
                      value={filters.minDividendYield || ''}
                      onChange={(e) => setFilters(prev => ({ ...prev, minDividendYield: Number(e.target.value) || 0 }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Temettü Verimi (%)</label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="Sınırsız"
                      value={filters.maxDividendYield || ''}
                      onChange={(e) => setFilters(prev => ({ ...prev, maxDividendYield: Number(e.target.value) || 0 }))}
                    />
                  </div>

                  <div className="flex items-end space-x-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={filters.profitable}
                        onChange={(e) => setFilters(prev => ({ ...prev, profitable: e.target.checked }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Sadece Karlı</span>
                    </label>
                  </div>

                  <div className="flex items-end space-x-4">
                    <Button 
                      onClick={() => setFilters({
                        search: '',
                        sector: '',
                        industry: '',
                        country: 'US',
                        exchange: '',
                        minMarketCap: 0,
                        maxMarketCap: 0,
                        minPrice: 0,
                        maxPrice: 0,
                        minVolume: 0,
                        maxVolume: 0,
                        minBeta: 0,
                        maxBeta: 0,
                        minDividendYield: 0,
                        maxDividendYield: 0,
                        maxPE: 0,
                        isEtf: false,
                        isFund: false,
                        isActivelyTrading: true,
                        profitable: false
                      })}
                      variant="outline"
                      className="w-full"
                    >
                      🔄 Filtreleri Sıfırla
                    </Button>
        </div>
      </div>
      </div>

              {/* Fund Type Filters */}
              <div>
                <h3 className="text-lg font-medium mb-3">Fon Türleri</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={filters.isEtf}
                      onChange={(e) => setFilters(prev => ({ ...prev, isEtf: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">ETF'leri Dahil Et</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={filters.isFund}
                      onChange={(e) => setFilters(prev => ({ ...prev, isFund: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Yatırım Fonlarını Dahil Et</span>
                  </label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>Şirketler ({filteredAndSortedData.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 cursor-pointer hover:bg-gray-50" onClick={() => handleSort('symbol')}>
                      Sembol {getSortIcon('symbol')}
                    </th>
                    <th className="text-left p-2 cursor-pointer hover:bg-gray-50" onClick={() => handleSort('name')}>
                      Şirket {getSortIcon('name')}
                    </th>
                    <th className="text-left p-2 cursor-pointer hover:bg-gray-50" onClick={() => handleSort('sector')}>
                      Sektör {getSortIcon('sector')}
                    </th>
                    <th className="text-right p-2 cursor-pointer hover:bg-gray-50" onClick={() => handleSort('price')}>
                      Fiyat {getSortIcon('price')}
                    </th>
                    <th className="text-right p-2 cursor-pointer hover:bg-gray-50" onClick={() => handleSort('changePct')}>
                      Daily Change {getSortIcon('changePct')}
                    </th>
                    <th className="text-right p-2 cursor-pointer hover:bg-gray-50" onClick={() => handleSort('marketCap')}>
                      Piyasa Değeri {getSortIcon('marketCap')}
                    </th>
                    <th className="text-right p-2 cursor-pointer hover:bg-gray-50" onClick={() => handleSort('pe')}>
                      P/E {getSortIcon('pe')}
                    </th>
                    <th className="text-right p-2 cursor-pointer hover:bg-gray-50" onClick={() => handleSort('dividendYield')}>
                      Temettü {getSortIcon('dividendYield')}
                    </th>
                    <th className="text-right p-2 cursor-pointer hover:bg-gray-50" onClick={() => handleSort('beta')}>
                      Beta {getSortIcon('beta')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedData.map((row, index) => (
                    <tr key={row.symbol} className={`border-b hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                      <td className="p-2">
                        <div className="font-medium text-blue-600">{row.symbol}</div>
                      </td>
                      <td className="p-2">
                        <div className="font-medium">{row.name}</div>
                        <div className="text-xs text-gray-500">{row.industry}</div>
                      </td>
                      <td className="p-2">
                        <Badge variant="outline" className="text-xs">
                          {row.sector}
                        </Badge>
                      </td>
                      <td className="p-2 text-right font-medium">
                        ${row.price.toFixed(2)}
                      </td>
                      <td className="p-2 text-right">
                        <span className={`font-medium ${row.changePct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {row.changePct >= 0 ? '+' : ''}{row.changePct.toFixed(2)}%
                        </span>
                      </td>
                      <td className="p-2 text-right font-medium">
                        {formatMarketCap(row.marketCap)}
                      </td>
                      <td className="p-2 text-right">
                        {formatNumber(row.pe)}
                      </td>
                      <td className="p-2 text-right">
                        {formatPercent(row.dividendYield)}
                      </td>
                      <td className="p-2 text-right">
                        {formatNumber(row.beta)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}