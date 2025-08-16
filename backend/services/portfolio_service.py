"""
Portfolio Service - Portfolio yönetimi ve hesaplamaları
"""
from typing import List, Dict, Optional
from datetime import datetime
from .market_data_service import market_data_service
import logging

logger = logging.getLogger(__name__)

class PortfolioService:
    """Portfolio yönetimi ve analiz servisi"""
    
    def __init__(self):
        # Örnek portfolio verilerimiz (gerçek uygulamada veritabanından gelecek)
        self.predefined_portfolios = {
            'growth': {
                'name': 'Growth Portfolio',
                'description': 'High-growth technology and innovation companies',
                'risk_level': 'High',
                'target_return': 25.0,
                'holdings': [
                    {'symbol': 'AAPL', 'target_weight': 35, 'quantity': 50, 'avg_price': 150.00},
                    {'symbol': 'MSFT', 'target_weight': 25, 'quantity': 30, 'avg_price': 300.00},
                    {'symbol': 'AMZN', 'target_weight': 20, 'quantity': 20, 'avg_price': 130.00},
                    {'symbol': 'GOOGL', 'target_weight': 15, 'quantity': 15, 'avg_price': 140.00},
                    {'symbol': 'TSLA', 'target_weight': 5, 'quantity': 10, 'avg_price': 200.00}
                ]
            },
            'value': {
                'name': 'Value Portfolio',
                'description': 'Undervalued companies with strong fundamentals',
                'risk_level': 'Medium',
                'target_return': 15.0,
                'holdings': [
                    {'symbol': 'BRK-B', 'target_weight': 30, 'quantity': 100, 'avg_price': 320.00},
                    {'symbol': 'JPM', 'target_weight': 25, 'quantity': 50, 'avg_price': 150.00},
                    {'symbol': 'JNJ', 'target_weight': 20, 'quantity': 40, 'avg_price': 160.00},
                    {'symbol': 'PG', 'target_weight': 15, 'quantity': 30, 'avg_price': 155.00},
                    {'symbol': 'KO', 'target_weight': 10, 'quantity': 60, 'avg_price': 55.00}
                ]
            },
            'momentum': {
                'name': 'Momentum Portfolio',
                'description': 'Fast-moving stocks with strong price momentum',
                'risk_level': 'High',
                'target_return': 30.0,
                'holdings': [
                    {'symbol': 'NVDA', 'target_weight': 30, 'quantity': 25, 'avg_price': 400.00},
                    {'symbol': 'AMD', 'target_weight': 25, 'quantity': 40, 'avg_price': 120.00},
                    {'symbol': 'ROKU', 'target_weight': 20, 'quantity': 35, 'avg_price': 80.00},
                    {'symbol': 'SQ', 'target_weight': 15, 'quantity': 50, 'avg_price': 70.00},
                    {'symbol': 'ZM', 'target_weight': 10, 'quantity': 60, 'avg_price': 90.00}
                ]
            },
            'crypto-bluechips': {
                'name': 'Crypto Blue Chips',
                'description': 'Major cryptocurrency-exposed companies',
                'risk_level': 'Very High',
                'target_return': 40.0,
                'holdings': [
                    {'symbol': 'COIN', 'target_weight': 40, 'quantity': 30, 'avg_price': 180.00},
                    {'symbol': 'MSTR', 'target_weight': 30, 'quantity': 10, 'avg_price': 350.00},
                    {'symbol': 'SQ', 'target_weight': 20, 'quantity': 25, 'avg_price': 70.00},
                    {'symbol': 'PYPL', 'target_weight': 10, 'quantity': 40, 'avg_price': 75.00}
                ]
            },
            'turkish-stars': {
                'name': 'Turkish Stars',
                'description': 'Leading Turkish companies with global presence',
                'risk_level': 'Medium-High',
                'target_return': 20.0,
                'holdings': [
                    {'symbol': 'THYAO.IS', 'target_weight': 30, 'quantity': 1000, 'avg_price': 15.00},
                    {'symbol': 'BIMAS.IS', 'target_weight': 25, 'quantity': 500, 'avg_price': 25.00},
                    {'symbol': 'ASELS.IS', 'target_weight': 20, 'quantity': 300, 'avg_price': 35.00},
                    {'symbol': 'KCHOL.IS', 'target_weight': 15, 'quantity': 400, 'avg_price': 20.00},
                    {'symbol': 'PETKM.IS', 'target_weight': 10, 'quantity': 600, 'avg_price': 12.00}
                ]
            }
        }
    
    def get_portfolio_list(self) -> List[Dict]:
        """Mevcut portfolio türlerinin listesini döner"""
        portfolio_list = []
        
        for portfolio_id, portfolio in self.predefined_portfolios.items():
            portfolio_list.append({
                'id': portfolio_id,
                'name': portfolio['name'],
                'description': portfolio['description'],
                'risk_level': portfolio['risk_level'],
                'target_return': portfolio['target_return'],
                'number_of_holdings': len(portfolio['holdings'])
            })
        
        return portfolio_list
    
    def get_portfolio_details(self, portfolio_id: str) -> Optional[Dict]:
        """Belirli bir portfolio'nun detaylı bilgilerini getirir"""
        if portfolio_id not in self.predefined_portfolios:
            return None
        
        portfolio = self.predefined_portfolios[portfolio_id]
        
        # Gerçek piyasa verilerini al
        performance_data = market_data_service.get_portfolio_performance(portfolio['holdings'])
        
        # Portfolio bilgilerini birleştir
        result = {
            'id': portfolio_id,
            'name': portfolio['name'],
            'description': portfolio['description'],
            'risk_level': portfolio['risk_level'],
            'target_return': portfolio['target_return'],
            **performance_data
        }
        
        return result
    
    def get_all_portfolios_summary(self) -> Dict:
        """Tüm portfolio'ların özet bilgilerini getirir"""
        summaries = {}
        
        for portfolio_id in self.predefined_portfolios.keys():
            portfolio_data = self.get_portfolio_details(portfolio_id)
            if portfolio_data:
                summaries[portfolio_id] = {
                    'name': portfolio_data['name'],
                    'risk_level': portfolio_data['risk_level'],
                    'total_value': portfolio_data['summary']['total_value'],
                    'total_profit_loss_percent': portfolio_data['summary']['total_profit_loss_percent'],
                    'number_of_holdings': portfolio_data['summary']['number_of_holdings']
                }
        
        return summaries
    
    def calculate_portfolio_metrics(self, portfolio_data: Dict) -> Dict:
        """Portfolio için detaylı metrikleri hesaplar"""
        holdings = portfolio_data['holdings']
        
        if not holdings:
            return {}
        
        # Volatility hesaplama (basitleştirilmiş)
        volatilities = []
        for holding in holdings:
            beta = holding.get('beta', 1.0)
            weight = holding.get('weight', 0) / 100
            volatilities.append(beta * weight)
        
        portfolio_beta = sum(volatilities)
        
        # Sharpe ratio (basitleştirilmiş)
        risk_free_rate = 2.0  # %2 risk-free rate
        excess_return = portfolio_data['summary']['total_profit_loss_percent'] - risk_free_rate
        sharpe_ratio = excess_return / (portfolio_beta * 15) if portfolio_beta > 0 else 0
        
        # Diversification score
        sector_distribution = {}
        for holding in holdings:
            sector = holding.get('sector', 'Unknown')
            weight = holding.get('weight', 0)
            if sector in sector_distribution:
                sector_distribution[sector] += weight
            else:
                sector_distribution[sector] = weight
        
        # Herfindahl Index (düşük = daha iyi diversification)
        herfindahl_index = sum([(weight/100)**2 for weight in sector_distribution.values()])
        diversification_score = max(0, 100 - (herfindahl_index * 100))
        
        return {
            'portfolio_beta': round(portfolio_beta, 2),
            'sharpe_ratio': round(sharpe_ratio, 2),
            'diversification_score': round(diversification_score, 1),
            'number_of_sectors': len(sector_distribution),
            'sector_distribution': sector_distribution,
            'risk_score': min(10, max(1, portfolio_beta * 3))  # 1-10 scale
        }
    
    def get_portfolio_with_analytics(self, portfolio_id: str) -> Optional[Dict]:
        """Analytics dahil portfolio bilgilerini getirir"""
        portfolio_data = self.get_portfolio_details(portfolio_id)
        
        if not portfolio_data:
            return None
        
        # Analytics hesapla
        analytics = self.calculate_portfolio_metrics(portfolio_data)
        portfolio_data['analytics'] = analytics
        
        return portfolio_data

# Global instance
portfolio_service = PortfolioService()






