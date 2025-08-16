from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from services.portfolio_service import portfolio_service
from services.market_data_service import market_data_service
import logging

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
    allow_origins=["http://localhost:3000", "http://localhost:3001"],  # Frontend URL'leri
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

# Uygulama çalıştırma
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
