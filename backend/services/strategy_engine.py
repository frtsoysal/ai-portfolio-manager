"""
AI Strategy Engine - Kompleks portföy stratejileri ve backtest
"""
import pandas as pd
import numpy as np
import yfinance as yf
from typing import Dict, List, Optional, Tuple
from datetime import datetime, timedelta
import logging
import json

logger = logging.getLogger(__name__)

class StrategyEngine:
    def __init__(self):
        self.strategies = {}
        self.backtest_cache = {}
        
    def calculate_complex_value_score(self, company_data: Dict) -> float:
        """
        Kompleks Value Strategy Score hesaplar
        
        Faktörler:
        1. Value Metrics (40%): P/E, P/B, EV/EBITDA
        2. Quality Metrics (30%): ROE, ROA, Debt/Equity, Margins
        3. Dividend Metrics (20%): Yield, Payout Ratio, Growth
        4. Risk Metrics (10%): Beta, Volatility
        """
        
        score = 0
        weight_sum = 0
        
        fundamentals = company_data.get('fundamentals', {})
        technical = company_data.get('technical_summary', {})
        historical = company_data.get('historical_summary', {})
        
        if not fundamentals:
            return 0
        
        # 1. VALUE METRICS (40% weight)
        value_score = 0
        value_weight = 0
        
        # P/E Ratio (lower is better, invert score)
        pe_ratio = fundamentals.get('pe_ratio')
        if pe_ratio and pe_ratio > 0:
            pe_score = max(0, 100 - pe_ratio * 2)  # 0-50 range ideal
            value_score += pe_score * 0.5
            value_weight += 0.5
        
        # P/B Ratio (lower is better)
        pb_ratio = fundamentals.get('pb_ratio')
        if pb_ratio and pb_ratio > 0:
            pb_score = max(0, 100 - pb_ratio * 20)  # 0-5 range ideal
            value_score += pb_score * 0.3
            value_weight += 0.3
        
        # Revenue Growth (moderate positive is good)
        revenue_growth = fundamentals.get('revenue_growth')
        if revenue_growth is not None:
            # Sweet spot: 5-20% growth
            if 5 <= revenue_growth <= 20:
                growth_score = 80 + (revenue_growth - 12.5) / 12.5 * 20
            elif revenue_growth > 20:
                growth_score = max(0, 100 - (revenue_growth - 20) * 2)
            else:
                growth_score = max(0, revenue_growth * 16)  # 0-5% scaled to 0-80
            value_score += growth_score * 0.2
            value_weight += 0.2
        
        if value_weight > 0:
            value_score = value_score / value_weight
            score += value_score * 0.4
            weight_sum += 0.4
        
        # 2. QUALITY METRICS (30% weight)
        quality_score = 0
        quality_weight = 0
        
        # ROE (higher is better, but not too extreme)
        roe = fundamentals.get('roe')
        if roe is not None and roe > 0:
            if roe > 100:  # Too high ROE might be unsustainable
                roe_score = max(0, 100 - (roe - 100) * 0.5)
            else:
                roe_score = min(100, roe * 2)  # 0-50% ROE scaled to 0-100
            quality_score += roe_score * 0.4
            quality_weight += 0.4
        
        # ROA 
        roa = fundamentals.get('roa')
        if roa is not None and roa > 0:
            roa_score = min(100, roa * 5)  # 0-20% ROA scaled to 0-100
            quality_score += roa_score * 0.2
            quality_weight += 0.2
        
        # Debt/Equity (lower is better)
        debt_equity = fundamentals.get('debt_equity')
        if debt_equity is not None and debt_equity >= 0:
            de_score = max(0, 100 - debt_equity * 2)  # 0-50 range ideal
            quality_score += de_score * 0.2
            quality_weight += 0.2
        
        # Margins (higher is better)
        gross_margin = fundamentals.get('gross_margin')
        if gross_margin is not None and gross_margin > 0:
            margin_score = min(100, gross_margin * 2)  # 0-50% margin scaled
            quality_score += margin_score * 0.2
            quality_weight += 0.2
        
        if quality_weight > 0:
            quality_score = quality_score / quality_weight
            score += quality_score * 0.3
            weight_sum += 0.3
        
        # 3. DIVIDEND METRICS (20% weight)
        dividend_score = 0
        dividend_yield = fundamentals.get('dividend_yield')
        
        if dividend_yield is not None and dividend_yield > 0:
            # Sweet spot: 2-6% dividend yield
            if 2 <= dividend_yield <= 6:
                dividend_score = 80 + (dividend_yield - 4) / 2 * 20
            elif dividend_yield > 6:
                dividend_score = max(0, 100 - (dividend_yield - 6) * 10)
            else:
                dividend_score = dividend_yield * 40  # 0-2% scaled to 0-80
            
            score += dividend_score * 0.2
            weight_sum += 0.2
        
        # 4. RISK METRICS (10% weight)
        risk_score = 0
        risk_weight = 0
        
        # Beta (closer to 1 is better for value)
        beta = fundamentals.get('beta')
        if beta is not None and beta > 0:
            beta_score = max(0, 100 - abs(beta - 1) * 50)
            risk_score += beta_score * 0.5
            risk_weight += 0.5
        
        # Volatility (lower is better for value)
        volatility = historical.get('volatility') if historical else None
        if volatility is not None:
            vol_score = max(0, 100 - volatility * 200)  # 0-50% vol scaled
            risk_score += vol_score * 0.5
            risk_weight += 0.5
        
        if risk_weight > 0:
            risk_score = risk_score / risk_weight
            score += risk_score * 0.1
            weight_sum += 0.1
        
        # Normalize final score
        if weight_sum > 0:
            return min(100, score / weight_sum)
        
        return 0
    
    def create_value_portfolio(self, companies_data: Dict, target_size: int = 10) -> Dict:
        """
        Kompleks Value Strategy ile portföy oluşturur
        """
        
        print("🔍 KOMPLEKS VALUE STRATEGY ANALİZİ")
        print("=" * 40)
        
        # Her şirket için value score hesapla
        scored_companies = []
        
        for symbol, company_data in companies_data.items():
            if not company_data.get('fundamentals'):
                continue
                
            score = self.calculate_complex_value_score(company_data)
            
            if score > 0:
                scored_companies.append({
                    'symbol': symbol,
                    'score': score,
                    'name': company_data.get('profile', {}).get('name', symbol),
                    'sector': company_data.get('profile', {}).get('sector', 'Unknown'),
                    'pe_ratio': company_data['fundamentals'].get('pe_ratio'),
                    'roe': company_data['fundamentals'].get('roe'),
                    'dividend_yield': company_data['fundamentals'].get('dividend_yield'),
                    'beta': company_data['fundamentals'].get('beta'),
                    'market_cap': company_data.get('profile', {}).get('market_cap', 0),
                    'latest_price': company_data.get('historical_summary', {}).get('latest_price', 0)
                })
        
        # Score'a göre sırala
        scored_companies.sort(key=lambda x: x['score'], reverse=True)
        
        # Top companies seç
        top_companies = scored_companies[:target_size]
        
        # Portfolio oluştur
        portfolio = {
            'strategy': 'Complex Value Strategy',
            'created_at': datetime.now().isoformat(),
            'target_size': target_size,
            'holdings': [],
            'metrics': {
                'avg_score': np.mean([c['score'] for c in top_companies]),
                'avg_pe': np.mean([c['pe_ratio'] for c in top_companies if c['pe_ratio']]),
                'avg_roe': np.mean([c['roe'] for c in top_companies if c['roe']]),
                'avg_dividend_yield': np.mean([c['dividend_yield'] for c in top_companies if c['dividend_yield']]),
                'total_market_cap': sum([c['market_cap'] for c in top_companies])
            }
        }
        
        # Equal weight olarak başla (sonra optimize edilebilir)
        weight_per_stock = 100 / len(top_companies)
        
        for company in top_companies:
            portfolio['holdings'].append({
                'symbol': company['symbol'],
                'name': company['name'],
                'sector': company['sector'],
                'weight': weight_per_stock,
                'value_score': company['score'],
                'pe_ratio': company['pe_ratio'],
                'roe': company['roe'],
                'dividend_yield': company['dividend_yield'],
                'beta': company['beta'],
                'latest_price': company['latest_price'],
                'rationale': self._get_value_rationale(company)
            })
        
        return portfolio
    
    def _get_value_rationale(self, company: Dict) -> str:
        """Value yatırım gerekçesi oluşturur"""
        rationale = []
        
        if company['pe_ratio'] and company['pe_ratio'] < 15:
            rationale.append(f"Düşük P/E ({company['pe_ratio']:.1f})")
        
        if company['roe'] and company['roe'] > 15:
            rationale.append(f"Yüksek ROE ({company['roe']:.1f}%)")
        
        if company['dividend_yield'] and company['dividend_yield'] > 2:
            rationale.append(f"İyi dividend ({company['dividend_yield']:.2f}%)")
        
        if company['beta'] and 0.7 <= company['beta'] <= 1.3:
            rationale.append(f"Düşük risk (β={company['beta']:.2f})")
        
        return "; ".join(rationale) if rationale else "Genel value metrikleri"
    
    def backtest_strategy(self, portfolio: Dict, years: int = 5) -> Dict:
        """
        Portfolio stratejisini geçmişe yönelik test eder
        """
        
        print(f"📊 {years} YILLIK BACKTEST BAŞLANIYOR")
        print("=" * 35)
        
        symbols = [holding['symbol'] for holding in portfolio['holdings']]
        weights = [holding['weight'] / 100 for holding in portfolio['holdings']]
        
        # Başlangıç ve bitiş tarihleri
        end_date = datetime.now()
        start_date = end_date - timedelta(days=years * 365)
        
        print(f"📅 Tarih aralığı: {start_date.strftime('%Y-%m-%d')} - {end_date.strftime('%Y-%m-%d')}")
        print(f"📊 Portfolio: {len(symbols)} hisse")
        
        # Her hisse için tarihsel veri çek
        portfolio_returns = []
        successful_symbols = []
        successful_weights = []
        
        for i, symbol in enumerate(symbols):
            try:
                print(f"📈 [{i+1}/{len(symbols)}] {symbol} verilerini çekiyor...")
                
                ticker = yf.Ticker(symbol)
                hist = ticker.history(period=f"{years}y")
                
                if len(hist) > 100:  # Minimum veri kontrolü
                    # Günlük getiri hesapla
                    daily_returns = hist['Close'].pct_change().dropna()
                    portfolio_returns.append(daily_returns)
                    successful_symbols.append(symbol)
                    successful_weights.append(weights[i])
                    print(f"    ✅ {len(hist)} gün veri")
                else:
                    print(f"    ❌ Yetersiz veri ({len(hist)} gün)")
                    
            except Exception as e:
                print(f"    ❌ Hata: {str(e)}")
        
        if not portfolio_returns:
            return {'error': 'Hiçbir hisse için yeterli veri bulunamadı'}
        
        # Weights'i normalize et
        total_weight = sum(successful_weights)
        successful_weights = [w / total_weight for w in successful_weights]
        
        print(f"✅ Başarılı: {len(successful_symbols)}/{len(symbols)} hisse")
        
        # Portfolio returns hesapla
        portfolio_df = pd.concat(portfolio_returns, axis=1)
        portfolio_df.columns = successful_symbols
        portfolio_df = portfolio_df.dropna()
        
        # Weighted portfolio returns
        weighted_returns = (portfolio_df * successful_weights).sum(axis=1)
        
        # Performance metrikleri
        total_return = (1 + weighted_returns).prod() - 1
        annual_return = (1 + total_return) ** (1/years) - 1
        annual_volatility = weighted_returns.std() * np.sqrt(252)
        sharpe_ratio = annual_return / annual_volatility if annual_volatility > 0 else 0
        
        # Max drawdown
        cumulative_returns = (1 + weighted_returns).cumprod()
        running_max = cumulative_returns.expanding().max()
        drawdown = (cumulative_returns - running_max) / running_max
        max_drawdown = drawdown.min()
        
        # Benchmark (SPY) ile karşılaştır
        spy = yf.Ticker("SPY")
        spy_hist = spy.history(period=f"{years}y")
        spy_returns = spy_hist['Close'].pct_change().dropna()
        
        # Ortak tarihlerde karşılaştır
        common_dates = portfolio_df.index.intersection(spy_returns.index)
        portfolio_aligned = weighted_returns.loc[common_dates]
        spy_aligned = spy_returns.loc[common_dates]
        
        spy_total_return = (1 + spy_aligned).prod() - 1
        spy_annual_return = (1 + spy_total_return) ** (1/years) - 1
        
        excess_return = annual_return - spy_annual_return
        
        backtest_results = {
            'period': f"{years} years",
            'start_date': start_date.strftime('%Y-%m-%d'),
            'end_date': end_date.strftime('%Y-%m-%d'),
            'successful_stocks': len(successful_symbols),
            'total_stocks': len(symbols),
            'performance': {
                'total_return': total_return * 100,
                'annual_return': annual_return * 100,
                'annual_volatility': annual_volatility * 100,
                'sharpe_ratio': sharpe_ratio,
                'max_drawdown': max_drawdown * 100
            },
            'benchmark_comparison': {
                'spy_annual_return': spy_annual_return * 100,
                'excess_return': excess_return * 100,
                'outperformed': annual_return > spy_annual_return
            },
            'successful_symbols': successful_symbols,
            'weights': successful_weights
        }
        
        return backtest_results

# Global instance
strategy_engine = StrategyEngine()

