"""
S&P 500 Data Service - S&P 500 hisselerinin verilerini yönetir
"""
import requests
import pandas as pd
import logging
from typing import Dict, List, Optional
from datetime import datetime, timedelta
import time

logger = logging.getLogger(__name__)

class SP500DataService:
    def __init__(self):
        self.finnhub_api_key = "d2fubchr01qkv5netr4gd2fubchr01qkv5netr50"
        self.marketstack_api_key = "5f3b26ca09523be2641b22692f161758"
        self.finnhub_base_url = "https://finnhub.io/api/v1"
        self.marketstack_base_url = "http://api.marketstack.com/v1"
        
        # S&P 500 şirketlerini dinamik olarak API'den çekeceğiz
        self._sp500_cache = None
        self._marketstack_usage = 0  # Request sayacı
    
    def _fetch_sp500_symbols(self) -> List[str]:
        """S&P 500 şirket listesini Wikipedia'dan çeker"""
        try:
            # Wikipedia S&P 500 table
            url = "https://en.wikipedia.org/wiki/List_of_S%26P_500_companies"
            
            response = requests.get(url, timeout=15)
            
            if response.status_code == 200:
                # HTML content'i parse et
                import pandas as pd
                
                # pandas ile HTML tablosunu oku
                tables = pd.read_html(response.content)
                
                # İlk tablo S&P 500 companies
                if len(tables) > 0:
                    df = tables[0]
                    
                    # 'Symbol' sütununu al
                    if 'Symbol' in df.columns:
                        symbols = df['Symbol'].tolist()
                        symbols = [s.replace('.', '-') for s in symbols]  # Format düzeltme
                        logger.info(f"Fetched {len(symbols)} S&P 500 symbols from Wikipedia")
                        return symbols
            
            # Fallback to static list if scraping fails
            logger.warning("Failed to fetch S&P 500 from Wikipedia, using fallback list")
            return self._get_fallback_sp500_list()
            
        except Exception as e:
            logger.error(f"Error fetching S&P 500 symbols: {str(e)}")
            return self._get_fallback_sp500_list()
    
    def _get_fallback_sp500_list(self) -> List[str]:
        """Fallback S&P 500 listesi (en büyük 100 şirket)"""
        return [
            "AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "META", "TSLA", "BRK.B", "LLY", "V",
            "JPM", "UNH", "XOM", "MA", "PG", "JNJ", "HD", "ABBV", "MRK", "COST",
            "AVGO", "PEP", "KO", "WMT", "CRM", "BAC", "TMO", "CSCO", "ACN", "LIN",
            "MCD", "ABT", "ADBE", "DHR", "VZ", "NEE", "TXN", "QCOM", "PM", "AMD",
            "HON", "WFC", "UPS", "T", "SCHW", "SPGI", "GE", "LOW", "NKE", "INTU",
            "CAT", "CVX", "AXP", "BKNG", "NOW", "IBM", "ISRG", "GS", "RTX", "SYK",
            "PFE", "TJX", "AMGN", "PGR", "BSX", "BLK", "C", "VRTX", "TMUS", "SBUX",
            "DE", "MDT", "GILD", "ADI", "ADP", "LRCX", "CB", "SO", "AMT", "CVS",
            "PYPL", "REGN", "MDLZ", "DUK", "ZTS", "MMC", "BDX", "AMAT", "TGT", "CI",
            "CL", "KLAC", "APH", "SHW", "CMG", "MU", "ICE", "SNPS", "PLD", "NXPI"
        ]
        
    def get_sp500_list(self) -> List[Dict]:
        """S&P 500 hisse listesini döner"""
        # Cache kontrolü
        if self._sp500_cache is not None:
            return self._sp500_cache
            
        # S&P 500 sembollerini al
        symbols = self._fetch_sp500_symbols()
        
        companies = []
        total_symbols = len(symbols)
        
        for i, symbol in enumerate(symbols):
            try:
                logger.info(f"Processing {i+1}/{total_symbols}: {symbol}")
                
                # Company profile bilgilerini al
                profile = self._get_company_profile(symbol)
                if profile:
                    companies.append({
                        "symbol": symbol,
                        "name": profile.get("name", symbol),
                        "sector": profile.get("finnhubIndustry", "Unknown"),
                        "market_cap": profile.get("marketCapitalization", 0),
                        "country": profile.get("country", "US"),
                        "currency": profile.get("currency", "USD"),
                        "exchange": profile.get("exchange", "NASDAQ")
                    })
                else:
                    # Fallback - sadece symbol ile ekle
                    companies.append({
                        "symbol": symbol,
                        "name": symbol,
                        "sector": "Unknown",
                        "market_cap": 0,
                        "country": "US",
                        "currency": "USD",
                        "exchange": "NASDAQ"
                    })
                
                # Rate limiting - Finnhub free tier: 60 calls/minute
                if i < total_symbols - 1:  # Son çağrı için bekleme yok
                    time.sleep(1.2)  # 50 calls/minute = güvenli
                
            except Exception as e:
                logger.error(f"Error fetching profile for {symbol}: {str(e)}")
                # Fallback - sadece symbol ile ekle
                companies.append({
                    "symbol": symbol,
                    "name": symbol,
                    "sector": "Unknown",
                    "market_cap": 0,
                    "country": "US",
                    "currency": "USD",
                    "exchange": "NASDAQ"
                })
        
        # Cache'e kaydet
        self._sp500_cache = companies
        logger.info(f"S&P 500 list cached: {len(companies)} companies")
        
        return companies
    
    def get_stock_fundamentals(self, symbol: str) -> Optional[Dict]:
        """Hisse senedinin fundamental verilerini getirir"""
        try:
            # Basic financials endpoint
            url = f"{self.finnhub_base_url}/stock/metric"
            params = {
                "symbol": symbol,
                "metric": "all",
                "token": self.finnhub_api_key
            }
            
            response = requests.get(url, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                if 'metric' in data:
                    metrics = data['metric']
                    return {
                        "symbol": symbol,
                        "pe_ratio": metrics.get("peBasicExclExtraTTM"),
                        "pb_ratio": metrics.get("pbQuarterly"),
                        "ps_ratio": metrics.get("psQuarterly"),
                        "peg_ratio": metrics.get("pegRatioTTM"),
                        "roe": metrics.get("roeRfy"),
                        "roa": metrics.get("roaRfy"),
                        "debt_equity": metrics.get("totalDebt/totalEquityQuarterly"),
                        "current_ratio": metrics.get("currentRatioQuarterly"),
                        "gross_margin": metrics.get("grossMarginTTM"),
                        "operating_margin": metrics.get("operatingMarginTTM"),
                        "net_margin": metrics.get("netProfitMarginTTM"),
                        "revenue_growth": metrics.get("revenueGrowthTTMYoy"),
                        "earnings_growth": metrics.get("epsGrowthTTMYoy"),
                        "dividend_yield": metrics.get("dividendYieldIndicatedAnnual"),
                        "beta": metrics.get("beta"),
                        "52w_high": metrics.get("52WeekHigh"),
                        "52w_low": metrics.get("52WeekLow"),
                        "avg_volume": metrics.get("10DayAverageTradingVolume"),
                        "last_updated": datetime.now().isoformat()
                    }
            
            return None
            
        except Exception as e:
            logger.error(f"Error fetching fundamentals for {symbol}: {str(e)}")
            return None
    
    def get_historical_data(self, symbol: str, days: int = 252) -> Optional[pd.DataFrame]:
        """Belirli bir süre için tarihsel fiyat verilerini getirir"""
        try:
            # 1. Önce Marketstack dene (en güvenilir ama limitli)
            if self._marketstack_usage < 90:  # 10 request buffer bırak
                df = self._get_marketstack_historical(symbol, days)
                if df is not None and not df.empty:
                    self._marketstack_usage += 1
                    logger.info(f"Marketstack success for {symbol} (usage: {self._marketstack_usage}/100)")
                    return df
            
            # 2. Finnhub API dene
            df = self._get_finnhub_historical(symbol, days)
            if df is not None and not df.empty:
                return df
            
            # 3. Son çare yfinance
            logger.warning(f"APIs failed for {symbol}, trying yfinance...")
            df = self._get_yfinance_historical(symbol, days)
            if df is not None and not df.empty:
                return df
                
            logger.error(f"All APIs failed for {symbol}")
            return None
            
        except Exception as e:
            logger.error(f"Error fetching historical data for {symbol}: {str(e)}")
            return None
    
    def _get_marketstack_historical(self, symbol: str, days: int) -> Optional[pd.DataFrame]:
        """Marketstack'den tarihsel veri çeker"""
        try:
            # Calculate date range
            end_date = datetime.now()
            start_date = end_date - timedelta(days=days)
            
            url = f"{self.marketstack_base_url}/eod"
            params = {
                "access_key": self.marketstack_api_key,
                "symbols": symbol,
                "date_from": start_date.strftime("%Y-%m-%d"),
                "date_to": end_date.strftime("%Y-%m-%d"),
                "limit": 1000  # Max limit
            }
            
            response = requests.get(url, params=params, timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                
                if "data" in data and len(data["data"]) > 0:
                    # Convert to DataFrame
                    df_data = []
                    for item in data["data"]:
                        df_data.append({
                            "date": item["date"],
                            "open": float(item["open"]),
                            "high": float(item["high"]),
                            "low": float(item["low"]),
                            "close": float(item["close"]),
                            "volume": int(item["volume"]) if item["volume"] else 0
                        })
                    
                    df = pd.DataFrame(df_data)
                    df["date"] = pd.to_datetime(df["date"])
                    df = df.set_index("date").sort_index()
                    
                    logger.info(f"Marketstack: {len(df)} days for {symbol}")
                    return df
            
            return None
            
        except Exception as e:
            logger.error(f"Marketstack error for {symbol}: {str(e)}")
            return None
    
    def _get_finnhub_historical(self, symbol: str, days: int) -> Optional[pd.DataFrame]:
        """Finnhub'dan tarihsel veri çeker"""
        try:
            # Calculate timestamps
            end_time = int(datetime.now().timestamp())
            start_time = int((datetime.now() - timedelta(days=days)).timestamp())
            
            url = f"{self.finnhub_base_url}/stock/candle"
            params = {
                "symbol": symbol,
                "resolution": "D",  # Daily
                "from": start_time,
                "to": end_time,
                "token": self.finnhub_api_key
            }
            
            response = requests.get(url, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                if data.get("s") == "ok" and "t" in data:
                    df = pd.DataFrame({
                        "open": data["o"],
                        "high": data["h"],
                        "low": data["l"],
                        "close": data["c"],
                        "volume": data["v"]
                    }, index=pd.to_datetime(data["t"], unit="s"))
                    
                    df.index.name = "date"
                    return df
            
            return None
            
        except Exception as e:
            logger.error(f"Finnhub historical error for {symbol}: {str(e)}")
            return None
    
    def _get_yfinance_historical(self, symbol: str, days: int) -> Optional[pd.DataFrame]:
        """yfinance'dan tarihsel veri çeker"""
        try:
            import yfinance as yf
            
            # Period mapping
            if days <= 5:
                period = "5d"
            elif days <= 30:
                period = "1mo"
            elif days <= 90:
                period = "3mo"
            elif days <= 180:
                period = "6mo"
            else:
                period = "1y"
            
            ticker = yf.Ticker(symbol)
            df = ticker.history(period=period)
            
            if not df.empty:
                # Standardize column names to lowercase
                df.columns = [col.lower() for col in df.columns]
                
                # Keep only OHLCV
                required_cols = ['open', 'high', 'low', 'close', 'volume']
                df = df[required_cols]
                
                return df
            
            return None
            
        except Exception as e:
            logger.error(f"yfinance error for {symbol}: {str(e)}")
            return None
    
    def _get_company_profile(self, symbol: str) -> Optional[Dict]:
        """Company profile bilgilerini getirir"""
        try:
            url = f"{self.finnhub_base_url}/stock/profile2"
            params = {
                "symbol": symbol,
                "token": self.finnhub_api_key
            }
            
            response = requests.get(url, params=params, timeout=10)
            
            if response.status_code == 200:
                return response.json()
            
            return None
            
        except Exception as e:
            logger.error(f"Error fetching company profile for {symbol}: {str(e)}")
            return None
    
    def calculate_technical_indicators(self, df: pd.DataFrame) -> pd.DataFrame:
        """Teknik analiz göstergelerini hesaplar"""
        if df is None or df.empty:
            return df
        
        # Simple Moving Averages
        df["sma_20"] = df["close"].rolling(window=20).mean()
        df["sma_50"] = df["close"].rolling(window=50).mean()
        df["sma_200"] = df["close"].rolling(window=200).mean()
        
        # Exponential Moving Averages
        df["ema_12"] = df["close"].ewm(span=12).mean()
        df["ema_26"] = df["close"].ewm(span=26).mean()
        
        # MACD
        df["macd"] = df["ema_12"] - df["ema_26"]
        df["macd_signal"] = df["macd"].ewm(span=9).mean()
        df["macd_histogram"] = df["macd"] - df["macd_signal"]
        
        # RSI
        delta = df["close"].diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
        rs = gain / loss
        df["rsi"] = 100 - (100 / (1 + rs))
        
        # Bollinger Bands
        df["bb_middle"] = df["close"].rolling(window=20).mean()
        bb_std = df["close"].rolling(window=20).std()
        df["bb_upper"] = df["bb_middle"] + (bb_std * 2)
        df["bb_lower"] = df["bb_middle"] - (bb_std * 2)
        
        # Volume indicators
        df["volume_sma"] = df["volume"].rolling(window=20).mean()
        df["volume_ratio"] = df["volume"] / df["volume_sma"]
        
        # Volatility
        df["returns"] = df["close"].pct_change()
        df["volatility_20"] = df["returns"].rolling(window=20).std() * (252 ** 0.5)  # Annualized
        
        return df

# Global instance
sp500_service = SP500DataService()
