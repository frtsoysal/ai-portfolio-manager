'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

// Dynamic import for ApexCharts to avoid SSR issues
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

interface Company {
  symbol: string
  company_name: string
  sector: string
  industry: string
  market_cap: number
  current_price: number
  pe_ratio: number
  roe: number
  pb_ratio: number
  debt_equity: number
  dividend_yield: number
  data_quality: string
}

interface SP500Data {
  total_companies: number
  collection_date: string
  companies: Company[]
}

export default function SP500Dashboard() {
  const [sp500Data, setSP500Data] = useState<SP500Data | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedSector, setSelectedSector] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchSP500Data()
  }, [])

  const fetchSP500Data = async () => {
    try {
      const response = await fetch('/api/sp500')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setSP500Data(data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching S&P 500 data:', error)
      setLoading(false)
    }
  }

  const formatMarketCap = (value: number) => {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`
    return `$${value.toLocaleString()}`
  }

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(2)}%`
  }

  // Get unique sectors
  const sectors = sp500Data ? ['All', ...new Set(sp500Data.companies.map(c => c.sector))] : ['All']

  // Filter companies based on search and sector
  const filteredCompanies = sp500Data?.companies.filter(company => {
    const matchesSearch = company.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.company_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSector = selectedSector === 'All' || company.sector === selectedSector
    return matchesSearch && matchesSector
  }) || []

  // Calculate sector distribution for chart
  const sectorDistribution = sp500Data ? sectors.slice(1).map(sector => {
    const sectorCompanies = sp500Data.companies.filter(c => c.sector === sector)
    const totalMarketCap = sectorCompanies.reduce((sum, c) => sum + c.market_cap, 0)
    return {
      sector,
      count: sectorCompanies.length,
      marketCap: totalMarketCap
    }
  }).sort((a, b) => b.marketCap - a.marketCap) : []

  // Chart configuration
  const chartOptions = {
    chart: {
      type: 'donut' as const,
      height: 350
    },
    labels: sectorDistribution.slice(0, 8).map(s => s.sector),
    colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316', '#84CC16'],
    legend: {
      position: 'bottom' as const
    },
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          width: 300
        }
      }
    }]
  }

  const chartSeries = sectorDistribution.slice(0, 8).map(s => s.count)

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-xl text-gray-600 mt-4">Loading S&P 500 Data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header - Same style as portfolios */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-blue-600 text-2xl mr-2">📈</span>
            <h1 className="text-xl font-bold text-gray-900">S&P 500 Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              Updated: {sp500Data ? new Date(sp500Data.collection_date).toLocaleDateString() : 'N/A'}
            </div>
            <button className="flex items-center text-gray-600 hover:text-blue-600 transition-colors">
              <span className="text-xl">🔄</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-blue-100">
                <span className="text-2xl">🏢</span>
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">{sp500Data?.total_companies || 0}</h3>
                <p className="text-sm text-gray-600">Total Companies</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-green-100">
                <span className="text-2xl">🏭</span>
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">{sectors.length - 1}</h3>
                <p className="text-sm text-gray-600">Sectors</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-yellow-100">
                <span className="text-2xl">💰</span>
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">
                  {formatMarketCap(sp500Data?.companies.reduce((sum, c) => sum + c.market_cap, 0) || 0)}
                </h3>
                <p className="text-sm text-gray-600">Total Market Cap</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-purple-100">
                <span className="text-2xl">📊</span>
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">
                  {sp500Data?.companies.filter(c => c.market_cap >= 1e12).length || 0}
                </h3>
                <p className="text-sm text-gray-600">$1T+ Companies</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Sector Chart */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                📊 Sector Distribution
              </h2>
              {typeof window !== 'undefined' && (
                <Chart
                  options={chartOptions}
                  series={chartSeries}
                  type="donut"
                  height={350}
                />
              )}
            </div>
          </div>

          {/* Right Column - Companies List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              {/* Search and Filter Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Search companies..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <select
                      value={selectedSector}
                      onChange={(e) => setSelectedSector(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {sectors.map(sector => (
                        <option key={sector} value={sector}>{sector}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Companies Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Company
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sector
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Market Cap
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        P/E Ratio
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ROE
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredCompanies.slice(0, 50).map((company, index) => (
                      <tr key={company.symbol} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{company.symbol}</div>
                            <div className="text-sm text-gray-500 truncate max-w-48">{company.company_name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                            {company.sector}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                          ${company.current_price?.toFixed(2) || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-green-600">
                          {formatMarketCap(company.market_cap)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                          {company.pe_ratio?.toFixed(1) || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                          {company.roe ? formatPercentage(company.roe) : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Show more button */}
              {filteredCompanies.length > 50 && (
                <div className="p-6 border-t border-gray-100 text-center">
                  <p className="text-sm text-gray-600">
                    Showing 50 of {filteredCompanies.length} companies
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Top Performers Section */}
        <div className="mt-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              🚀 Top 10 by Market Cap
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {sp500Data?.companies.slice(0, 10).map((company, index) => (
                <div key={company.symbol} className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-bold text-blue-600">#{index + 1}</span>
                    <span className="text-2xl">{index === 0 ? '👑' : index === 1 ? '🥈' : index === 2 ? '🥉' : '⭐'}</span>
                  </div>
                  <div className="text-sm font-medium text-gray-900">{company.symbol}</div>
                  <div className="text-xs text-gray-600 truncate">{company.company_name}</div>
                  <div className="text-sm font-bold text-green-600 mt-1">
                    {formatMarketCap(company.market_cap)}
                  </div>
                  <div className="text-xs text-gray-500">
                    ${company.current_price?.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
