'use client'

import { useState, useEffect } from 'react'
import { apiService, Portfolio } from '../../services/api'
import dynamic from 'next/dynamic'

// Dynamic import for ApexCharts to avoid SSR issues
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

// Growth Portfolio Detail Component - Using your exact design
function GrowthPortfolioDetail() {
  const [portfolio] = useState({
    name: 'Growth Portfolio',
    riskLevel: 'High Risk',
    currentValue: 147582.63,
    todayChange: 6378.50,
    todayChangePercent: 4.32,
    totalReturn: 47.58,
    annualReturn: 21.32,
    riskScore: 8.7,
    holdings: [
      {
        symbol: 'AAPL',
        name: 'Apple Inc.',
        allocation: 35,
        value: 51654.00,
        return: 24.7,
        dayChange: 1.2,
        icon: '📱',
        color: 'blue'
      },
      {
        symbol: 'MSFT',
        name: 'Microsoft Corp.',
        allocation: 25,
        value: 36895.50,
        return: 18.3,
        dayChange: 0.8,
        icon: '💻',
        color: 'purple'
      },
      {
        symbol: 'AMZN',
        name: 'Amazon.com Inc.',
        allocation: 20,
        value: 29516.52,
        return: 15.9,
        dayChange: -0.4,
        icon: '🛒',
        color: 'green'
      },
      {
        symbol: 'NFLX',
        name: 'Netflix Inc.',
        allocation: 15,
        value: 22137.39,
        return: 12.4,
        dayChange: 2.1,
        icon: '🎬',
        color: 'red'
      },
      {
        symbol: 'TSLA',
        name: 'Tesla Inc.',
        allocation: 5,
        value: 7379.13,
        return: -5.2,
        dayChange: -1.7,
        icon: '🚗',
        color: 'yellow'
      }
    ]
  })

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header - Exact from your design */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <span className="material-symbols-outlined text-primary-600 text-2xl mr-2">analytics</span>
            <h1 className="text-xl font-bold text-gray-900">AI Portfolio Manager</h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="flex items-center text-gray-600 hover:text-primary-600 transition-colors">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button className="flex items-center text-gray-600 hover:text-primary-600 transition-colors">
              <span className="material-symbols-outlined">settings</span>
            </button>
            <div className="flex items-center">
              <img
                src="https://randomuser.me/api/portraits/women/12.jpg"
                alt="Profile"
                className="h-8 w-8 rounded-full object-cover"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Main Content */}
          <div className="w-full md:w-2/3">
            {/* Portfolio Overview - Exact from your design */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
              <div className="bg-primary-600 px-6 py-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-white text-xl font-semibold">Growth Portfolio</h2>
                  <span className="bg-white text-primary-600 px-3 py-1 rounded-full text-sm font-medium">
                    High Risk
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <p className="text-sm text-gray-500">Current Value</p>
                    <p className="text-3xl font-bold">$147,582.63</p>
                    <div className="flex items-center mt-1">
                      <span className="text-green-600 flex items-center text-sm">
                        <span className="material-symbols-outlined text-sm">trending_up</span>
                        +4.32%
                      </span>
                      <span className="text-gray-500 text-sm ml-2">Today</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="bg-primary-50 hover:bg-primary-100 text-primary-600 px-4 py-2 rounded-lg transition-colors flex items-center">
                      <span className="material-symbols-outlined mr-1">add</span> Deposit
                    </button>
                    <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors flex items-center">
                      <span className="material-symbols-outlined mr-1">edit</span> Edit
                    </button>
                  </div>
                </div>
                
                {/* Portfolio Performance Chart - Exact from your design */}
                <div className="h-[300px] w-full relative mb-6">
                  <Chart
                    options={{
                      chart: {
                        type: 'area',
                        width: '100%',
                        height: 300,
                        toolbar: { show: false },
                        zoom: { enabled: false }
                      },
                      dataLabels: { enabled: false },
                      stroke: { curve: 'smooth', width: 2 },
                      colors: ['#8b5cf6'],
                      fill: {
                        type: 'gradient',
                        gradient: {
                          shadeIntensity: 1,
                          opacityFrom: 0.7,
                          opacityTo: 0.2,
                          stops: [0, 90, 100]
                        }
                      },
                      xaxis: {
                        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
                        labels: { style: { colors: '#64748b' } }
                      },
                      yaxis: {
                        labels: { style: { colors: '#64748b' } }
                      },
                      tooltip: { y: {} }
                    }}
                    series={[{
                      name: 'Portfolio Value',
                      data: [114500, 120000, 118500, 122000, 126000, 132000, 137000, 142000, 145000, 147582]
                    }]}
                    type="area"
                    height={300}
                  />
                </div>

                {/* Performance Stats */}
                <div className="flex flex-wrap -mx-2">
                  <div className="w-1/3 px-2">
                    <div className="p-4 bg-gray-50 rounded-lg hover:shadow-md transition-shadow">
                      <p className="text-sm text-gray-500">Total Return</p>
                      <p className="text-2xl font-bold text-green-600">+{portfolio.totalReturn}%</p>
                      <p className="text-xs text-gray-500">Since inception</p>
                    </div>
                  </div>
                  <div className="w-1/3 px-2">
                    <div className="p-4 bg-gray-50 rounded-lg hover:shadow-md transition-shadow">
                      <p className="text-sm text-gray-500">Annual Return</p>
                      <p className="text-2xl font-bold">{portfolio.annualReturn}%</p>
                      <p className="text-xs text-gray-500">Last 12 months</p>
                    </div>
                  </div>
                  <div className="w-1/3 px-2">
                    <div className="p-4 bg-gray-50 rounded-lg hover:shadow-md transition-shadow">
                      <p className="text-sm text-gray-500">Risk Score</p>
                      <p className="text-2xl font-bold">
                        {portfolio.riskScore}<span className="text-sm font-normal">/10</span>
                      </p>
                      <p className="text-xs text-gray-500">High volatility</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Holdings Table */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold">Holdings</h3>
              </div>
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-gray-500 text-sm">
                        <th className="pb-3 font-medium">Asset</th>
                        <th className="pb-3 font-medium">Allocation</th>
                        <th className="pb-3 font-medium">Value</th>
                        <th className="pb-3 font-medium">Return</th>
                        <th className="pb-3 font-medium">24h Change</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      <tr className="hover:bg-gray-50 transition-colors">
                        <td className="py-3">
                          <div className="flex items-center">
                            <div className="h-8 w-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-3">
                              <span className="material-symbols-outlined text-sm">trending_up</span>
                            </div>
                            <div>
                              <p className="font-medium">AAPL</p>
                              <p className="text-sm text-gray-500">Apple Inc.</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-500 h-2 rounded-full" style={{width: '35%'}}></div>
                          </div>
                          <p className="text-sm mt-1">35%</p>
                        </td>
                        <td className="py-3">$51,654.00</td>
                        <td className="py-3 text-green-600">+24.7%</td>
                        <td className="py-3 text-green-600">+1.2%</td>
                      </tr>
                      <tr className="hover:bg-gray-50 transition-colors">
                        <td className="py-3">
                          <div className="flex items-center">
                            <div className="h-8 w-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mr-3">
                              <span className="material-symbols-outlined text-sm">language</span>
                            </div>
                            <div>
                              <p className="font-medium">MSFT</p>
                              <p className="text-sm text-gray-500">Microsoft Corp.</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-purple-500 h-2 rounded-full" style={{width: '25%'}}></div>
                          </div>
                          <p className="text-sm mt-1">25%</p>
                        </td>
                        <td className="py-3">$36,895.50</td>
                        <td className="py-3 text-green-600">+18.3%</td>
                        <td className="py-3 text-green-600">+0.8%</td>
                      </tr>
                      <tr className="hover:bg-gray-50 transition-colors">
                        <td className="py-3">
                          <div className="flex items-center">
                            <div className="h-8 w-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center mr-3">
                              <span className="material-symbols-outlined text-sm">shopping_cart</span>
                            </div>
                            <div>
                              <p className="font-medium">AMZN</p>
                              <p className="text-sm text-gray-500">Amazon.com Inc.</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{width: '20%'}}></div>
                          </div>
                          <p className="text-sm mt-1">20%</p>
                        </td>
                        <td className="py-3">$29,516.52</td>
                        <td className="py-3 text-green-600">+15.9%</td>
                        <td className="py-3 text-red-600">-0.4%</td>
                      </tr>
                      <tr className="hover:bg-gray-50 transition-colors">
                        <td className="py-3">
                          <div className="flex items-center">
                            <div className="h-8 w-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center mr-3">
                              <span className="material-symbols-outlined text-sm">play_circle</span>
                            </div>
                            <div>
                              <p className="font-medium">NFLX</p>
                              <p className="text-sm text-gray-500">Netflix Inc.</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-red-500 h-2 rounded-full" style={{width: '15%'}}></div>
                          </div>
                          <p className="text-sm mt-1">15%</p>
                        </td>
                        <td className="py-3">$22,137.39</td>
                        <td className="py-3 text-green-600">+12.4%</td>
                        <td className="py-3 text-green-600">+2.1%</td>
                      </tr>
                      <tr className="hover:bg-gray-50 transition-colors">
                        <td className="py-3">
                          <div className="flex items-center">
                            <div className="h-8 w-8 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mr-3">
                              <span className="material-symbols-outlined text-sm">electric_car</span>
                            </div>
                            <div>
                              <p className="font-medium">TSLA</p>
                              <p className="text-sm text-gray-500">Tesla Inc.</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-yellow-500 h-2 rounded-full" style={{width: '5%'}}></div>
                          </div>
                          <p className="text-sm mt-1">5%</p>
                        </td>
                        <td className="py-3">$7,379.13</td>
                        <td className="py-3 text-red-600">-5.2%</td>
                        <td className="py-3 text-red-600">-1.7%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-full md:w-1/3">
            {/* AI Strategy Insights - Exact from your design */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold">AI Strategy Insights</h3>
              </div>
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <span className="material-symbols-outlined text-primary-600 text-xl mr-2">psychology</span>
                  <p className="text-sm text-gray-500">AI Recommendation</p>
                </div>
                <p className="text-gray-700 mb-4">
                  Based on current market conditions and your risk profile, our AI suggests
                  increasing your tech exposure by 5% and reducing financial sector allocation.
                </p>
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <span className="material-symbols-outlined text-green-600 mr-1">trending_up</span>
                      <p className="text-sm">Tech Sector</p>
                    </div>
                    <p className="text-sm font-medium text-green-600">+5%</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <span className="material-symbols-outlined text-red-600 mr-1">trending_down</span>
                      <p className="text-sm">Financial Sector</p>
                    </div>
                    <p className="text-sm font-medium text-red-600">-3%</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <span className="material-symbols-outlined text-yellow-600 mr-1">trending_flat</span>
                      <p className="text-sm">Other Sectors</p>
                    </div>
                    <p className="text-sm font-medium text-gray-600">No change</p>
                  </div>
                </div>
                <button className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-lg transition-colors">
                  Apply Recommendations
                </button>
              </div>
            </div>

            {/* Risk Assessment - Exact from your design */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold">Risk Assessment</h3>
              </div>
              <div className="p-6">
                <div className="mb-6">
                  <p className="text-sm text-gray-500 mb-1">Current Risk Level</p>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div className="bg-primary-600 h-4 rounded-full" style={{width: '87%'}}></div>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-gray-500">Low Risk</span>
                    <span className="text-xs text-gray-500">High Risk</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center mb-2">
                      <span className="material-symbols-outlined text-yellow-600 mr-2">warning</span>
                      <p className="font-medium">Concentration Risk</p>
                    </div>
                    <p className="text-sm text-gray-700">
                      Tech sector allocation is higher than recommended (80% vs 65%).
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center mb-2">
                      <span className="material-symbols-outlined text-green-600 mr-2">check_circle</span>
                      <p className="font-medium">Volatility</p>
                    </div>
                    <p className="text-sm text-gray-700">
                      Portfolio volatility is within expected range for your risk profile.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Comparison - Exact from your design */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold">Performance Comparison</h3>
              </div>
              <div className="p-6">
                <div className="h-[200px] w-full relative mb-4">
                  <Chart
                    options={{
                      chart: {
                        type: 'line',
                        width: '100%',
                        height: 200,
                        toolbar: { show: false },
                        zoom: { enabled: false }
                      },
                      dataLabels: { enabled: false },
                      stroke: { curve: 'smooth', width: 2 },
                      colors: ['#8b5cf6', '#64748b'],
                      xaxis: {
                        categories: ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
                        labels: { style: { colors: '#64748b' } }
                      },
                      yaxis: {
                        labels: { style: { colors: '#64748b' } },
                        title: { text: 'Normalized Return (%)' }
                      },
                      legend: { position: 'top' },
                      tooltip: { y: {} }
                    }}
                    series={[
                      { name: 'Your Portfolio', data: [100, 110, 115, 112, 120, 135, 145, 147] },
                      { name: 'S&P 500', data: [100, 105, 110, 108, 112, 118, 125, 130] }
                    ]}
                    type="line"
                    height={200}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-50 rounded-lg hover:shadow-md transition-shadow">
                    <p className="text-sm text-gray-500">vs. S&P 500</p>
                    <p className="text-xl font-bold text-green-600">+17.3%</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg hover:shadow-md transition-shadow">
                    <p className="text-sm text-gray-500">vs. Benchmark</p>
                    <p className="text-xl font-bold text-green-600">+12.8%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Transactions - Exact from your design */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-semibold">Recent Transactions</h3>
                <button className="text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors">
                  View All
                </button>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center mr-4">
                        <span className="material-symbols-outlined">add_circle</span>
                      </div>
                      <div>
                        <p className="font-medium">Deposit</p>
                        <p className="text-sm text-gray-500">Oct 15, 2023</p>
                      </div>
                    </div>
                    <p className="font-semibold text-green-600">+$5,000.00</p>
                  </div>
                  <div className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-4">
                        <span className="material-symbols-outlined">sync</span>
                      </div>
                      <div>
                        <p className="font-medium">Auto-rebalance</p>
                        <p className="text-sm text-gray-500">Oct 1, 2023</p>
                      </div>
                    </div>
                    <p className="font-semibold text-gray-600">Completed</p>
                  </div>
                  <div className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mr-4">
                        <span className="material-symbols-outlined">shopping_cart</span>
                      </div>
                      <div>
                        <p className="font-medium">Buy MSFT</p>
                        <p className="text-sm text-gray-500">Sep 28, 2023</p>
                      </div>
                    </div>
                    <p className="font-semibold text-purple-600">10 shares</p>
                  </div>
                  <div className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center mr-4">
                        <span className="material-symbols-outlined">sell</span>
                      </div>
                      <div>
                        <p className="font-medium">Sell TSLA</p>
                        <p className="text-sm text-gray-500">Sep 15, 2023</p>
                      </div>
                    </div>
                    <p className="font-semibold text-red-600">5 shares</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="text-center mt-8">
          <a 
            href="/portfolios"
            className="inline-block bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg mr-4"
          >
            ← Portföy Çeşitleri
          </a>
          <a 
            href="/"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg"
          >
            Ana Sayfa
          </a>
        </div>
      </main>
    </div>
  )
}

// Value Portfolio Detail Component - Conservative investments
function ValuePortfolioDetail() {
  const [portfolio] = useState({
    name: 'Value Portfolio',
    riskLevel: 'Medium Risk',
    currentValue: 95420.30,
    todayChange: 1284.60,
    todayChangePercent: 1.37,
    totalReturn: 23.45,
    annualReturn: 12.8,
    riskScore: 5.4,
    holdings: [
      {
        symbol: 'BRK.B',
        name: 'Berkshire Hathaway',
        allocation: 30,
        value: 28626.09,
        return: 15.2,
        dayChange: 0.6,
        icon: 'business',
        color: 'blue'
      },
      {
        symbol: 'JPM',
        name: 'JPMorgan Chase',
        allocation: 25,
        value: 23855.07,
        return: 12.8,
        dayChange: 0.9,
        icon: 'account_balance',
        color: 'green'
      },
      {
        symbol: 'JNJ',
        name: 'Johnson & Johnson',
        allocation: 20,
        value: 19084.06,
        return: 8.4,
        dayChange: 0.3,
        icon: 'local_hospital',
        color: 'red'
      },
      {
        symbol: 'KO',
        name: 'Coca-Cola Company',
        allocation: 15,
        value: 14313.04,
        return: 6.1,
        dayChange: -0.2,
        icon: 'local_cafe',
        color: 'orange'
      },
      {
        symbol: 'PG',
        name: 'Procter & Gamble',
        allocation: 10,
        value: 9542.03,
        return: 9.7,
        dayChange: 0.5,
        icon: 'cleaning_services',
        color: 'purple'
      }
    ]
  })

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header - Same as Growth */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <span className="material-symbols-outlined text-primary-600 text-2xl mr-2">analytics</span>
            <h1 className="text-xl font-bold text-gray-900">AI Portfolio Manager</h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="flex items-center text-gray-600 hover:text-primary-600 transition-colors">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button className="flex items-center text-gray-600 hover:text-primary-600 transition-colors">
              <span className="material-symbols-outlined">settings</span>
            </button>
            <div className="flex items-center">
              <img
                src="https://randomuser.me/api/portraits/women/12.jpg"
                alt="Profile"
                className="h-8 w-8 rounded-full object-cover"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Main Content */}
          <div className="w-full md:w-2/3">
            {/* Portfolio Overview */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
              <div className="bg-blue-600 px-6 py-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-white text-xl font-semibold">Value Portfolio</h2>
                  <span className="bg-white text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
                    Medium Risk
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <p className="text-sm text-gray-500">Current Value</p>
                    <p className="text-3xl font-bold">$95,420.30</p>
                    <div className="flex items-center mt-1">
                      <span className="text-green-600 flex items-center text-sm">
                        <span className="material-symbols-outlined text-sm">trending_up</span>
                        +1.37%
                      </span>
                      <span className="text-gray-500 text-sm ml-2">Today</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="bg-primary-50 hover:bg-primary-100 text-primary-600 px-4 py-2 rounded-lg transition-colors flex items-center">
                      <span className="material-symbols-outlined mr-1">add</span> Deposit
                    </button>
                    <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors flex items-center">
                      <span className="material-symbols-outlined mr-1">edit</span> Edit
                    </button>
                  </div>
                </div>
                
                {/* Value Portfolio Performance Chart */}
                <div className="h-[300px] w-full relative mb-6">
                  <Chart
                    options={{
                      chart: {
                        type: 'area',
                        width: '100%',
                        height: 300,
                        toolbar: { show: false },
                        zoom: { enabled: false }
                      },
                      dataLabels: { enabled: false },
                      stroke: { curve: 'smooth', width: 2 },
                      colors: ['#3b82f6'], // Blue theme for Value
                      fill: {
                        type: 'gradient',
                        gradient: {
                          shadeIntensity: 1,
                          opacityFrom: 0.7,
                          opacityTo: 0.2,
                          stops: [0, 90, 100]
                        }
                      },
                      xaxis: {
                        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
                        labels: { style: { colors: '#64748b' } }
                      },
                      yaxis: {
                        labels: { style: { colors: '#64748b' } }
                      },
                      tooltip: { y: {} }
                    }}
                    series={[{
                      name: 'Portfolio Value',
                      data: [85000, 87200, 86800, 89100, 91500, 93200, 94800, 95100, 94600, 95420]
                    }]}
                    type="area"
                    height={300}
                  />
                </div>

                {/* Performance Stats - Value Portfolio */}
                <div className="flex flex-wrap -mx-2">
                  <div className="w-1/3 px-2">
                    <div className="p-4 bg-gray-50 rounded-lg hover:shadow-md transition-shadow">
                      <p className="text-sm text-gray-500">Total Return</p>
                      <p className="text-2xl font-bold text-green-600">+23.45%</p>
                      <p className="text-xs text-gray-500">Since inception</p>
                    </div>
                  </div>
                  <div className="w-1/3 px-2">
                    <div className="p-4 bg-gray-50 rounded-lg hover:shadow-md transition-shadow">
                      <p className="text-sm text-gray-500">Annual Return</p>
                      <p className="text-2xl font-bold">12.8%</p>
                      <p className="text-xs text-gray-500">Last 12 months</p>
                    </div>
                  </div>
                  <div className="w-1/3 px-2">
                    <div className="p-4 bg-gray-50 rounded-lg hover:shadow-md transition-shadow">
                      <p className="text-sm text-gray-500">Risk Score</p>
                      <p className="text-2xl font-bold">
                        5.4<span className="text-sm font-normal">/10</span>
                      </p>
                      <p className="text-xs text-gray-500">Moderate risk</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Holdings Table - Value Portfolio */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold">Holdings</h3>
              </div>
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-gray-500 text-sm">
                        <th className="pb-3 font-medium">Asset</th>
                        <th className="pb-3 font-medium">Allocation</th>
                        <th className="pb-3 font-medium">Value</th>
                        <th className="pb-3 font-medium">Return</th>
                        <th className="pb-3 font-medium">24h Change</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {portfolio.holdings.map((holding, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3">
                            <div className="flex items-center">
                              <div className={`h-8 w-8 bg-${holding.color}-100 text-${holding.color}-600 rounded-full flex items-center justify-center mr-3`}>
                                <span className="material-symbols-outlined text-sm">{holding.icon}</span>
                              </div>
                              <div>
                                <p className="font-medium">{holding.symbol}</p>
                                <p className="text-sm text-gray-500">{holding.name}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`bg-${holding.color}-500 h-2 rounded-full`}
                                style={{ width: `${holding.allocation}%` }}
                              />
                            </div>
                            <p className="text-sm mt-1">{holding.allocation}%</p>
                          </td>
                          <td className="py-3">${holding.value.toLocaleString()}</td>
                          <td className={`py-3 ${holding.return >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {holding.return >= 0 ? '+' : ''}{holding.return}%
                          </td>
                          <td className={`py-3 ${holding.dayChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {holding.dayChange >= 0 ? '+' : ''}{holding.dayChange}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Value specific */}
          <div className="w-full md:w-1/3">
            {/* AI Strategy Insights for Value */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold">AI Strategy Insights</h3>
              </div>
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <span className="material-symbols-outlined text-primary-600 text-xl mr-2">psychology</span>
                  <p className="text-sm text-gray-500">AI Recommendation</p>
                </div>
                <p className="text-gray-700 mb-4">
                  Your value portfolio shows strong defensive characteristics. Consider increasing dividend-focused positions and maintaining current allocation to financial sector.
                </p>
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <span className="material-symbols-outlined text-green-600 mr-1">trending_up</span>
                      <p className="text-sm">Dividend Stocks</p>
                    </div>
                    <p className="text-sm font-medium text-green-600">+3%</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <span className="material-symbols-outlined text-blue-600 mr-1">trending_flat</span>
                      <p className="text-sm">Financial Sector</p>
                    </div>
                    <p className="text-sm font-medium text-blue-600">Hold</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <span className="material-symbols-outlined text-red-600 mr-1">trending_down</span>
                      <p className="text-sm">Growth Stocks</p>
                    </div>
                    <p className="text-sm font-medium text-red-600">-2%</p>
                  </div>
                </div>
                <button className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-lg transition-colors">
                  Apply Recommendations
                </button>
              </div>
            </div>

            {/* Risk Assessment - Value Portfolio */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold">Risk Assessment</h3>
              </div>
              <div className="p-6">
                <div className="mb-6">
                  <p className="text-sm text-gray-500 mb-1">Current Risk Level</p>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div className="bg-blue-600 h-4 rounded-full" style={{width: '54%'}}></div>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-gray-500">Low Risk</span>
                    <span className="text-xs text-gray-500">High Risk</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center mb-2">
                      <span className="material-symbols-outlined text-green-600 mr-2">check_circle</span>
                      <p className="font-medium">Diversification</p>
                    </div>
                    <p className="text-sm text-gray-700">
                      Well-diversified across defensive sectors with stable dividend yields.
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center mb-2">
                      <span className="material-symbols-outlined text-blue-600 mr-2">info</span>
                      <p className="font-medium">Conservative Approach</p>
                    </div>
                    <p className="text-sm text-gray-700">
                      Portfolio maintains conservative risk profile suitable for stable returns.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Comparison - Value Portfolio */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold">Performance Comparison</h3>
              </div>
              <div className="p-6">
                <div className="h-[200px] w-full relative mb-4">
                  <Chart
                    options={{
                      chart: {
                        type: 'line',
                        width: '100%',
                        height: 200,
                        toolbar: { show: false },
                        zoom: { enabled: false }
                      },
                      dataLabels: { enabled: false },
                      stroke: { curve: 'smooth', width: 2 },
                      colors: ['#3b82f6', '#64748b'],
                      xaxis: {
                        categories: ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
                        labels: { style: { colors: '#64748b' } }
                      },
                      yaxis: {
                        labels: { style: { colors: '#64748b' } },
                        title: { text: 'Normalized Return (%)' }
                      },
                      legend: { position: 'top' },
                      tooltip: { y: {} }
                    }}
                    series={[
                      { name: 'Your Portfolio', data: [100, 103, 106, 105, 108, 111, 113, 112] },
                      { name: 'S&P 500', data: [100, 105, 110, 108, 112, 118, 125, 130] }
                    ]}
                    type="line"
                    height={200}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-50 rounded-lg hover:shadow-md transition-shadow">
                    <p className="text-sm text-gray-500">vs. S&P 500</p>
                    <p className="text-xl font-bold text-red-600">-18.0%</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg hover:shadow-md transition-shadow">
                    <p className="text-sm text-gray-500">vs. Value Index</p>
                    <p className="text-xl font-bold text-green-600">+5.2%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="text-center mt-8">
          <a 
            href="/portfolios"
            className="inline-block bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg mr-4"
          >
            ← Portföy Çeşitleri
          </a>
          <a 
            href="/"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg"
          >
            Ana Sayfa
          </a>
        </div>
      </main>
    </div>
  )
}

// Momentum Portfolio Detail Component - Trend following investments
function MomentumPortfolioDetail() {
  const [portfolio] = useState({
    name: 'Momentum Portfolio',
    riskLevel: 'High Risk',
    currentValue: 142850.75,
    todayChange: 3784.20,
    todayChangePercent: 2.72,
    totalReturn: 45.8,
    annualReturn: 28.4,
    riskScore: 8.7,
    holdings: [
      {
        symbol: 'NVDA',
        name: 'NVIDIA Corporation',
        allocation: 25,
        value: 35712.69,
        return: 78.4,
        dayChange: 4.2,
        icon: 'developer_board',
        color: 'green'
      },
      {
        symbol: 'TSLA',
        name: 'Tesla Inc.',
        allocation: 20,
        value: 28570.15,
        return: 52.1,
        dayChange: 3.8,
        icon: 'electric_car',
        color: 'red'
      },
      {
        symbol: 'AMD',
        name: 'Advanced Micro Devices',
        allocation: 18,
        value: 25713.14,
        return: 43.2,
        dayChange: 2.1,
        icon: 'memory',
        color: 'orange'
      },
      {
        symbol: 'NFLX',
        name: 'Netflix Inc.',
        allocation: 17,
        value: 24284.63,
        return: 38.7,
        dayChange: 1.5,
        icon: 'play_circle',
        color: 'red'
      },
      {
        symbol: 'SQ',
        name: 'Block Inc.',
        allocation: 20,
        value: 28570.15,
        return: 34.9,
        dayChange: -0.8,
        icon: 'credit_card',
        color: 'blue'
      }
    ]
  })

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <span className="material-symbols-outlined text-primary-600 text-2xl mr-2">analytics</span>
            <h1 className="text-xl font-bold text-gray-900">AI Portfolio Manager</h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="flex items-center text-gray-600 hover:text-primary-600 transition-colors">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button className="flex items-center text-gray-600 hover:text-primary-600 transition-colors">
              <span className="material-symbols-outlined">settings</span>
            </button>
            <div className="flex items-center">
              <img
                src="https://randomuser.me/api/portraits/men/15.jpg"
                alt="Profile"
                className="h-8 w-8 rounded-full object-cover"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Main Content */}
          <div className="w-full md:w-2/3">
            {/* Portfolio Overview */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
              <div className="bg-purple-600 px-6 py-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-white text-xl font-semibold">Momentum Portfolio</h2>
                  <span className="bg-white text-purple-600 px-3 py-1 rounded-full text-sm font-medium">
                    High Risk
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <p className="text-sm text-gray-500">Current Value</p>
                    <p className="text-3xl font-bold">$142,850.75</p>
                    <div className="flex items-center mt-1">
                      <span className="text-green-600 flex items-center text-sm">
                        <span className="material-symbols-outlined text-sm">trending_up</span>
                        +2.72%
                      </span>
                      <span className="text-gray-500 text-sm ml-2">Today</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="bg-primary-50 hover:bg-primary-100 text-primary-600 px-4 py-2 rounded-lg transition-colors flex items-center">
                      <span className="material-symbols-outlined mr-1">add</span> Deposit
                    </button>
                    <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors flex items-center">
                      <span className="material-symbols-outlined mr-1">edit</span> Edit
                    </button>
                  </div>
                </div>
                
                {/* Momentum Portfolio Performance Chart */}
                <div className="h-[300px] w-full relative mb-6">
                  <Chart
                    options={{
                      chart: {
                        type: 'area',
                        width: '100%',
                        height: 300,
                        toolbar: { show: false },
                        zoom: { enabled: false }
                      },
                      dataLabels: { enabled: false },
                      stroke: { curve: 'smooth', width: 2 },
                      colors: ['#9333ea'], // Purple theme for Momentum
                      fill: {
                        type: 'gradient',
                        gradient: {
                          shadeIntensity: 1,
                          opacityFrom: 0.7,
                          opacityTo: 0.2,
                          stops: [0, 90, 100]
                        }
                      },
                      xaxis: {
                        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
                        labels: { style: { colors: '#64748b' } }
                      },
                      yaxis: {
                        labels: { style: { colors: '#64748b' } }
                      },
                      tooltip: { y: {} }
                    }}
                    series={[{
                      name: 'Portfolio Value',
                      data: [98000, 105000, 112000, 118000, 125000, 132000, 138000, 145000, 140000, 142850]
                    }]}
                    type="area"
                    height={300}
                  />
                </div>

                {/* Performance Stats - Momentum Portfolio */}
                <div className="flex flex-wrap -mx-2">
                  <div className="w-1/3 px-2">
                    <div className="p-4 bg-gray-50 rounded-lg hover:shadow-md transition-shadow">
                      <p className="text-sm text-gray-500">Total Return</p>
                      <p className="text-2xl font-bold text-green-600">+45.8%</p>
                      <p className="text-xs text-gray-500">Since inception</p>
                    </div>
                  </div>
                  <div className="w-1/3 px-2">
                    <div className="p-4 bg-gray-50 rounded-lg hover:shadow-md transition-shadow">
                      <p className="text-sm text-gray-500">Annual Return</p>
                      <p className="text-2xl font-bold">28.4%</p>
                      <p className="text-xs text-gray-500">Last 12 months</p>
                    </div>
                  </div>
                  <div className="w-1/3 px-2">
                    <div className="p-4 bg-gray-50 rounded-lg hover:shadow-md transition-shadow">
                      <p className="text-sm text-gray-500">Risk Score</p>
                      <p className="text-2xl font-bold">
                        8.7<span className="text-sm font-normal">/10</span>
                      </p>
                      <p className="text-xs text-gray-500">High risk</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Holdings Table - Momentum Portfolio */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold">Holdings</h3>
              </div>
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-gray-500 text-sm">
                        <th className="pb-3 font-medium">Asset</th>
                        <th className="pb-3 font-medium">Allocation</th>
                        <th className="pb-3 font-medium">Value</th>
                        <th className="pb-3 font-medium">Return</th>
                        <th className="pb-3 font-medium">24h Change</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {portfolio.holdings.map((holding, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3">
                            <div className="flex items-center">
                              <div className={`h-8 w-8 bg-${holding.color}-100 text-${holding.color}-600 rounded-full flex items-center justify-center mr-3`}>
                                <span className="material-symbols-outlined text-sm">{holding.icon}</span>
                              </div>
                              <div>
                                <p className="font-medium">{holding.symbol}</p>
                                <p className="text-sm text-gray-500">{holding.name}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`bg-${holding.color}-500 h-2 rounded-full`}
                                style={{ width: `${holding.allocation}%` }}
                              />
                            </div>
                            <p className="text-sm mt-1">{holding.allocation}%</p>
                          </td>
                          <td className="py-3">${holding.value.toLocaleString()}</td>
                          <td className={`py-3 ${holding.return >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {holding.return >= 0 ? '+' : ''}{holding.return}%
                          </td>
                          <td className={`py-3 ${holding.dayChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {holding.dayChange >= 0 ? '+' : ''}{holding.dayChange}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Momentum specific */}
          <div className="w-full md:w-1/3">
            {/* AI Strategy Insights for Momentum */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold">AI Strategy Insights</h3>
              </div>
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <span className="material-symbols-outlined text-primary-600 text-xl mr-2">psychology</span>
                  <p className="text-sm text-gray-500">AI Recommendation</p>
                </div>
                <p className="text-gray-700 mb-4">
                  Strong momentum signals detected in tech sector. Consider increasing exposure to AI and semiconductor stocks while monitoring volatility levels.
                </p>
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <span className="material-symbols-outlined text-green-600 mr-1">trending_up</span>
                      <p className="text-sm">Tech Stocks</p>
                    </div>
                    <p className="text-sm font-medium text-green-600">+5%</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <span className="material-symbols-outlined text-green-600 mr-1">trending_up</span>
                      <p className="text-sm">AI Sector</p>
                    </div>
                    <p className="text-sm font-medium text-green-600">+3%</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <span className="material-symbols-outlined text-orange-600 mr-1">warning</span>
                      <p className="text-sm">Traditional Stocks</p>
                    </div>
                    <p className="text-sm font-medium text-orange-600">Watch</p>
                  </div>
                </div>
                <button className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-lg transition-colors">
                  Apply Recommendations
                </button>
              </div>
            </div>

            {/* Risk Assessment - Momentum Portfolio */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold">Risk Assessment</h3>
              </div>
              <div className="p-6">
                <div className="mb-6">
                  <p className="text-sm text-gray-500 mb-1">Current Risk Level</p>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div className="bg-red-600 h-4 rounded-full" style={{width: '87%'}}></div>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-gray-500">Low Risk</span>
                    <span className="text-xs text-gray-500">High Risk</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center mb-2">
                      <span className="material-symbols-outlined text-orange-600 mr-2">warning</span>
                      <p className="font-medium">High Volatility</p>
                    </div>
                    <p className="text-sm text-gray-700">
                      Portfolio shows high correlation with market trends and significant daily swings.
                    </p>
                  </div>
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center mb-2">
                      <span className="material-symbols-outlined text-red-600 mr-2">trending_down</span>
                      <p className="font-medium">Concentration Risk</p>
                    </div>
                    <p className="text-sm text-gray-700">
                      Heavy concentration in technology sector increases downside risk during market corrections.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Comparison - Momentum Portfolio */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold">Performance Comparison</h3>
              </div>
              <div className="p-6">
                <div className="h-[200px] w-full relative mb-4">
                  <Chart
                    options={{
                      chart: {
                        type: 'line',
                        width: '100%',
                        height: 200,
                        toolbar: { show: false },
                        zoom: { enabled: false }
                      },
                      dataLabels: { enabled: false },
                      stroke: { curve: 'smooth', width: 2 },
                      colors: ['#9333ea', '#64748b', '#10b981'],
                      xaxis: {
                        categories: ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
                        labels: { style: { colors: '#64748b' } }
                      },
                      yaxis: {
                        labels: { style: { colors: '#64748b' } },
                        title: { text: 'Normalized Return (%)' }
                      },
                      legend: { position: 'top' },
                      tooltip: { y: {} }
                    }}
                    series={[
                      { name: 'Your Portfolio', data: [100, 108, 115, 122, 128, 135, 142, 146] },
                      { name: 'S&P 500', data: [100, 105, 110, 108, 112, 118, 125, 130] },
                      { name: 'NASDAQ', data: [100, 107, 113, 118, 124, 130, 138, 142] }
                    ]}
                    type="line"
                    height={200}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-50 rounded-lg hover:shadow-md transition-shadow">
                    <p className="text-sm text-gray-500">vs. S&P 500</p>
                    <p className="text-xl font-bold text-green-600">+16.0%</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg hover:shadow-md transition-shadow">
                    <p className="text-sm text-gray-500">vs. NASDAQ</p>
                    <p className="text-xl font-bold text-green-600">+4.0%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="text-center mt-8">
          <a 
            href="/portfolios"
            className="inline-block bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg mr-4"
          >
            ← Portföy Çeşitleri
          </a>
          <a 
            href="/"
            className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg"
          >
            Ana Sayfa
          </a>
        </div>
      </main>
    </div>
  )
}

// Crypto Blue Chips Portfolio Detail Component - Major cryptocurrencies
function CryptoBluechipsPortfolioDetail() {
  const [portfolio] = useState({
    name: 'Crypto Blue Chips Portfolio',
    riskLevel: 'Very High Risk',
    currentValue: 89320.45,
    todayChange: -2150.30,
    todayChangePercent: -2.35,
    totalReturn: 185.7,
    annualReturn: 67.8,
    riskScore: 9.2,
    holdings: [
      {
        symbol: 'BTC',
        name: 'Bitcoin',
        allocation: 40,
        value: 35728.18,
        return: 156.2,
        dayChange: -1.8,
        icon: 'currency_bitcoin',
        color: 'orange'
      },
      {
        symbol: 'ETH',
        name: 'Ethereum',
        allocation: 30,
        value: 26796.14,
        return: 198.5,
        dayChange: -2.1,
        icon: 'diamond',
        color: 'blue'
      },
      {
        symbol: 'BNB',
        name: 'BNB',
        allocation: 12,
        value: 10718.45,
        return: 124.8,
        dayChange: -3.2,
        icon: 'savings',
        color: 'yellow'
      },
      {
        symbol: 'SOL',
        name: 'Solana',
        allocation: 10,
        value: 8932.05,
        return: 245.6,
        dayChange: -4.5,
        icon: 'wb_sunny',
        color: 'purple'
      },
      {
        symbol: 'ADA',
        name: 'Cardano',
        allocation: 8,
        value: 7145.64,
        return: 89.3,
        dayChange: -1.2,
        icon: 'eco',
        color: 'green'
      }
    ]
  })

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <span className="material-symbols-outlined text-primary-600 text-2xl mr-2">analytics</span>
            <h1 className="text-xl font-bold text-gray-900">AI Portfolio Manager</h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="flex items-center text-gray-600 hover:text-primary-600 transition-colors">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button className="flex items-center text-gray-600 hover:text-primary-600 transition-colors">
              <span className="material-symbols-outlined">settings</span>
            </button>
            <div className="flex items-center">
              <img
                src="https://randomuser.me/api/portraits/women/32.jpg"
                alt="Profile"
                className="h-8 w-8 rounded-full object-cover"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Main Content */}
          <div className="w-full md:w-2/3">
            {/* Portfolio Overview */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
              <div className="bg-orange-600 px-6 py-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-white text-xl font-semibold">Crypto Blue Chips Portfolio</h2>
                  <span className="bg-white text-orange-600 px-3 py-1 rounded-full text-sm font-medium">
                    Very High Risk
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <p className="text-sm text-gray-500">Current Value</p>
                    <p className="text-3xl font-bold">$89,320.45</p>
                    <div className="flex items-center mt-1">
                      <span className="text-red-600 flex items-center text-sm">
                        <span className="material-symbols-outlined text-sm">trending_down</span>
                        -2.35%
                      </span>
                      <span className="text-gray-500 text-sm ml-2">Today</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="bg-primary-50 hover:bg-primary-100 text-primary-600 px-4 py-2 rounded-lg transition-colors flex items-center">
                      <span className="material-symbols-outlined mr-1">add</span> Deposit
                    </button>
                    <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors flex items-center">
                      <span className="material-symbols-outlined mr-1">edit</span> Edit
                    </button>
                  </div>
                </div>
                
                {/* Crypto Portfolio Performance Chart */}
                <div className="h-[300px] w-full relative mb-6">
                  <Chart
                    options={{
                      chart: {
                        type: 'area',
                        width: '100%',
                        height: 300,
                        toolbar: { show: false },
                        zoom: { enabled: false }
                      },
                      dataLabels: { enabled: false },
                      stroke: { curve: 'smooth', width: 2 },
                      colors: ['#f97316'], // Orange theme for Crypto
                      fill: {
                        type: 'gradient',
                        gradient: {
                          shadeIntensity: 1,
                          opacityFrom: 0.7,
                          opacityTo: 0.2,
                          stops: [0, 90, 100]
                        }
                      },
                      xaxis: {
                        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
                        labels: { style: { colors: '#64748b' } }
                      },
                      yaxis: {
                        labels: { style: { colors: '#64748b' } }
                      },
                      tooltip: { y: {} }
                    }}
                    series={[{
                      name: 'Portfolio Value',
                      data: [31250, 42800, 58200, 76500, 62400, 89300, 125600, 98400, 110250, 89320]
                    }]}
                    type="area"
                    height={300}
                  />
                </div>

                {/* Performance Stats - Crypto Portfolio */}
                <div className="flex flex-wrap -mx-2">
                  <div className="w-1/3 px-2">
                    <div className="p-4 bg-gray-50 rounded-lg hover:shadow-md transition-shadow">
                      <p className="text-sm text-gray-500">Total Return</p>
                      <p className="text-2xl font-bold text-green-600">+185.7%</p>
                      <p className="text-xs text-gray-500">Since inception</p>
                    </div>
                  </div>
                  <div className="w-1/3 px-2">
                    <div className="p-4 bg-gray-50 rounded-lg hover:shadow-md transition-shadow">
                      <p className="text-sm text-gray-500">Annual Return</p>
                      <p className="text-2xl font-bold">67.8%</p>
                      <p className="text-xs text-gray-500">Last 12 months</p>
                    </div>
                  </div>
                  <div className="w-1/3 px-2">
                    <div className="p-4 bg-gray-50 rounded-lg hover:shadow-md transition-shadow">
                      <p className="text-sm text-gray-500">Risk Score</p>
                      <p className="text-2xl font-bold">
                        9.2<span className="text-sm font-normal">/10</span>
                      </p>
                      <p className="text-xs text-gray-500">Very high risk</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Holdings Table - Crypto Portfolio */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold">Holdings</h3>
              </div>
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-gray-500 text-sm">
                        <th className="pb-3 font-medium">Asset</th>
                        <th className="pb-3 font-medium">Allocation</th>
                        <th className="pb-3 font-medium">Value</th>
                        <th className="pb-3 font-medium">Return</th>
                        <th className="pb-3 font-medium">24h Change</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {portfolio.holdings.map((holding, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3">
                            <div className="flex items-center">
                              <div className={`h-8 w-8 bg-${holding.color}-100 text-${holding.color}-600 rounded-full flex items-center justify-center mr-3`}>
                                <span className="material-symbols-outlined text-sm">{holding.icon}</span>
                              </div>
                              <div>
                                <p className="font-medium">{holding.symbol}</p>
                                <p className="text-sm text-gray-500">{holding.name}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`bg-${holding.color}-500 h-2 rounded-full`}
                                style={{ width: `${holding.allocation}%` }}
                              />
                            </div>
                            <p className="text-sm mt-1">{holding.allocation}%</p>
                          </td>
                          <td className="py-3">${holding.value.toLocaleString()}</td>
                          <td className={`py-3 ${holding.return >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {holding.return >= 0 ? '+' : ''}{holding.return}%
                          </td>
                          <td className={`py-3 ${holding.dayChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {holding.dayChange >= 0 ? '+' : ''}{holding.dayChange}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Crypto specific */}
          <div className="w-full md:w-1/3">
            {/* AI Strategy Insights for Crypto */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold">AI Strategy Insights</h3>
              </div>
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <span className="material-symbols-outlined text-primary-600 text-xl mr-2">psychology</span>
                  <p className="text-sm text-gray-500">AI Recommendation</p>
                </div>
                <p className="text-gray-700 mb-4">
                  Market showing consolidation patterns. Bitcoin dominance increasing while altcoins face pressure. Consider DCA strategy during current correction phase.
                </p>
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <span className="material-symbols-outlined text-orange-600 mr-1">trending_flat</span>
                      <p className="text-sm">Bitcoin (BTC)</p>
                    </div>
                    <p className="text-sm font-medium text-orange-600">Hold</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <span className="material-symbols-outlined text-red-600 mr-1">trending_down</span>
                      <p className="text-sm">Altcoins</p>
                    </div>
                    <p className="text-sm font-medium text-red-600">-5%</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <span className="material-symbols-outlined text-green-600 mr-1">schedule</span>
                      <p className="text-sm">DCA Strategy</p>
                    </div>
                    <p className="text-sm font-medium text-green-600">Active</p>
                  </div>
                </div>
                <button className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-lg transition-colors">
                  Apply Recommendations
                </button>
              </div>
            </div>

            {/* Risk Assessment - Crypto Portfolio */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold">Risk Assessment</h3>
              </div>
              <div className="p-6">
                <div className="mb-6">
                  <p className="text-sm text-gray-500 mb-1">Current Risk Level</p>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div className="bg-red-600 h-4 rounded-full" style={{width: '92%'}}></div>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-gray-500">Low Risk</span>
                    <span className="text-xs text-gray-500">High Risk</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center mb-2">
                      <span className="material-symbols-outlined text-red-600 mr-2">warning</span>
                      <p className="font-medium">Extreme Volatility</p>
                    </div>
                    <p className="text-sm text-gray-700">
                      Cryptocurrency markets can experience swings of 20-50% in single day trading sessions.
                    </p>
                  </div>
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center mb-2">
                      <span className="material-symbols-outlined text-orange-600 mr-2">gavel</span>
                      <p className="font-medium">Regulatory Risk</p>
                    </div>
                    <p className="text-sm text-gray-700">
                      Government regulations and policy changes can significantly impact cryptocurrency valuations.
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center mb-2">
                      <span className="material-symbols-outlined text-yellow-600 mr-2">schedule</span>
                      <p className="font-medium">Market Cycles</p>
                    </div>
                    <p className="text-sm text-gray-700">
                      Crypto markets follow 4-year cycles. Currently in consolidation phase after recent bull run.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Comparison - Crypto Portfolio */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold">Performance Comparison</h3>
              </div>
              <div className="p-6">
                <div className="h-[200px] w-full relative mb-4">
                  <Chart
                    options={{
                      chart: {
                        type: 'line',
                        width: '100%',
                        height: 200,
                        toolbar: { show: false },
                        zoom: { enabled: false }
                      },
                      dataLabels: { enabled: false },
                      stroke: { curve: 'smooth', width: 2 },
                      colors: ['#f97316', '#64748b', '#10b981'],
                      xaxis: {
                        categories: ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
                        labels: { style: { colors: '#64748b' } }
                      },
                      yaxis: {
                        labels: { style: { colors: '#64748b' } },
                        title: { text: 'Normalized Return (%)' }
                      },
                      legend: { position: 'top' },
                      tooltip: { y: {} }
                    }}
                    series={[
                      { name: 'Your Portfolio', data: [100, 138, 186, 245, 200, 285, 402, 286] },
                      { name: 'S&P 500', data: [100, 105, 110, 108, 112, 118, 125, 130] },
                      { name: 'Gold', data: [100, 102, 98, 101, 104, 107, 105, 108] }
                    ]}
                    type="line"
                    height={200}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-50 rounded-lg hover:shadow-md transition-shadow">
                    <p className="text-sm text-gray-500">vs. S&P 500</p>
                    <p className="text-xl font-bold text-green-600">+156.0%</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg hover:shadow-md transition-shadow">
                    <p className="text-sm text-gray-500">vs. Gold</p>
                    <p className="text-xl font-bold text-green-600">+178.0%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="text-center mt-8">
          <a 
            href="/portfolios"
            className="inline-block bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg mr-4"
          >
            ← Portföy Çeşitleri
          </a>
          <a 
            href="/"
            className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-6 rounded-lg"
          >
            Ana Sayfa
          </a>
        </div>
      </main>
    </div>
  )
}

// Turkish Stars Portfolio Detail Component - Turkish market leaders
function TurkishStarsPortfolioDetail() {
  const [portfolio] = useState({
    name: 'Turkish Stars Portfolio',
    riskLevel: 'Medium-High Risk',
    currentValue: 118650.75,
    todayChange: 1385.20,
    todayChangePercent: 1.18,
    totalReturn: 34.7,
    annualReturn: 22.1,
    riskScore: 7.3,
    holdings: [
      {
        symbol: 'ASELS',
        name: 'Aselsan Elektronik',
        allocation: 25,
        value: 29662.69,
        return: 42.8,
        dayChange: 2.1,
        icon: 'security',
        color: 'red'
      },
      {
        symbol: 'SISE',
        name: 'Şişe Cam',
        allocation: 20,
        value: 23730.15,
        return: 28.4,
        dayChange: 0.8,
        icon: 'home_repair_service',
        color: 'blue'
      },
      {
        symbol: 'THYAO',
        name: 'Türk Hava Yolları',
        allocation: 18,
        value: 21357.14,
        return: 35.2,
        dayChange: 1.5,
        icon: 'flight',
        color: 'red'
      },
      {
        symbol: 'BIMAS',
        name: 'BİM Birleşik Mağazalar',
        allocation: 17,
        value: 20170.63,
        return: 26.7,
        dayChange: 0.4,
        icon: 'store',
        color: 'green'
      },
      {
        symbol: 'KOZAL',
        name: 'Koza Altın İşletmeleri',
        allocation: 20,
        value: 23730.15,
        return: 45.3,
        dayChange: 1.2,
        icon: 'paid',
        color: 'yellow'
      }
    ]
  })

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <span className="material-symbols-outlined text-primary-600 text-2xl mr-2">analytics</span>
            <h1 className="text-xl font-bold text-gray-900">AI Portfolio Manager</h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="flex items-center text-gray-600 hover:text-primary-600 transition-colors">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button className="flex items-center text-gray-600 hover:text-primary-600 transition-colors">
              <span className="material-symbols-outlined">settings</span>
            </button>
            <div className="flex items-center">
              <img
                src="https://randomuser.me/api/portraits/men/25.jpg"
                alt="Profile"
                className="h-8 w-8 rounded-full object-cover"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Main Content */}
          <div className="w-full md:w-2/3">
            {/* Portfolio Overview */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
              <div className="bg-red-600 px-6 py-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <span className="text-white text-2xl mr-2">🇹🇷</span>
                    <h2 className="text-white text-xl font-semibold">Turkish Stars Portfolio</h2>
                  </div>
                  <span className="bg-white text-red-600 px-3 py-1 rounded-full text-sm font-medium">
                    Medium-High Risk
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <p className="text-sm text-gray-500">Current Value</p>
                    <p className="text-3xl font-bold">$118,650.75</p>
                    <div className="flex items-center mt-1">
                      <span className="text-green-600 flex items-center text-sm">
                        <span className="material-symbols-outlined text-sm">trending_up</span>
                        +1.18%
                      </span>
                      <span className="text-gray-500 text-sm ml-2">Today</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="bg-primary-50 hover:bg-primary-100 text-primary-600 px-4 py-2 rounded-lg transition-colors flex items-center">
                      <span className="material-symbols-outlined mr-1">add</span> Deposit
                    </button>
                    <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors flex items-center">
                      <span className="material-symbols-outlined mr-1">edit</span> Edit
                    </button>
                  </div>
                </div>
                
                {/* Turkish Portfolio Performance Chart */}
                <div className="h-[300px] w-full relative mb-6">
                  <Chart
                    options={{
                      chart: {
                        type: 'area',
                        width: '100%',
                        height: 300,
                        toolbar: { show: false },
                        zoom: { enabled: false }
                      },
                      dataLabels: { enabled: false },
                      stroke: { curve: 'smooth', width: 2 },
                      colors: ['#dc2626'], // Red theme for Turkey
                      fill: {
                        type: 'gradient',
                        gradient: {
                          shadeIntensity: 1,
                          opacityFrom: 0.7,
                          opacityTo: 0.2,
                          stops: [0, 90, 100]
                        }
                      },
                      xaxis: {
                        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
                        labels: { style: { colors: '#64748b' } }
                      },
                      yaxis: {
                        labels: { style: { colors: '#64748b' } }
                      },
                      tooltip: { y: {} }
                    }}
                    series={[{
                      name: 'Portfolio Value',
                      data: [88100, 96850, 91420, 99650, 108340, 111930, 106160, 115130, 117650, 118650]
                    }]}
                    type="area"
                    height={300}
                  />
                </div>

                {/* Performance Stats - Turkish Portfolio */}
                <div className="flex flex-wrap -mx-2">
                  <div className="w-1/3 px-2">
                    <div className="p-4 bg-gray-50 rounded-lg hover:shadow-md transition-shadow">
                      <p className="text-sm text-gray-500">Total Return</p>
                      <p className="text-2xl font-bold text-green-600">+34.7%</p>
                      <p className="text-xs text-gray-500">Since inception</p>
                    </div>
                  </div>
                  <div className="w-1/3 px-2">
                    <div className="p-4 bg-gray-50 rounded-lg hover:shadow-md transition-shadow">
                      <p className="text-sm text-gray-500">Annual Return</p>
                      <p className="text-2xl font-bold">22.1%</p>
                      <p className="text-xs text-gray-500">Last 12 months</p>
                    </div>
                  </div>
                  <div className="w-1/3 px-2">
                    <div className="p-4 bg-gray-50 rounded-lg hover:shadow-md transition-shadow">
                      <p className="text-sm text-gray-500">Risk Score</p>
                      <p className="text-2xl font-bold">
                        7.3<span className="text-sm font-normal">/10</span>
                      </p>
                      <p className="text-xs text-gray-500">Medium-high risk</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Holdings Table - Turkish Portfolio */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold">Holdings</h3>
              </div>
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-gray-500 text-sm">
                        <th className="pb-3 font-medium">Asset</th>
                        <th className="pb-3 font-medium">Allocation</th>
                        <th className="pb-3 font-medium">Value</th>
                        <th className="pb-3 font-medium">Return</th>
                        <th className="pb-3 font-medium">24h Change</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {portfolio.holdings.map((holding, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3">
                            <div className="flex items-center">
                              <div className={`h-8 w-8 bg-${holding.color}-100 text-${holding.color}-600 rounded-full flex items-center justify-center mr-3`}>
                                <span className="material-symbols-outlined text-sm">{holding.icon}</span>
                              </div>
                              <div>
                                <p className="font-medium">{holding.symbol}</p>
                                <p className="text-sm text-gray-500">{holding.name}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`bg-${holding.color}-500 h-2 rounded-full`}
                                style={{ width: `${holding.allocation}%` }}
                              />
                            </div>
                            <p className="text-sm mt-1">{holding.allocation}%</p>
                          </td>
                          <td className="py-3">${holding.value.toLocaleString()}</td>
                          <td className={`py-3 ${holding.return >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {holding.return >= 0 ? '+' : ''}{holding.return}%
                          </td>
                          <td className={`py-3 ${holding.dayChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {holding.dayChange >= 0 ? '+' : ''}{holding.dayChange}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Turkish specific */}
          <div className="w-full md:w-1/3">
            {/* AI Strategy Insights for Turkish */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold">AI Strategy Insights</h3>
              </div>
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <span className="material-symbols-outlined text-primary-600 text-xl mr-2">psychology</span>
                  <p className="text-sm text-gray-500">AI Recommendation</p>
                </div>
                <p className="text-gray-700 mb-4">
                  Turkish market showing resilience with strong domestic consumption. Defense sector leading gains while tourism recovery continues. Monitor inflation data closely.
                </p>
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <span className="material-symbols-outlined text-green-600 mr-1">trending_up</span>
                      <p className="text-sm">Defense Sector</p>
                    </div>
                    <p className="text-sm font-medium text-green-600">+4%</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <span className="material-symbols-outlined text-green-600 mr-1">trending_up</span>
                      <p className="text-sm">Tourism Stocks</p>
                    </div>
                    <p className="text-sm font-medium text-green-600">+2%</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <span className="material-symbols-outlined text-orange-600 mr-1">warning</span>
                      <p className="text-sm">Banking Sector</p>
                    </div>
                    <p className="text-sm font-medium text-orange-600">Watch</p>
                  </div>
                </div>
                <button className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-lg transition-colors">
                  Apply Recommendations
                </button>
              </div>
            </div>

            {/* Risk Assessment - Turkish Portfolio */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold">Risk Assessment</h3>
              </div>
              <div className="p-6">
                <div className="mb-6">
                  <p className="text-sm text-gray-500 mb-1">Current Risk Level</p>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div className="bg-orange-600 h-4 rounded-full" style={{width: '73%'}}></div>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-gray-500">Low Risk</span>
                    <span className="text-xs text-gray-500">High Risk</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center mb-2">
                      <span className="material-symbols-outlined text-blue-600 mr-2">public</span>
                      <p className="font-medium">Local Market Focus</p>
                    </div>
                    <p className="text-sm text-gray-700">
                      Portfolio concentrated in Turkish market with strong domestic consumption exposure.
                    </p>
                  </div>
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center mb-2">
                      <span className="material-symbols-outlined text-orange-600 mr-2">currency_exchange</span>
                      <p className="font-medium">Currency Risk</p>
                    </div>
                    <p className="text-sm text-gray-700">
                      Turkish Lira volatility may impact returns for foreign investors.
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center mb-2">
                      <span className="material-symbols-outlined text-green-600 mr-2">trending_up</span>
                      <p className="font-medium">Growth Potential</p>
                    </div>
                    <p className="text-sm text-gray-700">
                      Emerging market dynamics with strong growth potential in key sectors.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Comparison - Turkish Portfolio */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold">Performance Comparison</h3>
              </div>
              <div className="p-6">
                <div className="h-[200px] w-full relative mb-4">
                  <Chart
                    options={{
                      chart: {
                        type: 'line',
                        width: '100%',
                        height: 200,
                        toolbar: { show: false },
                        zoom: { enabled: false }
                      },
                      dataLabels: { enabled: false },
                      stroke: { curve: 'smooth', width: 2 },
                      colors: ['#dc2626', '#64748b', '#10b981'],
                      xaxis: {
                        categories: ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
                        labels: { style: { colors: '#64748b' } }
                      },
                      yaxis: {
                        labels: { style: { colors: '#64748b' } },
                        title: { text: 'Normalized Return (%)' }
                      },
                      legend: { position: 'top' },
                      tooltip: { y: {} }
                    }}
                    series={[
                      { name: 'Your Portfolio', data: [100, 110, 104, 113, 123, 127, 121, 135] },
                      { name: 'BIST 100', data: [100, 108, 102, 111, 118, 122, 115, 128] },
                      { name: 'Emerging Markets', data: [100, 105, 108, 106, 112, 116, 118, 122] }
                    ]}
                    type="line"
                    height={200}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-50 rounded-lg hover:shadow-md transition-shadow">
                    <p className="text-sm text-gray-500">vs. BIST 100</p>
                    <p className="text-xl font-bold text-green-600">+7.0%</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg hover:shadow-md transition-shadow">
                    <p className="text-sm text-gray-500">vs. EM Index</p>
                    <p className="text-xl font-bold text-green-600">+13.0%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="text-center mt-8">
          <a 
            href="/portfolios"
            className="inline-block bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg mr-4"
          >
            ← Portföy Çeşitleri
          </a>
          <a 
            href="/"
            className="inline-block bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg"
          >
            Ana Sayfa
          </a>
        </div>
      </main>
    </div>
  )
}

export default function PortfoliosPage() {
  const [showDetail, setShowDetail] = useState(false)
  const [selectedPortfolio, setSelectedPortfolio] = useState('')

  // URL'den portfolio type'ı al
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const portfolioType = urlParams.get('type')
    if (portfolioType === 'growth') {
      setShowDetail(true)
      setSelectedPortfolio('growth')
    } else if (portfolioType === 'value') {
      setShowDetail(true)
      setSelectedPortfolio('value')
    } else if (portfolioType === 'momentum') {
      setShowDetail(true)
      setSelectedPortfolio('momentum')
    } else if (portfolioType === 'crypto-blue-chips') {
      setShowDetail(true)
      setSelectedPortfolio('crypto-blue-chips')
    } else if (portfolioType === 'turkish-stars') {
      setShowDetail(true)
      setSelectedPortfolio('turkish-stars')
    }
  }, [])

  // Eğer growth detay sayfası görüntülenecekse
  if (showDetail && selectedPortfolio === 'growth') {
    return <GrowthPortfolioDetail />
  }

  // Eğer value detay sayfası görüntülenecekse
  if (showDetail && selectedPortfolio === 'value') {
    return <ValuePortfolioDetail />
  }

  // Eğer momentum detay sayfası görüntülenecekse
  if (showDetail && selectedPortfolio === 'momentum') {
    return <MomentumPortfolioDetail />
  }

  // Eğer crypto blue chips detay sayfası görüntülenecekse
  if (showDetail && selectedPortfolio === 'crypto-blue-chips') {
    return <CryptoBluechipsPortfolioDetail />
  }

  // Eğer turkish stars detay sayfası görüntülenecekse
  if (showDetail && selectedPortfolio === 'turkish-stars') {
    return <TurkishStarsPortfolioDetail />
  }

  const portfolioTypes = [
    {
      id: 'growth',
      name: 'Growth',
      description: 'Hızlı büyüyen teknoloji şirketleri',
      color: 'bg-green-500',
      icon: '📈',
      expectedReturn: '15-20%',
      risk: 'Yüksek'
    },
    {
      id: 'value',
      name: 'Value',
      description: 'Düşük değerlenen kaliteli şirketler',
      color: 'bg-blue-500',
      icon: '💎',
      expectedReturn: '8-12%',
      risk: 'Orta'
    },
    {
      id: 'momentum',
      name: 'Momentum',
      description: 'Trend takip eden hisseler',
      color: 'bg-purple-500',
      icon: '🚀',
      expectedReturn: '10-25%',
      risk: 'Yüksek'
    },
    {
      id: 'crypto-blue-chips',
      name: 'Crypto Blue Chips',
      description: 'Büyük kripto para birimleri',
      color: 'bg-orange-500',
      icon: '₿',
      expectedReturn: '20-50%',
      risk: 'Çok Yüksek'
    },
    {
      id: 'turkish-stars',
      name: 'Turkish Stars',
      description: 'Türkiye\'nin önde gelen şirketleri',
      color: 'bg-red-500',
      icon: '🇹🇷',
      expectedReturn: '12-18%',
      risk: 'Orta-Yüksek'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Portföy Çeşitleri
          </h1>
          <p className="text-gray-600 text-lg">
            Yatırım stratejinize uygun portföy tipini seçin
          </p>
        </div>

        {/* Portfolio Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolioTypes.map((portfolio) => (
            <div
              key={portfolio.id}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
            >
              {/* Header */}
              <div className={`${portfolio.color} p-6 text-white`}>
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold">{portfolio.name}</h3>
                  <span className="text-3xl">{portfolio.icon}</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-gray-600 mb-4">
                  {portfolio.description}
                </p>
                
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Beklenen Getiri:</span>
                    <span className="text-sm font-semibold text-green-600">
                      {portfolio.expectedReturn}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Risk Seviyesi:</span>
                    <span className="text-sm font-semibold text-orange-600">
                      {portfolio.risk}
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                <a 
                  href={`/portfolios?type=${portfolio.id}`}
                  className="block w-full bg-gray-800 hover:bg-gray-900 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 text-center"
                >
                  Detayları Gör
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation */}
        <div className="text-center mt-8">
          <a 
            href="/"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg"
          >
            ← Ana Sayfaya Dön
          </a>
        </div>
      </div>
    </div>
  )
}
