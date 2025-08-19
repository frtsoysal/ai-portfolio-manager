#!/usr/bin/env python3
"""
S&P 500 Data Service Test
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.sp500_data_service import sp500_service

def test_companies():
    print("🧪 Testing S&P 500 companies...")
    companies = sp500_service.get_sp500_list()
    print(f"✅ Found {len(companies)} companies")
    
    for i, company in enumerate(companies[:3]):
        print(f"{i+1}. {company['symbol']} - {company['name']} ({company['sector']})")

def test_fundamentals():
    print("\n🧪 Testing fundamentals for AAPL...")
    fundamentals = sp500_service.get_stock_fundamentals("AAPL")
    if fundamentals:
        print("✅ Fundamentals data received:")
        print(f"   P/E Ratio: {fundamentals.get('pe_ratio')}")
        print(f"   ROE: {fundamentals.get('roe')}")
        print(f"   Beta: {fundamentals.get('beta')}")
    else:
        print("❌ No fundamentals data")

def test_historical():
    print("\n🧪 Testing historical data for AAPL...")
    historical = sp500_service.get_historical_data("AAPL", 30)
    if historical is not None and not historical.empty:
        print(f"✅ Historical data received: {len(historical)} days")
        print(f"   Latest close: ${historical['close'].iloc[-1]:.2f}")
        
        # Test technical indicators
        data_with_indicators = sp500_service.calculate_technical_indicators(historical)
        latest = data_with_indicators.iloc[-1]
        print(f"   RSI: {latest.get('rsi', 0):.2f}")
        print(f"   SMA 20: ${latest.get('sma_20', 0):.2f}")
    else:
        print("❌ No historical data")

if __name__ == "__main__":
    print("🚀 S&P 500 Data Service Test")
    print("=" * 40)
    
    try:
        test_companies()
        test_fundamentals()
        test_historical()
        print("\n✅ All tests completed!")
    except Exception as e:
        print(f"\n❌ Test failed: {str(e)}")
        import traceback
        traceback.print_exc()
