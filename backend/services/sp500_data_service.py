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
        self.base_url = "https://finnhub.io/api/v1"
        
        # S&P 500 hisse listesi (en büyük 50 hisse ile başlayalım, daha sonra genişletiriz)
        self.sp500_symbols = [
            "AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "META", "TSLA", "BRK.B", "LLY", "V",
            "JPM", "UNH", "XOM", "MA", "PG", "JNJ", "HD", "ABBV", "MRK", "COST",
            "AVGO", "PEP", "KO", "WMT", "CRM", "BAC", "TMO", "CSCO", "ACN", "LIN",
            "MCD", "ABT", "ADBE", "DHR", "VZ", "NEE", "TXN", "QCOM", "PM", "AMD",
            "HON", "WFC", "UPS", "T", "SCHW", "SPGI", "GE", "LOW", "NKE", "INTU"
        ]
        
    def get_sp500_list(self) -> List[Dict]:
        """S&P 500 hisse listesini döner"""
        companies = []
        for symbol in self.sp500_symbols:
            try:
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
                
                # Rate limiting
                time.sleep(0.1)
                
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
        
        return companies
    
    def get_stock_fundamentals(self, symbol: str) -> Optional[Dict]:
        """Hisse senedinin fundamental verilerini getirir"""
        try:
            # Basic financials endpoint
            url = f"{self.base_url}/stock/metric"
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
            # Calculate timestamps
            end_time = int(datetime.now().timestamp())
            start_time = int((datetime.now() - timedelta(days=days)).timestamp())
            
            url = f"{self.base_url}/stock/candle"
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
                
                if data.get("s") == "ok":
                    df = pd.DataFrame({
                        "timestamp": data["t"],
                        "open": data["o"],
                        "high": data["h"],
                        "low": data["l"],
                        "close": data["c"],
                        "volume": data["v"]
                    })
                    
                    # Convert timestamp to datetime
                    df["date"] = pd.to_datetime(df["timestamp"], unit="s")
                    df.set_index("date", inplace=True)
                    df.drop("timestamp", axis=1, inplace=True)
                    
                    return df
            
            return None
            
        except Exception as e:
            logger.error(f"Error fetching historical data for {symbol}: {str(e)}")
            return None
    
    def _get_company_profile(self, symbol: str) -> Optional[Dict]:
        """Company profile bilgilerini getirir"""
        try:
            url = f"{self.base_url}/stock/profile2"
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
