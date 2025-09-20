#!/usr/bin/env python3
"""
S&P 500 Dashboard Service - Frontend için optimized data serving
"""
import json
import pandas as pd
from typing import Dict, List, Optional
from datetime import datetime
import os


class SP500DashboardService:
    def __init__(self):
        self.dataset_file = "sp500_complete_premium_dataset.json"
        self.dataset = None
        self.load_dataset()
    
    def load_dataset(self):
        """Load the S&P 500 dataset into memory"""
        if os.path.exists(self.dataset_file):
            print(f"📊 Loading {self.dataset_file}...")
            with open(self.dataset_file, 'r') as f:
                self.dataset = json.load(f)
            print(f"✅ Loaded {len(self.dataset['companies'])} companies")
        else:
            print(f"❌ Dataset file not found: {self.dataset_file}")
            self.dataset = None
    
    def get_companies_overview(self) -> Dict:
        """Get overview of all S&P 500 companies"""
        if not self.dataset:
            return {"error": "Dataset not available"}
        
        companies = []
        
        for symbol, data in self.dataset['companies'].items():
            try:
                # Get company profile
                profile = data['fundamentals'].get('company_profile', [])
                profile_data = profile[0] if profile else {}
                
                # Get latest ratios
                ratios = data['fundamentals'].get('ratios', [])
                latest_ratios = ratios[0] if ratios else {}
                
                # Get latest prices
                prices = data.get('prices', [])
                latest_price = prices[0] if prices else {}
                
                company_info = {
                    'symbol': symbol,
                    'company_name': profile_data.get('companyName', symbol),
                    'sector': profile_data.get('sector', 'Unknown'),
                    'industry': profile_data.get('industry', 'Unknown'),
                    'market_cap': profile_data.get('mktCap', 0),
                    'current_price': latest_price.get('close', 0),
                    'pe_ratio': latest_ratios.get('priceEarningsRatio'),
                    'roe': latest_ratios.get('returnOnEquity'),
                    'pb_ratio': latest_ratios.get('priceToBookRatio'),
                    'debt_equity': latest_ratios.get('debtEquityRatio'),
                    'dividend_yield': latest_ratios.get('dividendYield'),
                    'data_quality': data.get('data_quality', 'complete')
                }
                companies.append(company_info)
                
            except Exception as e:
                print(f"Error processing {symbol}: {str(e)}")
                continue
        
        # Sort by market cap
        companies.sort(key=lambda x: x.get('market_cap', 0), reverse=True)
        
        return {
            'total_companies': len(companies),
            'collection_date': self.dataset['metadata']['collection_date'],
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
