#!/usr/bin/env python3
"""
FMP Premium Data Service - Comprehensive S&P 500 data collection
"""
import requests
import json
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import time


class FMPDataService:
    def __init__(self):
        self.api_key = "N2s4mP85oHkr3DBawy2GrncqTTpakTBM"
        self.base_url = "https://financialmodelingprep.com/api/v3"
        
    def _make_request(self, endpoint: str, params: Dict = None) -> Optional[Dict]:
        """FMP API request with error handling and rate limiting"""
        try:
            if params is None:
                params = {}
            params['apikey'] = self.api_key
            
            url = f"{self.base_url}/{endpoint}"
            response = requests.get(url, params=params)
            
            if response.status_code == 200:
                return response.json()
            else:
                print(f"❌ FMP API Error {response.status_code}: {endpoint}")
                return None
                
        except Exception as e:
            print(f"❌ FMP Request Error: {str(e)}")
            return None
    
    def get_sp500_symbols(self) -> List[str]:
        """Get S&P 500 constituents from FMP or fallback list"""
        # Try FMP SP500 constituents endpoint
        data = self._make_request("sp500_constituent")
        
        if data:
            print(f"✅ Got {len(data)} S&P 500 symbols from FMP")
            return [item['symbol'] for item in data]
        
        # Fallback to our curated list
        print("📋 Using fallback S&P 500 symbol list")
        return [
            'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA', 'META', 'BRK.B', 'UNH', 'JNJ',
            'V', 'PG', 'JPM', 'HD', 'CVX', 'MA', 'PFE', 'ABBV', 'BAC', 'KO',
            'AVGO', 'PEP', 'COST', 'WMT', 'TMO', 'DIS', 'ABT', 'ACN', 'VZ', 'ADBE',
            'DHR', 'NEE', 'TXN', 'BMY', 'PM', 'NFLX', 'CRM', 'LIN', 'MDT',
            'HON', 'QCOM', 'UPS', 'T', 'LOW', 'AMD', 'INTU', 'IBM', 'AMGN', 'SPGI',
            'ORCL', 'NKE', 'PYPL', 'XOM', 'CAT', 'UNP', 'GS', 'MS', 'BA', 'NOW',
            'BLK', 'AXP', 'DE', 'LMT', 'RTX', 'SYK', 'PLD', 'TJX', 'SCHW', 'ADP',
            'MMM', 'CB', 'MU', 'C', 'FI', 'SO', 'BSX', 'MDLZ', 'GILD', 'AMT',
            'LRCX', 'ADI', 'TMUS', 'SHW', 'ZTS', 'MO', 'PNC', 'DUK', 'CSX', 'TFC',
            'FCX', 'USB', 'BMY', 'EOG', 'NSC', 'WM', 'ITW', 'PSA', 'MCO', 'COF'
        ]
    
    def get_company_fundamentals(self, symbol: str, years: int = 5) -> Dict:
        """Get comprehensive fundamentals for a company"""
        limit = years * 4  # Quarterly data
        
        fundamentals = {
            'symbol': symbol,
            'collected_at': datetime.now().isoformat(),
            'years': years
        }
        
        # Get all fundamental statements
        endpoints = {
            'income_statements': f"income-statement/{symbol}",
            'balance_sheets': f"balance-sheet-statement/{symbol}",
            'cash_flows': f"cash-flow-statement/{symbol}",
            'ratios': f"ratios/{symbol}",
            'key_metrics': f"key-metrics/{symbol}",
            'financial_growth': f"financial-growth/{symbol}",
            'company_profile': f"profile/{symbol}"
        }
        
        for key, endpoint in endpoints.items():
            if key == 'company_profile':
                fundamentals[key] = self._make_request(endpoint)
            else:
                fundamentals[key] = self._make_request(endpoint, {
                    'period': 'quarter',
                    'limit': limit
                })
            
            # Small delay between requests
            time.sleep(0.1)
        
        return fundamentals
    
    def get_historical_prices(self, symbol: str, years: int = 5) -> Optional[List[Dict]]:
        """Get historical daily prices"""
        start_date = (datetime.now() - timedelta(days=years*365)).strftime('%Y-%m-%d')
        end_date = datetime.now().strftime('%Y-%m-%d')
        
        data = self._make_request(f"historical-price-full/{symbol}", {
            'from': start_date,
            'to': end_date
        })
        
        if data and 'historical' in data:
            return data['historical']
        return None
    
    def collect_sp500_dataset(self, limit_companies: int = None, years: int = 5) -> Dict:
        """
        Collect comprehensive S&P 500 dataset
        limit_companies: None for all, or number to limit for testing
        """
        symbols = self.get_sp500_symbols()
        
        if limit_companies:
            symbols = symbols[:limit_companies]
            print(f"🔬 Testing with first {limit_companies} companies")
        
        print(f"🔄 Collecting {years}y dataset for {len(symbols)} companies...")
        print("=" * 60)
        
        dataset = {
            'metadata': {
                'collection_date': datetime.now().isoformat(),
                'years': years,
                'total_symbols': len(symbols),
                'fmp_plan': 'Premium ($70)',
                'api_key_prefix': f"{self.api_key[:8]}..."
            },
            'companies': {}
        }
        
        successful = 0
        failed = 0
        
        for i, symbol in enumerate(symbols, 1):
            print(f"📊 [{i:3d}/{len(symbols)}] {symbol:5s}", end=" ... ")
            
            try:
                # Get fundamentals
                fundamentals = self.get_company_fundamentals(symbol, years)
                
                # Get historical prices
                prices = self.get_historical_prices(symbol, years)
                
                # Check if we got meaningful data
                has_fundamentals = (
                    fundamentals.get('income_statements') and 
                    fundamentals.get('ratios') and
                    len(fundamentals.get('ratios', [])) > 0
                )
                has_prices = prices and len(prices) > 100  # At least 100 days
                
                if has_fundamentals and has_prices:
                    dataset['companies'][symbol] = {
                        'fundamentals': fundamentals,
                        'prices': prices,
                        'data_quality': 'complete'
                    }
                    successful += 1
                    print("✅")
                elif has_fundamentals or has_prices:
                    dataset['companies'][symbol] = {
                        'fundamentals': fundamentals if has_fundamentals else None,
                        'prices': prices if has_prices else None,
                        'data_quality': 'partial'
                    }
                    successful += 1
                    print("⚠️ partial")
                else:
                    failed += 1
                    print("❌ no data")
                
            except Exception as e:
                print(f"❌ Error: {str(e)[:30]}...")
                failed += 1
            
            # Rate limiting - be respectful
            time.sleep(0.2)
        
        # Update metadata
        dataset['metadata'].update({
            'successful': successful,
            'failed': failed,
            'success_rate': f"{(successful/(successful+failed)*100):.1f}%" if (successful+failed) > 0 else "0%"
        })
        
        print(f"\n🎯 COLLECTION SUMMARY:")
        print(f"✅ Successful: {successful}")
        print(f"❌ Failed: {failed}")
        print(f"📊 Success Rate: {dataset['metadata']['success_rate']}")
        print(f"💾 Total companies: {len(dataset['companies'])}")
        
        return dataset


def main():
    """Test data collection"""
    fmp = FMPDataService()
    
    print("🧪 FMP S&P 500 DATA COLLECTION TEST")
    print("=" * 50)
    
    # Test with 10 companies first
    dataset = fmp.collect_sp500_dataset(limit_companies=10, years=3)
    
    # Save dataset
    filename = f"sp500_fmp_dataset_{datetime.now().strftime('%Y%m%d_%H%M')}.json"
    
    with open(filename, 'w') as f:
        json.dump(dataset, f, indent=2)
    
    print(f"\n💾 Dataset saved: {filename}")
    print(f"📏 File size: {len(json.dumps(dataset))/1024/1024:.1f} MB")


if __name__ == "__main__":
    main()
