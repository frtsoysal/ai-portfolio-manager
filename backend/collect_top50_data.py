#!/usr/bin/env python3
"""
Top 50 S&P 500 Şirketleri Veri Toplama Script
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.sp500_data_service import sp500_service
import json
import time
from datetime import datetime

def collect_top50_data():
    """Top 50 şirket verilerini toplar ve cache'ler"""
    
    print("🚀 TOP 50 S&P 500 VERİ TOPLAMA BAŞLANIYOR")
    print("=" * 50)
    
    # Top 50 şirket al
    symbols = sp500_service._fetch_sp500_symbols()[:50]
    
    print(f"📊 Toplam şirket: {len(symbols)}")
    print(f"⏱️ Tahmini süre: {len(symbols)*1.5/60:.1f} dakika")
    print(f"📈 Marketstack başlangıç: {sp500_service._marketstack_usage}/100")
    print()
    
    collected_data = {
        "timestamp": datetime.now().isoformat(),
        "total_companies": len(symbols),
        "companies": {}
    }
    
    success_count = 0
    fundamentals_count = 0
    historical_count = 0
    
    for i, symbol in enumerate(symbols, 1):
        print(f"📈 [{i:2d}/{len(symbols)}] {symbol} işleniyor...")
        
        company_data = {
            "symbol": symbol,
            "fundamentals": None,
            "historical_summary": None,
            "technical_summary": None,
            "data_sources": []
        }
        
        try:
            # 1. Company Profile
            profile = sp500_service._get_company_profile(symbol)
            if profile:
                company_data["profile"] = {
                    "name": profile.get("name", symbol),
                    "sector": profile.get("finnhubIndustry", "Unknown"),
                    "market_cap": profile.get("marketCapitalization", 0)
                }
            
            # 2. Fundamentals
            fundamentals = sp500_service.get_stock_fundamentals(symbol)
            if fundamentals:
                company_data["fundamentals"] = {
                    "pe_ratio": fundamentals.get("pe_ratio"),
                    "pb_ratio": fundamentals.get("pb_ratio"), 
                    "roe": fundamentals.get("roe"),
                    "roa": fundamentals.get("roa"),
                    "debt_equity": fundamentals.get("debt_equity"),
                    "beta": fundamentals.get("beta"),
                    "dividend_yield": fundamentals.get("dividend_yield"),
                    "revenue_growth": fundamentals.get("revenue_growth"),
                    "gross_margin": fundamentals.get("gross_margin"),
                    "net_margin": fundamentals.get("net_margin")
                }
                company_data["data_sources"].append("finnhub_fundamentals")
                fundamentals_count += 1
                pe = fundamentals.get("pe_ratio", "N/A")
                roe = fundamentals.get("roe", "N/A")
                print(f"    ✅ Fundamentals: P/E={pe}, ROE={roe}")
            else:
                print(f"    ❌ Fundamentals yok")
            
            # 3. Historical Data + Technical Indicators
            historical = sp500_service.get_historical_data(symbol, 60)  # 2 aylık
            if historical is not None and not historical.empty:
                # Historical summary
                latest = historical.iloc[-1]
                company_data["historical_summary"] = {
                    "days_count": len(historical),
                    "latest_price": float(latest["close"]),
                    "latest_volume": int(latest["volume"]),
                    "price_change_30d": float((latest["close"] - historical.iloc[0]["close"]) / historical.iloc[0]["close"] * 100),
                    "avg_volume": float(historical["volume"].mean()),
                    "volatility": float(historical["close"].pct_change().std() * (252**0.5))
                }
                
                # Technical indicators
                with_indicators = sp500_service.calculate_technical_indicators(historical)
                latest_tech = with_indicators.iloc[-1]
                
                company_data["technical_summary"] = {
                    "rsi": float(latest_tech.get("rsi", 0)),
                    "sma_20": float(latest_tech.get("sma_20", 0)),
                    "sma_50": float(latest_tech.get("sma_50", 0)),
                    "macd": float(latest_tech.get("macd", 0)),
                    "volatility_20": float(latest_tech.get("volatility_20", 0)),
                    "trend_signal": "bullish" if latest_tech.get("close", 0) > latest_tech.get("sma_20", 0) else "bearish",
                    "momentum_signal": "overbought" if latest_tech.get("rsi", 50) > 70 else "oversold" if latest_tech.get("rsi", 50) < 30 else "neutral"
                }
                
                company_data["data_sources"].append("marketstack_historical")
                historical_count += 1
                
                price = latest["close"]
                rsi = latest_tech.get("rsi", 0)
                print(f"    ✅ Technical: Price=${price:.2f}, RSI={rsi:.1f}")
            else:
                print(f"    ❌ Historical data yok")
            
            collected_data["companies"][symbol] = company_data
            
            if company_data["fundamentals"] and company_data["historical_summary"]:
                success_count += 1
            
            # Rate limiting
            time.sleep(1.2)
            
        except Exception as e:
            print(f"    ❌ Hata: {str(e)}")
            collected_data["companies"][symbol] = company_data
        
        # Progress update
        if i % 10 == 0:
            print(f"    📊 İlerleme: {i}/{len(symbols)} ({success_count} tam başarı)")
    
    # Final statistics
    collected_data["statistics"] = {
        "total_processed": len(symbols),
        "full_success": success_count,
        "fundamentals_success": fundamentals_count,
        "historical_success": historical_count,
        "marketstack_usage": sp500_service._marketstack_usage,
        "success_rate": success_count / len(symbols) * 100
    }
    
    print()
    print("📊 TOPLAMA TAMAMLANDI!")
    print("=" * 30)
    print(f"✅ Tam başarı: {success_count}/{len(symbols)} ({success_count/len(symbols)*100:.1f}%)")
    print(f"📈 Fundamentals: {fundamentals_count}/{len(symbols)}")
    print(f"📊 Historical: {historical_count}/{len(symbols)}")
    print(f"🔄 Marketstack kullanım: {sp500_service._marketstack_usage}/100")
    
    # Save to JSON
    output_file = "top50_sp500_data.json"
    with open(output_file, 'w') as f:
        json.dump(collected_data, f, indent=2)
    
    print(f"💾 Veriler kaydedildi: {output_file}")
    print()
    
    return collected_data

if __name__ == "__main__":
    data = collect_top50_data()
    
    print("🤖 AI STRATEGY ENGINE'E HAZIR!")
    print("Şimdi bu verilerle portföy stratejileri oluşturabiliriz:")
    print("• Value Strategy (düşük P/E, yüksek dividend)")
    print("• Growth Strategy (yüksek ROE, revenue growth)")
    print("• Technical Strategy (RSI, MACD sinyalleri)")
    print("• Quality Strategy (düşük debt, yüksek margin)")

