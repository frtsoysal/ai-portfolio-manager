/**
 * API Service - Backend ile iletişim kuran servis
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ai-portfolio-manager-krrs.onrender.com';

export interface Portfolio {
  id: string;
  name: string;
  description: string;
  risk_level: string;
  target_return: number;
  holdings: Holding[];
  summary: PortfolioSummary;
  analytics?: PortfolioAnalytics;
}

export interface Holding {
  symbol: string;
  name: string;
  quantity: number;
  avg_price: number;
  current_price: number;
  market_value: number;
  cost_basis: number;
  profit_loss: number;
  profit_loss_percent: number;
  daily_change: number;
  daily_change_percent: number;
  weight: number;
  sector?: string;
  industry?: string;
  beta?: number;
  data_source?: string;
}

export interface PortfolioSummary {
  total_value: number;
  total_cost: number;
  total_profit_loss: number;
  total_profit_loss_percent: number;
  number_of_holdings: number;
  last_updated: string;
}

export interface PortfolioAnalytics {
  portfolio_beta: number;
  sharpe_ratio: number;
  diversification_score: number;
  number_of_sectors: number;
  sector_distribution: Record<string, number>;
  risk_score: number;
}

export interface StockData {
  symbol: string;
  name: string;
  current_price: number;
  previous_close: number;
  daily_change: number;
  daily_change_percent: number;
  volume: number;
  market_cap: number;
  pe_ratio: number;
  dividend_yield: number;
  beta: number;
  sector: string;
  industry: string;
  last_updated: string;
}

class ApiService {
  private async fetchApi<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API fetch error for ${endpoint}:`, error);
      throw error;
    }
  }

  // Portfolio endpoints
  async getPortfolios(): Promise<{portfolios: Array<{id: string, name: string, description: string, risk_level: string, target_return: number, number_of_holdings: number}>}> {
    return this.fetchApi('/api/portfolios');
  }

  async getPortfolioDetails(portfolioId: string): Promise<Portfolio> {
    return this.fetchApi(`/api/portfolios/${portfolioId}`);
  }

  async getPortfolioSummary(portfolioId: string): Promise<{id: string, name: string, risk_level: string, summary: PortfolioSummary}> {
    return this.fetchApi(`/api/portfolios/${portfolioId}/summary`);
  }

  // Stock endpoints
  async getStockData(symbol: string): Promise<StockData> {
    return this.fetchApi(`/api/stocks/${symbol}`);
  }

  async getStockHistory(symbol: string, period: string = '1y'): Promise<{symbol: string, period: string, data: Array<{Date: string, Open: number, High: number, Low: number, Close: number, Volume: number}>}> {
    return this.fetchApi(`/api/stocks/${symbol}/history?period=${period}`);
  }

  // Legacy endpoint
  async getLegacyPortfolio(): Promise<{portfolio: Array<any>, summary: any}> {
    return this.fetchApi('/api/portfolio');
  }

  // Test endpoint
  async testConnection(): Promise<{message: string}> {
    return this.fetchApi('/api/test');
  }
}

export const apiService = new ApiService();
export default apiService;

