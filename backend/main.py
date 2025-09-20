from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from services.portfolio_service import portfolio_service
from services.market_data_service import market_data_service
from services.sp500_data_service import sp500_service
import logging
import json
from datetime import datetime

# Logging ayarları
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI uygulamasını oluştur
app = FastAPI(
    title="AI Portfolio Manager API",
    description="AI destekli portföy yönetim sistemi",
    version="1.0.0"
)

# CORS (Cross-Origin Resource Sharing) ayarları
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://localhost:3001",
        "https://ai-portfolio-manager-ashen.vercel.app"
    ],  # Frontend URL'leri
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ana sayfa endpoint'i
@app.get("/")
async def read_root():
    return {"message": "AI Portfolio Manager API çalışıyor!", "version": "1.0.0"}

# Sağlık kontrolü endpoint'i
@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "API aktif"}

# Test endpoint'i
@app.get("/api/test")
async def test():
    return {"message": "Test başarılı!"}

# Test SP500 endpoint
@app.get("/api/sp500/test")
async def test_sp500():
    return {"message": "SP500 test başarılı!", "companies": 5}

# Portfolio endpoints
@app.get("/api/portfolios")
async def get_portfolios():
    """Tüm portfolio türlerinin listesini döner"""
    try:
        portfolios = portfolio_service.get_portfolio_list()
        return {"portfolios": portfolios}
    except Exception as e:
        logger.error(f"Error fetching portfolios: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/api/portfolios/{portfolio_id}")
async def get_portfolio_details(portfolio_id: str):
    """Belirli bir portfolio'nun detaylarını döner"""
    try:
        portfolio = portfolio_service.get_portfolio_with_analytics(portfolio_id)
        if not portfolio:
            raise HTTPException(status_code=404, detail="Portfolio not found")
        return portfolio
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching portfolio {portfolio_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/api/portfolios/{portfolio_id}/summary")
async def get_portfolio_summary(portfolio_id: str):
    """Portfolio özet bilgilerini döner"""
    try:
        portfolio = portfolio_service.get_portfolio_details(portfolio_id)
        if not portfolio:
            raise HTTPException(status_code=404, detail="Portfolio not found")
        
        return {
            "id": portfolio_id,
            "name": portfolio["name"],
            "risk_level": portfolio["risk_level"],
            "summary": portfolio["summary"]
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching portfolio summary {portfolio_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# Market data endpoints
@app.get("/api/stocks/{symbol}")
async def get_stock_data(symbol: str):
    """Belirli bir hisse senedi verilerini döner"""
    try:
        stock_data = market_data_service.get_stock_data(symbol.upper())
        if not stock_data:
            raise HTTPException(status_code=404, detail="Stock not found")
        return stock_data
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching stock data for {symbol}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/api/stocks/{symbol}/history")
async def get_stock_history(symbol: str, period: str = "1y"):
    """Hisse senedi tarihsel verilerini döner"""
    try:
        historical_data = market_data_service.get_historical_data(symbol.upper(), period)
        if historical_data is None:
            raise HTTPException(status_code=404, detail="Historical data not found")
        
        return {
            "symbol": symbol.upper(),
            "period": period,
            "data": historical_data.to_dict('records')
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching historical data for {symbol}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# Legacy endpoint (eski frontend uyumluluğu için)
@app.get("/api/portfolio")
async def get_legacy_portfolio():
    """Eski portfolio endpoint'i - Growth portfolio döner"""
    try:
        portfolio = portfolio_service.get_portfolio_details('growth')
        if not portfolio:
            raise HTTPException(status_code=404, detail="Portfolio not found")
        
        # Eski format'a uygun dönüş
        legacy_holdings = []
        for i, holding in enumerate(portfolio['holdings']):
            legacy_holdings.append({
                "id": i + 1,
                "symbol": holding['symbol'],
                "name": holding['name'],
                "quantity": holding['quantity'],
                "avg_price": holding['avg_price'],
                "current_price": holding['current_price'],
                "market_value": holding['market_value'],
                "change": holding['daily_change'],
                "change_percent": holding['daily_change_percent']
            })
        
        return {
            "portfolio": legacy_holdings,
            "summary": {
                "total_value": portfolio['summary']['total_value'],
                "total_change": portfolio['summary']['total_profit_loss'],
                "total_change_percent": portfolio['summary']['total_profit_loss_percent']
            }
        }
    except Exception as e:
        logger.error(f"Error fetching legacy portfolio: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# S&P 500 Data endpoints
@app.get("/api/sp500/companies")
async def get_sp500_companies():
    """S&P 500 şirketlerinin listesini döner"""
    try:
        companies = sp500_service.get_sp500_list()
        return {
            "companies": companies,
            "total_count": len(companies),
            "last_updated": "2024-01-01T00:00:00Z"
        }
    except Exception as e:
        logger.error(f"Error fetching S&P 500 companies: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/api/sp500/{symbol}/fundamentals")
async def get_stock_fundamentals(symbol: str):
    """Belirli bir hisse senedinin fundamental verilerini döner"""
    try:
        fundamentals = sp500_service.get_stock_fundamentals(symbol.upper())
        if not fundamentals:
            raise HTTPException(status_code=404, detail="Fundamental data not found")
        return fundamentals
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching fundamentals for {symbol}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/api/sp500/{symbol}/historical")
async def get_stock_historical(symbol: str, days: int = 252):
    """Hisse senedinin tarihsel verilerini ve teknik analiz göstergelerini döner"""
    try:
        # Validate days parameter
        if days <= 0 or days > 2000:
            raise HTTPException(status_code=400, detail="Days must be between 1 and 2000")
        
        historical_data = sp500_service.get_historical_data(symbol.upper(), days)
        if historical_data is None or historical_data.empty:
            raise HTTPException(status_code=404, detail="Historical data not found")
        
        # Add technical indicators
        data_with_indicators = sp500_service.calculate_technical_indicators(historical_data)
        
        # Convert to dict for JSON response
        result = {
            "symbol": symbol.upper(),
            "period_days": days,
            "data_points": len(data_with_indicators),
            "data": data_with_indicators.fillna(0).to_dict('records'),
            "last_updated": data_with_indicators.index[-1].isoformat() if not data_with_indicators.empty else None
        }
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching historical data for {symbol}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/api/sp500/{symbol}/analysis")
async def get_stock_analysis(symbol: str):
    """Hisse senedinin kapsamlı analizini döner (fundamental + technical)"""
    try:
        # Get both fundamental and technical data
        fundamentals = sp500_service.get_stock_fundamentals(symbol.upper())
        historical_data = sp500_service.get_historical_data(symbol.upper(), 252)
        
        if not fundamentals and (historical_data is None or historical_data.empty):
            raise HTTPException(status_code=404, detail="Analysis data not found")
        
        analysis = {
            "symbol": symbol.upper(),
            "fundamentals": fundamentals,
            "technical_summary": None
        }
        
        # Add technical analysis summary if historical data exists
        if historical_data is not None and not historical_data.empty:
            data_with_indicators = sp500_service.calculate_technical_indicators(historical_data)
            latest = data_with_indicators.iloc[-1]
            
            analysis["technical_summary"] = {
                "current_price": latest.get("close", 0),
                "sma_20": latest.get("sma_20", 0),
                "sma_50": latest.get("sma_50", 0),
                "sma_200": latest.get("sma_200", 0),
                "rsi": latest.get("rsi", 0),
                "macd": latest.get("macd", 0),
                "volatility_20": latest.get("volatility_20", 0),
                "volume_ratio": latest.get("volume_ratio", 0),
                "trend_signal": "bullish" if latest.get("close", 0) > latest.get("sma_50", 0) else "bearish",
                "momentum_signal": "strong" if latest.get("rsi", 50) > 70 else "weak" if latest.get("rsi", 50) < 30 else "neutral"
            }
        
        return analysis
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching analysis for {symbol}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# Overview endpoint kaldırıldı - artık sadece screener kullanıyoruz

# Diğer SP500 endpoint'leri geçici olarak kaldırıldı - sadece overview çalışıyor

# Uygulama çalıştırma
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001, reload=False)
