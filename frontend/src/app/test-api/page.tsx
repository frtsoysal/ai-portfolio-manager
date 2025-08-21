'use client'

import { useState, useEffect } from 'react'
import { apiService, Portfolio } from '../../services/api'

export default function TestApiPage() {
  const [portfolios, setPortfolios] = useState<Array<any>>([])
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Portfolio listesini yükle
  useEffect(() => {
    const loadPortfolios = async () => {
      setLoading(true)
      try {
        const data = await apiService.getPortfolios()
        setPortfolios(data.portfolios)
        setError(null)
      } catch (err) {
        setError('Portfolio listesi yüklenirken hata oluştu')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadPortfolios()
  }, [])

  // Portfolio detayını yükle
  const loadPortfolioDetails = async (portfolioId: string) => {
    setLoading(true)
    try {
      const portfolio = await apiService.getPortfolioDetails(portfolioId)
      setSelectedPortfolio(portfolio)
      setError(null)
    } catch (err) {
      setError('Portfolio detayları yüklenirken hata oluştu')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const testConnection = async () => {
    setLoading(true)
    try {
      const result = await apiService.testConnection()
      alert(`Backend bağlantısı başarılı: ${result.message}`)
      setError(null)
    } catch (err) {
      setError('Backend bağlantısı başarısız')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const refreshPrices = async () => {
    if (!selectedPortfolio) return
    
    setLoading(true)
    try {
      // Portfolio'yu yeniden yükle (cache bypass için)
      const refreshedPortfolio = await apiService.getPortfolioDetails(selectedPortfolio.id)
      setSelectedPortfolio(refreshedPortfolio)
      setError(null)
      
      // Data source tipini kontrol et
      const hasYahooData = refreshedPortfolio.holdings.some(h => h.data_source === 'yahoo_finance')
      const hasFinnhubData = refreshedPortfolio.holdings.some(h => h.data_source === 'finnhub')
      const hasMockData = refreshedPortfolio.holdings.some(h => h.data_source === 'mock_data')
      
      const liveDataCount = refreshedPortfolio.holdings.filter(h => 
        h.data_source === 'yahoo_finance' || h.data_source === 'finnhub'
      ).length
      const totalCount = refreshedPortfolio.holdings.length
      
      if (liveDataCount === totalCount) {
        if (hasFinnhubData && hasYahooData) {
          alert('Fiyatlar güncellendi! Tüm veriler canlı olarak çekildi (Finnhub + Yahoo Finance).')
        } else if (hasFinnhubData) {
          alert('Fiyatlar güncellendi! Tüm veriler Finnhub\'dan canlı olarak çekildi.')
        } else {
          alert('Fiyatlar güncellendi! Tüm veriler Yahoo Finance\'den canlı olarak çekildi.')
        }
      } else if (liveDataCount > 0) {
        const sources = []
        if (hasFinnhubData) sources.push('Finnhub')
        if (hasYahooData) sources.push('Yahoo Finance')
        alert(`Fiyatlar güncellendi! ${liveDataCount}/${totalCount} canlı veri (${sources.join(', ')}) + mock data.`)
      } else {
        alert('Fiyatlar güncellendi! API rate limit nedeniyle mock data kullanılıyor.')
      }
    } catch (err) {
      setError('Fiyatlar güncellenirken hata oluştu')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">API Test Sayfası</h1>
          
          <div className="flex gap-4 mb-6">
            <button
              onClick={testConnection}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
            >
              {loading ? 'Test ediliyor...' : 'Backend Bağlantısını Test Et'}
            </button>
            
            <a
              href="/portfolios"
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
            >
              Portfolios Sayfası
            </a>
            
            <a
              href="/"
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
            >
              Ana Sayfa
            </a>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}
        </div>

        {/* Portfolio Listesi */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Portfolio Listesi</h2>
          {loading && <p className="text-gray-600">Yükleniyor...</p>}
          
          {portfolios.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {portfolios.map((portfolio) => (
                <div 
                  key={portfolio.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => loadPortfolioDetails(portfolio.id)}
                >
                  <h3 className="font-semibold text-lg">{portfolio.name}</h3>
                  <p className="text-gray-600 text-sm mb-2">{portfolio.description}</p>
                  <div className="flex justify-between items-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      portfolio.risk_level === 'High' ? 'bg-red-100 text-red-800' :
                      portfolio.risk_level === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      portfolio.risk_level === 'Very High' ? 'bg-purple-100 text-purple-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {portfolio.risk_level}
                    </span>
                    <span className="text-sm text-gray-500">
                      {portfolio.number_of_holdings} holdings
                    </span>
                  </div>
                  <div className="mt-2">
                    <span className="text-green-600 font-medium">
                      Target: {portfolio.target_return}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Seçilen Portfolio Detayları */}
        {selectedPortfolio && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedPortfolio.name} Detayları
              </h2>
              <button
                onClick={refreshPrices}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 flex items-center gap-2"
              >
                <span>🔄</span>
                {loading ? 'Güncelleniyor...' : 'Fiyatları Yenile'}
              </button>
            </div>
            
            {/* Portfolio Özeti */}
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <h3 className="font-semibold text-lg mb-2">Portfolio Özeti</h3>
              
              {/* Data Source Indicator */}
              {selectedPortfolio.holdings.length > 0 && (
                <div className="mb-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    (selectedPortfolio.holdings[0]?.data_source === 'yahoo_finance' || selectedPortfolio.holdings[0]?.data_source === 'finnhub')
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    📊 {
                      selectedPortfolio.holdings[0]?.data_source === 'finnhub' ? 'Canlı Veriler (Finnhub)' :
                      selectedPortfolio.holdings[0]?.data_source === 'yahoo_finance' ? 'Canlı Veriler (Yahoo Finance)' : 
                      'Demo Veriler (Mock Data)'
                    }
                  </span>
                </div>
              )}
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Toplam Değer</p>
                  <p className="font-bold text-lg">${selectedPortfolio.summary.total_value.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Toplam Kar/Zarar</p>
                  <p className={`font-bold text-lg ${selectedPortfolio.summary.total_profit_loss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${selectedPortfolio.summary.total_profit_loss.toLocaleString()} 
                    ({selectedPortfolio.summary.total_profit_loss_percent.toFixed(2)}%)
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Hisse Sayısı</p>
                  <p className="font-bold text-lg">{selectedPortfolio.summary.number_of_holdings}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Son Güncelleme</p>
                  <p className="text-sm">{new Date(selectedPortfolio.summary.last_updated).toLocaleString('tr-TR')}</p>
                </div>
              </div>
            </div>

            {/* Holdings Listesi */}
            <div>
              <h3 className="font-semibold text-lg mb-4">Holdings</h3>
              {selectedPortfolio.holdings.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-3">Symbol</th>
                        <th className="text-left p-3">Name</th>
                        <th className="text-right p-3">Current Price</th>
                        <th className="text-right p-3">Daily Change</th>
                        <th className="text-right p-3">Market Value</th>
                        <th className="text-right p-3">P&L</th>
                        <th className="text-center p-3">Data Source</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedPortfolio.holdings.map((holding, index) => (
                        <tr key={index} className="border-t">
                          <td className="p-3 font-medium">{holding.symbol}</td>
                          <td className="p-3">{holding.name}</td>
                          <td className="p-3 text-right font-semibold">${holding.current_price}</td>
                          <td className={`p-3 text-right ${holding.daily_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {holding.daily_change >= 0 ? '+' : ''}${holding.daily_change} ({holding.daily_change_percent}%)
                          </td>
                          <td className="p-3 text-right">${holding.market_value.toLocaleString()}</td>
                          <td className={`p-3 text-right ${holding.profit_loss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ${holding.profit_loss.toLocaleString()} ({holding.profit_loss_percent.toFixed(2)}%)
                          </td>
                          <td className="p-3 text-center">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              (holding.data_source === 'yahoo_finance' || holding.data_source === 'finnhub')
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {holding.data_source === 'finnhub' ? '🟢 Finnhub' :
                               holding.data_source === 'yahoo_finance' ? '🟢 Yahoo' : 
                               '🟡 Mock'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-600 text-center py-8">
                  Holdings verisi yüklenemedi. Yahoo Finance API'den veri çekiliyor...
                </p>
              )}
            </div>

            {/* Analytics */}
            {selectedPortfolio.analytics && Object.keys(selectedPortfolio.analytics).length > 0 && (
              <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">Analytics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Portfolio Beta</p>
                    <p className="font-bold">{selectedPortfolio.analytics.portfolio_beta}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Sharpe Ratio</p>
                    <p className="font-bold">{selectedPortfolio.analytics.sharpe_ratio}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Diversification Score</p>
                    <p className="font-bold">{selectedPortfolio.analytics.diversification_score}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Risk Score</p>
                    <p className="font-bold">{selectedPortfolio.analytics.risk_score}/10</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
