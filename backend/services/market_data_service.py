"""
Market Data Service - Multi-source market data with Finnhub primary
"""
import yfinance as yf
import pandas as pd
import requests
from typing import List, Dict, Optional
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

class MarketDataService:
    """Yahoo Finance API'den gerçek piyasa verilerini çeken servis"""
    
    def __init__(self):
        self.cache = {}
        self.cache_duration = 300  # 5 dakika cache
        
        # Fallback mock data for when Yahoo Finance is rate limited
        self.mock_prices = {
            'AAPL': {'price': 175.25, 'change': 2.15, 'change_percent': 1.24},
            'MSFT': {'price': 342.80, 'change': -1.45, 'change_percent': -0.42},
            'AMZN': {'price': 142.65, 'change': 3.22, 'change_percent': 2.31},
            'GOOGL': {'price': 135.45, 'change': 0.88, 'change_percent': 0.65},
            'TSLA': {'price': 208.44, 'change': -5.67, 'change_percent': -2.65},
            'BRK-B': {'price': 325.12, 'change': 1.88, 'change_percent': 0.58},
            'JPM': {'price': 155.33, 'change': -0.77, 'change_percent': -0.49},
            'JNJ': {'price': 162.45, 'change': 0.55, 'change_percent': 0.34},
            'PG': {'price': 158.90, 'change': -0.32, 'change_percent': -0.20},
            'KO': {'price': 58.77, 'change': 0.41, 'change_percent': 0.70},
            'NVDA': {'price': 875.30, 'change': 12.45, 'change_percent': 1.44},
            'AMD': {'price': 142.88, 'change': -2.11, 'change_percent': -1.46},
            'ROKU': {'price': 85.22, 'change': 1.67, 'change_percent': 2.00},
            'SQ': {'price': 72.15, 'change': -0.88, 'change_percent': -1.20},
            'ZM': {'price': 92.33, 'change': 0.95, 'change_percent': 1.04},
            'COIN': {'price': 185.44, 'change': 8.22, 'change_percent': 4.63},
            'MSTR': {'price': 358.90, 'change': -12.45, 'change_percent': -3.35},
            'PYPL': {'price': 78.33, 'change': 1.23, 'change_percent': 1.60},
            # Turkish stocks (in USD equivalent)
            'THYAO.IS': {'price': 16.85, 'change': 0.45, 'change_percent': 2.74},
            'BIMAS.IS': {'price': 27.12, 'change': -0.32, 'change_percent': -1.17},
            'ASELS.IS': {'price': 38.66, 'change': 1.22, 'change_percent': 3.26},
            'KCHOL.IS': {'price': 22.44, 'change': 0.18, 'change_percent': 0.81},
            'PETKM.IS': {'price': 13.77, 'change': -0.08, 'change_percent': -0.58}
        }
    
    def get_stock_data(self, symbol: str) -> Optional[Dict]:
        """Tek bir hisse senedi için güncel verileri getirir"""
        try:
            # Cache kontrolü
            cache_key = f"stock_{symbol}"
            if self._is_cached(cache_key):
                return self.cache[cache_key]['data']
            
            # Önce Yahoo Finance'den veri çekmeyi dene
            try:
                ticker = yf.Ticker(symbol)
                info = ticker.info
                hist = ticker.history(period="1d")
                
                if not hist.empty:
                    # Yahoo Finance'den başarılı veri alındı
                    current_price = float(hist['Close'].iloc[-1])
                    previous_close = float(info.get('previousClose', current_price))
                    
                    daily_change = current_price - previous_close
                    daily_change_percent = (daily_change / previous_close) * 100 if previous_close != 0 else 0
                    
                    stock_data = {
                        'symbol': symbol,
                        'name': info.get('longName', symbol),
                        'current_price': round(current_price, 2),
                        'previous_close': round(previous_close, 2),
                        'daily_change': round(daily_change, 2),
                        'daily_change_percent': round(daily_change_percent, 2),
                        'volume': info.get('volume', 0),
                        'market_cap': info.get('marketCap', 0),
                        'pe_ratio': info.get('trailingPE', 0),
                        'dividend_yield': info.get('dividendYield', 0),
                        'beta': info.get('beta', 1.0),
                        'sector': info.get('sector', 'Technology'),
                        'industry': info.get('industry', 'Software'),
                        'last_updated': datetime.now().isoformat(),
                        'data_source': 'yahoo_finance'
                    }
                    
                    # Cache'e kaydet
                    self.cache[cache_key] = {
                        'data': stock_data,
                        'timestamp': datetime.now()
                    }
                    
                    logger.info(f"Successfully fetched real data for {symbol}: ${current_price}")
                    return stock_data
            
            except Exception as yahoo_error:
                logger.warning(f"Yahoo Finance error for {symbol}: {str(yahoo_error)}")
            
            # Finnhub API'yi dene
            finnhub_data = self._get_finnhub_data(symbol)
            if finnhub_data:
                return finnhub_data
            
            # Yahoo Finance ve Finnhub başarısızsa mock data kullan
            if symbol in self.mock_prices:
                mock_data = self.mock_prices[symbol]
                
                # Symbol'e göre isim belirle
                stock_names = {
                    'AAPL': 'Apple Inc.',
                    'MSFT': 'Microsoft Corporation',
                    'AMZN': 'Amazon.com Inc.',
                    'GOOGL': 'Alphabet Inc.',
                    'TSLA': 'Tesla Inc.',
                    'BRK-B': 'Berkshire Hathaway Inc.',
                    'JPM': 'JPMorgan Chase & Co.',
                    'JNJ': 'Johnson & Johnson',
                    'PG': 'Procter & Gamble Co.',
                    'KO': 'The Coca-Cola Company',
                    'NVDA': 'NVIDIA Corporation',
                    'AMD': 'Advanced Micro Devices',
                    'ROKU': 'Roku Inc.',
                    'SQ': 'Block Inc.',
                    'ZM': 'Zoom Video Communications',
                    'COIN': 'Coinbase Global Inc.',
                    'MSTR': 'MicroStrategy Incorporated',
                    'PYPL': 'PayPal Holdings Inc.',
                    'THYAO.IS': 'Turkish Airlines',
                    'BIMAS.IS': 'BIM Birlesik Magazalar',
                    'ASELS.IS': 'Aselsan Elektronik',
                    'KCHOL.IS': 'Koc Holding',
                    'PETKM.IS': 'Petkim Petrokimya'
                }
                
                stock_data = {
                    'symbol': symbol,
                    'name': stock_names.get(symbol, symbol),
                    'current_price': mock_data['price'],
                    'previous_close': round(mock_data['price'] - mock_data['change'], 2),
                    'daily_change': mock_data['change'],
                    'daily_change_percent': mock_data['change_percent'],
                    'volume': 1500000,
                    'market_cap': mock_data['price'] * 1000000000,  # Örnek market cap
                    'pe_ratio': 25.5,
                    'dividend_yield': 0.02,
                    'beta': 1.2,
                    'sector': 'Technology' if not symbol.endswith('.IS') else 'Turkish Market',
                    'industry': 'Software' if not symbol.endswith('.IS') else 'Turkish Stocks',
                    'last_updated': datetime.now().isoformat(),
                    'data_source': 'mock_data'
                }
                
                # Cache'e kaydet
                self.cache[cache_key] = {
                    'data': stock_data,
                    'timestamp': datetime.now()
                }
                
                logger.info(f"Using mock data for {symbol}: ${mock_data['price']} (Yahoo Finance unavailable)")
                return stock_data
            
            logger.error(f"No data available for symbol: {symbol}")
            return None
            
        except Exception as e:
            logger.error(f"Error fetching data for {symbol}: {str(e)}")
            return None
    
    def get_multiple_stocks(self, symbols: List[str]) -> Dict[str, Dict]:
        """Birden fazla hisse senedi için verileri getirir"""
        results = {}
        
        for symbol in symbols:
            data = self.get_stock_data(symbol)
            if data:
                results[symbol] = data
        
        return results
    
    def get_historical_data(self, symbol: str, period: str = "1y") -> Optional[pd.DataFrame]:
        """Tarihsel fiyat verilerini getirir"""
        try:
            ticker = yf.Ticker(symbol)
            hist = ticker.history(period=period)
            
            if hist.empty:
                return None
            
            # DataFrame'i temizle ve hazırla
            hist.reset_index(inplace=True)
            hist['Date'] = hist['Date'].dt.strftime('%Y-%m-%d')
            
            return hist[['Date', 'Open', 'High', 'Low', 'Close', 'Volume']]
            
        except Exception as e:
            logger.error(f"Error fetching historical data for {symbol}: {str(e)}")
            return None
    
    def get_portfolio_performance(self, holdings: List[Dict]) -> Dict:
        """Portfolio performance hesaplar"""
        total_value = 0
        total_cost = 0
        portfolio_data = []
        
        for holding in holdings:
            symbol = holding['symbol']
            quantity = holding['quantity']
            avg_price = holding['avg_price']
            
            # Güncel fiyat bilgisini al
            stock_data = self.get_stock_data(symbol)
            
            if stock_data:
                current_price = stock_data['current_price']
                market_value = current_price * quantity
                cost_basis = avg_price * quantity
                
                total_value += market_value
                total_cost += cost_basis
                
                profit_loss = market_value - cost_basis
                profit_loss_percent = (profit_loss / cost_basis) * 100 if cost_basis != 0 else 0
                
                portfolio_data.append({
                    **stock_data,
                    'quantity': quantity,
                    'avg_price': avg_price,
                    'market_value': round(market_value, 2),
                    'cost_basis': round(cost_basis, 2),
                    'profit_loss': round(profit_loss, 2),
                    'profit_loss_percent': round(profit_loss_percent, 2),
                    'weight': 0  # Sonra hesaplanacak
                })
        
        # Portfolio ağırlıklarını hesapla
        for holding in portfolio_data:
            if total_value > 0:
                holding['weight'] = round((holding['market_value'] / total_value) * 100, 2)
        
        # Portfolio özeti
        total_profit_loss = total_value - total_cost
        total_profit_loss_percent = (total_profit_loss / total_cost) * 100 if total_cost != 0 else 0
        
        return {
            'holdings': portfolio_data,
            'summary': {
                'total_value': round(total_value, 2),
                'total_cost': round(total_cost, 2),
                'total_profit_loss': round(total_profit_loss, 2),
                'total_profit_loss_percent': round(total_profit_loss_percent, 2),
                'number_of_holdings': len(portfolio_data),
                'last_updated': datetime.now().isoformat()
            }
        }
    
    def _get_finnhub_data(self, symbol: str) -> Optional[Dict]:
        """Finnhub API'den gerçek zamanlı fiyat çeker"""
        try:
            # Gerçek Finnhub API token
            api_token = "d2fubchr01qkv5netr4gd2fubchr01qkv5netr50"
            url = f"https://finnhub.io/api/v1/quote?symbol={symbol}&token={api_token}"
            
            response = requests.get(url, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                current_price = data.get('c', 0)  # current price
                change = data.get('d', 0)         # change
                change_percent = data.get('dp', 0) # change percent
                previous_close = data.get('pc', current_price) # previous close
                
                if current_price > 0:
                    stock_data = {
                        'symbol': symbol,
                        'name': self._get_company_name(symbol),
                        'current_price': round(current_price, 2),
                        'previous_close': round(previous_close, 2),
                        'daily_change': round(change, 2),
                        'daily_change_percent': round(change_percent, 2),
                        'volume': 0,
                        'market_cap': 0,
                        'pe_ratio': 0,
                        'dividend_yield': 0,
                        'beta': 1.0,
                        'sector': 'Technology',
                        'industry': 'Software',
                        'last_updated': datetime.now().isoformat(),
                        'data_source': 'finnhub'
                    }
                    
                    # Cache'e kaydet
                    self.cache[f"stock_{symbol}"] = {
                        'data': stock_data,
                        'timestamp': datetime.now()
                    }
                    
                    logger.info(f"Successfully fetched Finnhub data for {symbol}: ${current_price}")
                    return stock_data
                    
        except Exception as e:
            logger.warning(f"Finnhub error for {symbol}: {str(e)}")
            
        return None
    
    def _get_company_name(self, symbol: str) -> str:
        """Symbol'den şirket ismini döner"""
        company_names = {
            'AAPL': 'Apple Inc.',
            'MSFT': 'Microsoft Corporation',
            'AMZN': 'Amazon.com Inc.',
            'GOOGL': 'Alphabet Inc.',
            'TSLA': 'Tesla Inc.',
            'BRK-B': 'Berkshire Hathaway Inc.',
            'JPM': 'JPMorgan Chase & Co.',
            'JNJ': 'Johnson & Johnson',
            'PG': 'Procter & Gamble Co.',
            'KO': 'The Coca-Cola Company',
            'NVDA': 'NVIDIA Corporation',
            'AMD': 'Advanced Micro Devices',
            'ROKU': 'Roku Inc.',
            'SQ': 'Block Inc.',
            'ZM': 'Zoom Video Communications',
            'COIN': 'Coinbase Global Inc.',
            'MSTR': 'MicroStrategy Incorporated',
            'PYPL': 'PayPal Holdings Inc.',
            'META': 'Meta Platforms Inc.',
            'NFLX': 'Netflix Inc.'
        }
        return company_names.get(symbol, symbol)

    def _is_cached(self, cache_key: str) -> bool:
        """Cache'in geçerli olup olmadığını kontrol eder"""
        if cache_key not in self.cache:
            return False
        
        cache_time = self.cache[cache_key]['timestamp']
        return (datetime.now() - cache_time).seconds < self.cache_duration

# Global instance
market_data_service = MarketDataService()
