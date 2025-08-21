'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { ScreenerRow } from '../../types/screener'
import FilterPanel, { initialFilters } from '../../components/FilterPanel'
import DataTable from '../../components/DataTable'
import CompanyDetailDrawer from '../../components/CompanyDetailDrawer'
import { CompareProvider } from '../../components/CompareContext'
import CompareDrawer from '../../components/CompareDrawer'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'

export default function ScreenerPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isUpdatingURL = useRef(false)
  
  const [data, setData] = useState<ScreenerRow[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [filters, setFilters] = useState(initialFilters)
  const [filterPanelOpen, setFilterPanelOpen] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState<ScreenerRow | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async (refresh = false) => {
    try {
      setLoading(true)
      const url = `/api/backend/screener${refresh ? '?refresh=1' : ''}`
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error('Failed to fetch data')
      }

      const result = await response.json()
      setData(result.data)
      setLastUpdate(result.lastUpdate)
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const formatMarketCap = (value: number) => {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`
    return `$${value.toLocaleString()}`
  }

  const formatPercent = (value: number | undefined) => {
    if (value === undefined) return 'N/A'
    return `${(value * 100).toFixed(2)}%`
  }

  // Filter data based on current filters
  const filteredData = useMemo(() => {
    return data.filter(company => {
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase()
        if (!company.symbol.toLowerCase().includes(searchTerm) && 
            !company.name.toLowerCase().includes(searchTerm)) {
          return false
        }
      }

      // Sector filter
      if (filters.sectors.length > 0 && !filters.sectors.includes(company.sector)) {
        return false
      }

      // Price range
      if (filters.priceMin !== null && company.price < filters.priceMin) return false
      if (filters.priceMax !== null && company.price > filters.priceMax) return false

      // Market cap range
      if (filters.marketCapMin !== null && company.marketCap < filters.marketCapMin) return false
      if (filters.marketCapMax !== null && company.marketCap > filters.marketCapMax) return false

      // P/E range
      if (filters.peMin !== null && (company.pe === undefined || company.pe < filters.peMin)) return false
      if (filters.peMax !== null && (company.pe === undefined || company.pe > filters.peMax)) return false

      // Beta range
      if (filters.betaMin !== null && (company.beta === undefined || company.beta < filters.betaMin)) return false
      if (filters.betaMax !== null && (company.beta === undefined || company.beta > filters.betaMax)) return false

      // Boolean filters
      if (filters.profitable && (company.netMarginTTM === undefined || company.netMarginTTM <= 0)) return false
      if (filters.dividendPayers && (company.dividendYield === undefined || company.dividendYield <= 0)) return false
      if (filters.lowVolatility && (company.beta === undefined || company.beta >= 1)) return false

      return true
    })
  }, [data, filters])

  const displayData = filteredData

  // Serialize filters to URL parameters
  const serializeFilters = (filters: typeof initialFilters) => {
    const params = new URLSearchParams()
    
    if (filters.search) params.set('search', filters.search)
    if (filters.sectors.length) params.set('sectors', filters.sectors.join(','))
    if (filters.industries.length) params.set('industries', filters.industries.join(','))
    if (filters.priceMin !== null) params.set('priceMin', filters.priceMin.toString())
    if (filters.priceMax !== null) params.set('priceMax', filters.priceMax.toString())
    if (filters.marketCapMin !== null) params.set('mcMin', filters.marketCapMin.toString())
    if (filters.marketCapMax !== null) params.set('mcMax', filters.marketCapMax.toString())
    if (filters.peMin !== null) params.set('peMin', filters.peMin.toString())
    if (filters.peMax !== null) params.set('peMax', filters.peMax.toString())
    if (filters.dividendYieldMin !== null) params.set('divMin', filters.dividendYieldMin.toString())
    if (filters.dividendYieldMax !== null) params.set('divMax', filters.dividendYieldMax.toString())
    if (filters.betaMin !== null) params.set('betaMin', filters.betaMin.toString())
    if (filters.betaMax !== null) params.set('betaMax', filters.betaMax.toString())
    if (filters.revenueGrowthMin !== null) params.set('revGMin', filters.revenueGrowthMin.toString())
    if (filters.profitable) params.set('profitable', 'true')
    if (filters.dividendPayers) params.set('divPayers', 'true')
    if (filters.lowVolatility) params.set('lowVol', 'true')
    
    return params.toString()
  }

  // Deserialize URL parameters to filters
  const deserializeFilters = (params: URLSearchParams) => {
    const filters = { ...initialFilters }
    
    if (params.get('search')) filters.search = params.get('search') || ''
    if (params.get('sectors')) filters.sectors = params.get('sectors')?.split(',') || []
    if (params.get('industries')) filters.industries = params.get('industries')?.split(',') || []
    if (params.get('priceMin')) filters.priceMin = parseFloat(params.get('priceMin') || '0')
    if (params.get('priceMax')) filters.priceMax = parseFloat(params.get('priceMax') || '0')
    if (params.get('mcMin')) filters.marketCapMin = parseFloat(params.get('mcMin') || '0')
    if (params.get('mcMax')) filters.marketCapMax = parseFloat(params.get('mcMax') || '0')
    if (params.get('peMin')) filters.peMin = parseFloat(params.get('peMin') || '0')
    if (params.get('peMax')) filters.peMax = parseFloat(params.get('peMax') || '0')
    if (params.get('divMin')) filters.dividendYieldMin = parseFloat(params.get('divMin') || '0')
    if (params.get('divMax')) filters.dividendYieldMax = parseFloat(params.get('divMax') || '0')
    if (params.get('betaMin')) filters.betaMin = parseFloat(params.get('betaMin') || '0')
    if (params.get('betaMax')) filters.betaMax = parseFloat(params.get('betaMax') || '0')
    if (params.get('revGMin')) filters.revenueGrowthMin = parseFloat(params.get('revGMin') || '0')
    if (params.get('profitable') === 'true') filters.profitable = true
    if (params.get('divPayers') === 'true') filters.dividendPayers = true
    if (params.get('lowVol') === 'true') filters.lowVolatility = true
    
    return filters
  }

  // Update URL when filters change
  useEffect(() => {
    if (isUpdatingURL.current) {
      isUpdatingURL.current = false
      return
    }
    
    const queryString = serializeFilters(filters)
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname
    
    // Only update if URL has actually changed
    if (window.location.search !== (queryString ? `?${queryString}` : '')) {
      router.replace(newUrl, { scroll: false })
    }
  }, [filters, pathname, router])

  // Initialize filters from URL on page load
  useEffect(() => {
    if (searchParams?.toString()) {
      isUpdatingURL.current = true
      const urlFilters = deserializeFilters(searchParams)
      setFilters(urlFilters)
    }
  }, [searchParams])

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
            <div className="grid grid-cols-4 gap-4 mb-8">
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
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">Error: {error}</div>
          <button 
            onClick={() => fetchData()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <CompareProvider>
      <div className="bg-gray-50 min-h-screen">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setFilterPanelOpen(true)}
                  className="lg:hidden bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <span>🔍</span>
                  Filters
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">S&P 500 Screener</h1>
                  <p className="text-sm text-gray-600 mt-1">
                    Last updated: {new Date(lastUpdate).toLocaleString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => fetchData(true)}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <span className="text-lg">🔄</span>
                Refresh
              </button>
            </div>
          </div>
        </header>

      <div className="flex h-screen">
        {/* Filter Panel */}
        <FilterPanel
          data={data}
          filters={filters}
          onFiltersChange={setFilters}
          isOpen={filterPanelOpen}
          onClose={() => setFilterPanelOpen(false)}
        />

        {/* Main Content */}
        <div className="flex-1 overflow-auto">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPI Strip */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-blue-600 text-xl">📊</span>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{displayData.length}</p>
                <p className="text-sm text-gray-600">Companies</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-green-600 text-xl">💰</span>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {displayData.length > 0 ? 
                    (displayData.filter(d => d.pe).reduce((a, b, _, arr) => a + (b.pe || 0), 0) / displayData.filter(d => d.pe).length || 0).toFixed(1) : '0'
                  }
                </p>
                <p className="text-sm text-gray-600">Avg P/E</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-purple-600 text-xl">📈</span>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {formatMarketCap(displayData.reduce((sum, company) => sum + company.marketCap, 0))}
                </p>
                <p className="text-sm text-gray-600">Total Market Cap</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <span className="text-yellow-600 text-xl">⚡</span>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {displayData.filter(d => d.dividendYield && d.dividendYield > 0).length}
                </p>
                <p className="text-sm text-gray-600">Dividend Payers</p>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced DataTable */}
        <DataTable 
          data={displayData} 
          onRowClick={setSelectedCompany}
        />

        {/* Footer */}
        <footer className="mt-12 py-6 border-t border-gray-200">
          <p className="text-center text-sm text-gray-500">
            Data via FMP API • For research purposes only • Not investment advice
          </p>
        </footer>
        </div>
      </div>
      </div>

      {/* Company Detail Drawer */}
      <CompanyDetailDrawer
        company={selectedCompany}
        isOpen={!!selectedCompany}
        onClose={() => setSelectedCompany(null)}
      />
      
      {/* Compare Drawer */}
      <CompareDrawer />
      </div>
    </CompareProvider>
  )
}
