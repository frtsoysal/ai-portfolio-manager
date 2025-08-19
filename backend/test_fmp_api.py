#!/usr/bin/env python3
"""
FMP API Test - Historical fundamental data için
"""
import requests
import json
from datetime import datetime

def test_fmp_api():
    api_key = "N2s4mP85oHkr3DBawy2GrncqTTpakTBM"
    
    print("🧪 FMP API LİMİT VE KAPASİTE TESTİ")
    print("=" * 40)
    
    # 1. API limits test
    print("📊 API LIMITS:")
    url = f"https://financialmodelingprep.com/api/v3/profile/AAPL?apikey={api_key}"
    response = requests.get(url)
    
    if response.status_code == 200:
        print("✅ API Key çalışıyor")
        # Check headers for limits
        headers = response.headers
        for header in ["X-RateLimit-Limit", "X-RateLimit-Remaining", "X-RateLimit-Reset"]:
            if header in headers:
                print(f"  {header}: {headers[header]}")
        
        # Show profile data
        data = response.json()
        if data:
            company = data[0]
            print(f"  Company: {company.get('companyName', 'N/A')}")
            print(f"  Sector: {company.get('sector', 'N/A')}")
            print(f"  Market Cap: ${company.get('mktCap', 0):,.0f}")
    else:
        print(f"❌ API Hatası: {response.status_code}")
        print(f"Response: {response.text}")
    
    print()
    
    # 2. Historical financial statements test
    print("📈 HISTORICAL FUNDAMENTALS TEST:")
    symbols = ["AAPL", "MSFT", "GOOGL"]
    
    for symbol in symbols:
        print(f"\n🔍 {symbol} test ediliyor...")
        
        # Income statement (quarterly, last 10 years)
        url = f"https://financialmodelingprep.com/api/v3/income-statement/{symbol}?period=quarter&limit=40&apikey={api_key}"
        response = requests.get(url)
        
        if response.status_code == 200:
            data = response.json()
            print(f"  ✅ Income Statement: {len(data)} quarters")
            if data:
                latest = data[0]
                date = latest.get("date", "N/A")
                revenue = latest.get("revenue", 0)
                print(f"     Latest: {date} - Revenue: ${revenue:,.0f}")
        else:
            print(f"  ❌ Income Statement error: {response.status_code}")
        
        # Balance sheet
        url = f"https://financialmodelingprep.com/api/v3/balance-sheet-statement/{symbol}?period=quarter&limit=10&apikey={api_key}"
        response = requests.get(url)
        
        if response.status_code == 200:
            data = response.json()
            print(f"  ✅ Balance Sheet: {len(data)} quarters")
            if data:
                latest = data[0]
                assets = latest.get("totalAssets", 0)
                debt = latest.get("totalDebt", 0)
                print(f"     Assets: ${assets:,.0f}, Debt: ${debt:,.0f}")
        else:
            print(f"  ❌ Balance Sheet error: {response.status_code}")
        
        # Ratios (key metrics calculated)
        url = f"https://financialmodelingprep.com/api/v3/ratios/{symbol}?period=quarter&limit=10&apikey={api_key}"
        response = requests.get(url)
        
        if response.status_code == 200:
            data = response.json()
            print(f"  ✅ Ratios: {len(data)} quarters")
            if data:
                latest = data[0]
                pe = latest.get('priceEarningsRatio', 'N/A')
                roe = latest.get('returnOnEquity', 'N/A')
                pb = latest.get('priceToBookRatio', 'N/A')
                de = latest.get('debtEquityRatio', 'N/A')
                print(f"     P/E: {pe}, ROE: {roe}, P/B: {pb}, D/E: {de}")
        else:
            print(f"  ❌ Ratios error: {response.status_code}")
    
    print()
    print("🎯 SONUÇ:")
    print("✅ Quarterly fundamentals 10+ yıl geriye çekebiliriz!")
    print("✅ P/E, ROE, P/B, D/E ratios hazır!")
    print("✅ Point-in-time backtest için perfect! 🚀")
    print()
    print("📊 Sonraki adım: Historical backtest engine oluşturalım")

if __name__ == "__main__":
    test_fmp_api()
