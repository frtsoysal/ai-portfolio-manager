'use client'

import { useCompare } from './CompareContext'
import ExportButton from './ExportButton'
import Sparkline from './Sparkline'

export default function CompareDrawer() {
  const { 
    compareList, 
    isCompareOpen, 
    removeFromCompare, 
    clearCompare, 
    closeCompare 
  } = useCompare()

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

  const formatNumber = (value: number | undefined, decimals = 2) => {
    if (value === undefined) return 'N/A'
    return value.toFixed(decimals)
  }

  // Get color class based on value (green for good, red for bad)
  const getColorClass = (value: number | undefined, isHigherBetter = true) => {
    if (value === undefined) return 'text-gray-500'
    
    if (isHigherBetter) {
      if (value > 0) return 'text-green-600'
      return 'text-red-600'
    } else {
      if (value > 0) return 'text-red-600'
      return 'text-green-600'
    }
  }

  // Get PE color (lower is generally better, but too low can be bad)
  const getPEColorClass = (pe: number | undefined) => {
    if (pe === undefined) return 'text-gray-500'
    if (pe <= 0) return 'text-red-600' // Negative earnings
    if (pe < 10) return 'text-green-600' // Value territory
    if (pe < 20) return 'text-blue-600' // Fair value
    if (pe < 30) return 'text-yellow-600' // Growth premium
    return 'text-orange-600' // Expensive
  }

  return (
    <>
      {/* Overlay */}
      {isCompareOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeCompare}
        />
      )}

      {/* Drawer */}
      <div className={`fixed bottom-0 inset-x-0 z-50 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
        isCompareOpen ? 'translate-y-0' : 'translate-y-full'
      } ${compareList.length === 0 ? 'hidden' : ''}`}>
        <div className="max-h-[70vh] flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <span className="text-blue-600 text-xl">📊</span>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Compare Companies ({compareList.length}/5)
                  </h2>
                  <p className="text-sm text-gray-600">
                    Select up to 5 companies to compare metrics
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {compareList.length > 0 && (
                  <ExportButton
                    data={compareList}
                    filename="sp500-comparison.csv"
                    label="Export"
                    className="text-sm px-3 py-1"
                  />
                )}
                <button
                  onClick={clearCompare}
                  className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <span className="text-sm">Clear All</span>
                </button>
                <button
                  onClick={closeCompare}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {compareList.length === 0 ? (
              <div className="text-center text-gray-500 py-10">
                <div className="text-5xl mb-4">📊</div>
                <p className="text-lg font-medium mb-2">No Companies Selected</p>
                <p className="text-sm">Click "Add to Compare" on any company to start comparing</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Company
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Market Cap
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        P/E
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Div Yield
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ROE
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Net Margin
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trend
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {compareList.map((company) => (
                      <tr key={company.symbol}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                              <span className="text-lg">{company.symbol.charAt(0)}</span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{company.symbol}</div>
                              <div className="text-sm text-gray-500 truncate max-w-48">{company.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="text-sm font-medium text-gray-900">${company.price.toFixed(2)}</div>
                          <div className={`text-xs ${company.changePct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {company.changePct >= 0 ? '+' : ''}{company.changePct.toFixed(2)}%
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="text-sm font-medium text-gray-900">{formatMarketCap(company.marketCap)}</div>
                          <div className="text-xs text-gray-500">{company.sector}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className={`text-sm font-medium ${getPEColorClass(company.pe)}`}>
                            {formatNumber(company.pe, 1)}
                          </div>
                          <div className="text-xs text-gray-500">
                            Fwd: {formatNumber(company.forwardPE, 1)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className={`text-sm font-medium ${getColorClass(company.dividendYield)}`}>
                            {formatPercent(company.dividendYield)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className={`text-sm font-medium ${getColorClass(company.roeTTM)}`}>
                            {formatPercent(company.roeTTM)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className={`text-sm font-medium ${getColorClass(company.netMarginTTM)}`}>
                            {formatPercent(company.netMarginTTM)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex justify-center">
                            <Sparkline
                              data={company.sparkline || []}
                              width={80}
                              height={40}
                              color="auto"
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button
                            onClick={() => removeFromCompare(company.symbol)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Compare Button (only show when items in compare list and drawer closed) */}
      {compareList.length > 0 && !isCompareOpen && (
        <div className="fixed bottom-4 right-4 z-40">
          <button
            onClick={closeCompare}
            className="bg-blue-600 text-white px-4 py-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <span className="mr-2">📊</span>
            Compare ({compareList.length})
          </button>
        </div>
      )}
    </>
  )
}
