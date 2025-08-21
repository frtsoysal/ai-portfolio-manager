#!/usr/bin/env python3
"""
S&P 500 Dashboard Service - Frontend için optimized data serving with FMP API
"""
import json
import requests
from typing import Dict, List, Optional
from datetime import datetime
import os


class SP500DashboardService:
    def __init__(self):
        # FMP API configuration
        self.fmp_api_key = os.getenv('FMP_API_KEY', 'demo')  # Use demo if no key
        self.fmp_base_url = "https://financialmodelingprep.com/api/v3"
        
        # S&P 500 symbols (top 50 for performance)
        self.sp500_symbols = [
            'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'BRK.B', 'UNH', 'JNJ',
            'JPM', 'V', 'PG', 'XOM', 'HD', 'CVX', 'MA', 'BAC', 'ABBV', 'PFE',
            'AVGO', 'KO', 'LLY', 'TMO', 'COST', 'MRK', 'WMT', 'ACN', 'NFLX', 'DHR',
            'VZ', 'ABT', 'ADBE', 'CRM', 'NKE', 'TXN', 'RTX', 'QCOM', 'NEE', 'PM',
            'ORCL', 'DIS', 'T', 'LOW', 'UPS', 'IBM', 'AMGN', 'HON', 'SPGI', 'GS'
        ]
        
        print(f"📊 FMP Dashboard Service initialized with {len(self.sp500_symbols)} symbols")
    
    def _make_fmp_request(self, endpoint: str, params: Dict = None) -> Optional[Dict]:
        """Make request to FMP API"""
        try:
            url = f"{self.fmp_base_url}/{endpoint}"
            params = params or {}
            params['apikey'] = self.fmp_api_key
            
            response = requests.get(url, params=params, timeout=10)
            
            if response.status_code == 200:
                return response.json()
            else:
                print(f"❌ FMP API error: {response.status_code}")
                return None
                
        except Exception as e:
            print(f"❌ FMP request failed: {e}")
            return None
    
    def get_companies_overview(self) -> Dict:
        """Get overview of all S&P 500 companies using FMP API"""
        companies = []
        
        # Get batch data for all symbols
        symbols_str = ','.join(self.sp500_symbols)
        
        # Get company profiles
        profiles = self._make_fmp_request(f"profile/{symbols_str}")
        if not profiles:
            return {"error": "Failed to fetch company profiles"}
        
        # Get current quotes
        quotes = self._make_fmp_request(f"quote/{symbols_str}")
        if not quotes:
            quotes = []
        
        # Get key metrics (ratios)
        metrics = self._make_fmp_request(f"key-metrics/{symbols_str}")
        if not metrics:
            metrics = []
        
        # Create lookup dictionaries
        quotes_dict = {q.get('symbol'): q for q in quotes} if quotes else {}
        metrics_dict = {m.get('symbol'): m for m in metrics} if metrics else {}
        
        for profile in profiles:
            try:
                symbol = profile.get('symbol')
                if not symbol:
                    continue
                
                # Get corresponding quote and metrics
                quote = quotes_dict.get(symbol, {})
                metric = metrics_dict.get(symbol, {})
                
                company_info = {
                    'symbol': symbol,
                    'company_name': profile.get('companyName', symbol),
                    'sector': profile.get('sector', 'Unknown'),
                    'industry': profile.get('industry', 'Unknown'),
                    'market_cap': profile.get('mktCap', 0),
                    'current_price': quote.get('price', 0),
                    'day_change_percent': quote.get('changesPercentage', 0),
                    'pe_ratio': metric.get('peRatio'),
                    'pb_ratio': metric.get('pbRatio'),
                    'ps_ratio': metric.get('psRatio'),
                    'roe': metric.get('roe'),
                    'roa': metric.get('roa'),
                    'debt_equity': metric.get('debtToEquity'),
                    'dividend_yield': metric.get('dividendYield'),
                    'beta': profile.get('beta'),
                    'week52_high': quote.get('yearHigh'),
                    'week52_low': quote.get('yearLow'),
                    'avg_volume': quote.get('avgVolume'),
                    'enterprise_value': metric.get('enterpriseValue'),
                    'ebitda': metric.get('ebitda'),
                    'revenue_growth_ttm': metric.get('revenueGrowthTTM'),
                    'net_margin': metric.get('netIncomeMargin'),
                    'data_quality': 'live'
                }
                companies.append(company_info)
                
            except Exception as e:
                print(f"Error processing {symbol}: {str(e)}")
                continue
        
        # Sort by market cap
        companies.sort(key=lambda x: x.get('market_cap', 0), reverse=True)
        
        return {
            'total_companies': len(companies),
            'collection_date': datetime.now().isoformat(),
            'companies': companies
        }
    
    def get_company_details(self, symbol: str) -> Dict:
        """Get detailed information for a specific company"""
        if not self.dataset or symbol not in self.dataset['companies']:
            return {"error": f"Company {symbol} not found"}
        
        data = self.dataset['companies'][symbol]
        fundamentals = data['fundamentals']
        
        # Company profile
        profile = fundamentals.get('company_profile', [])
        profile_data = profile[0] if profile else {}
        
        # Financial ratios (last 5 years quarterly)
        ratios = fundamentals.get('ratios', [])
        
        # Key metrics
        key_metrics = fundamentals.get('key_metrics', [])
        
        # Income statements
        income_statements = fundamentals.get('income_statements', [])
        
        # Price history
        prices = data.get('prices', [])
        
        return {
            'symbol': symbol,
            'profile': profile_data,
            'ratios_history': ratios[:20],  # Last 5 years
            'key_metrics_history': key_metrics[:20],
            'income_history': income_statements[:20],
            'price_history': prices[:252],  # Last year daily
            'data_quality': data.get('data_quality'),
            'last_updated': fundamentals.get('collected_at')
        }
    
    def get_sector_analysis(self) -> Dict:
        """Analyze companies by sector"""
        if not self.dataset:
            return {"error": "Dataset not available"}
        
        sectors = {}
        
        for symbol, data in self.dataset['companies'].items():
            try:
                profile = data['fundamentals'].get('company_profile', [])
                if not profile:
                    continue
                    
                sector = profile[0].get('sector', 'Unknown')
                
                if sector not in sectors:
                    sectors[sector] = {
                        'companies': [],
                        'total_market_cap': 0,
                        'avg_pe': [],
                        'avg_roe': []
                    }
                
                # Get latest ratios
                ratios = data['fundamentals'].get('ratios', [])
                latest_ratios = ratios[0] if ratios else {}
                
                market_cap = profile[0].get('mktCap', 0)
                pe_ratio = latest_ratios.get('priceEarningsRatio')
                roe = latest_ratios.get('returnOnEquity')
                
                sectors[sector]['companies'].append(symbol)
                sectors[sector]['total_market_cap'] += market_cap
                
                if pe_ratio and 0 < pe_ratio < 100:  # Reasonable P/E range
                    sectors[sector]['avg_pe'].append(pe_ratio)
                
                if roe and roe > 0:
                    sectors[sector]['avg_roe'].append(roe)
                    
            except Exception as e:
                continue
        
        # Calculate averages
        for sector in sectors.values():
            sector['company_count'] = len(sector['companies'])
            sector['avg_pe_ratio'] = sum(sector['avg_pe']) / len(sector['avg_pe']) if sector['avg_pe'] else None
            sector['avg_roe'] = sum(sector['avg_roe']) / len(sector['avg_roe']) if sector['avg_roe'] else None
            # Remove raw lists to save space
            del sector['avg_pe'], sector['avg_roe']
        
        return sectors
    
    def get_top_performers(self, metric: str = 'market_cap', limit: int = 20) -> List[Dict]:
        """Get top performing companies by various metrics"""
        if not self.dataset:
            return []
        
        companies = []
        
        for symbol, data in self.dataset['companies'].items():
            try:
                profile = data['fundamentals'].get('company_profile', [])
                ratios = data['fundamentals'].get('ratios', [])
                
                if not profile or not ratios:
                    continue
                
                profile_data = profile[0]
                latest_ratios = ratios[0]
                
                company = {
                    'symbol': symbol,
                    'company_name': profile_data.get('companyName', symbol),
                    'sector': profile_data.get('sector'),
                    'market_cap': profile_data.get('mktCap', 0),
                    'pe_ratio': latest_ratios.get('priceEarningsRatio'),
                    'roe': latest_ratios.get('returnOnEquity'),
                    'pb_ratio': latest_ratios.get('priceToBookRatio'),
                    'debt_equity': latest_ratios.get('debtEquityRatio'),
                    'gross_margin': latest_ratios.get('grossProfitMargin'),
                    'net_margin': latest_ratios.get('netProfitMargin')
                }
                companies.append(company)
                
            except Exception as e:
                continue
        
        # Sort by requested metric
        if metric == 'market_cap':
            companies.sort(key=lambda x: x.get('market_cap', 0), reverse=True)
        elif metric == 'roe':
            companies = [c for c in companies if c.get('roe') and c['roe'] > 0]
            companies.sort(key=lambda x: x.get('roe', 0), reverse=True)
        elif metric == 'low_pe':
            companies = [c for c in companies if c.get('pe_ratio') and 0 < c['pe_ratio'] < 50]
            companies.sort(key=lambda x: x.get('pe_ratio', 999))
        elif metric == 'high_margin':
            companies = [c for c in companies if c.get('net_margin') and c['net_margin'] > 0]
            companies.sort(key=lambda x: x.get('net_margin', 0), reverse=True)
        
        return companies[:limit]
    
    def search_companies(self, query: str) -> List[Dict]:
        """Search companies by symbol or name"""
        if not self.dataset or not query:
            return []
        
        query = query.upper()
        results = []
        
        for symbol, data in self.dataset['companies'].items():
            try:
                profile = data['fundamentals'].get('company_profile', [])
                if not profile:
                    continue
                
                company_name = profile[0].get('companyName', '').upper()
                
                if query in symbol or query in company_name:
                    results.append({
                        'symbol': symbol,
                        'company_name': profile[0].get('companyName', symbol),
                        'sector': profile[0].get('sector'),
                        'market_cap': profile[0].get('mktCap', 0)
                    })
                    
            except Exception as e:
                continue
        
        return results[:10]  # Limit to 10 results


# Global instance
sp500_dashboard = SP500DashboardService()


def get_dashboard_service():
    return sp500_dashboard
