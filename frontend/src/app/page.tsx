'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [apiStatus, setApiStatus] = useState('Backend bağlantısı test ediliyor...');

  useEffect(() => {
    // Test backend connection
    const testAPI = async () => {
      try {
        const response = await fetch('/api/health');
        const data = await response.json();
        setApiStatus(`✅ Backend API: ${data.message || 'Başarılı'}`);
      } catch (error) {
        setApiStatus('❌ Backend API: Bağlantı kurulamadı');
      }
    };

    testAPI();
  }, []);

  return (
    <>
      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #1e293b, #334155);
          color: white;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .container {
          text-align: center;
          max-width: 800px;
          padding: 2rem;
        }
        
        .title {
          font-size: 4rem;
          margin-bottom: 1rem;
          background: linear-gradient(45deg, #3b82f6, #8b5cf6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .subtitle {
          font-size: 1.5rem;
          margin-bottom: 3rem;
          color: #cbd5e1;
          line-height: 1.6;
        }
        
        .buttons {
          display: flex;
          gap: 1.5rem;
          justify-content: center;
          flex-wrap: wrap;
          margin-bottom: 3rem;
        }
        
        .btn {
          padding: 1rem 2rem;
          border-radius: 12px;
          text-decoration: none;
          font-weight: bold;
          font-size: 1.1rem;
          transition: transform 0.2s;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        }
        
        .btn:hover {
          transform: translateY(-2px);
        }
        
        .btn-primary {
          background-color: #3b82f6;
          color: white;
        }
        
        .btn-secondary {
          background-color: #10b981;
          color: white;
        }
        
        .btn-api {
          background-color: #f59e0b;
          color: white;
        }
        
        .btn-dcf {
          background-color: #8b5cf6;
          color: white;
        }
        
        .status-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-top: 2rem;
        }
        
        .status-card {
          background: rgba(255, 255, 255, 0.1);
          padding: 1.5rem;
          border-radius: 12px;
          backdrop-filter: blur(10px);
        }
        
        .status-icon {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
        }
        
        .status-title {
          font-weight: bold;
          margin-bottom: 0.5rem;
        }
        
        .status-detail {
          font-size: 0.9rem;
          color: #cbd5e1;
        }
        
        .api-test {
          margin-top: 2rem;
          padding: 1rem;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 8px;
          font-family: monospace;
          text-align: left;
        }
      `}</style>
      
      <div className="container">
        <h1 className="title">🚀 AI Portfolio Manager</h1>
        
        <p className="subtitle">
          AI destekli portföy yönetim uygulaması başarıyla çalışıyor!<br />
          Backend ve Frontend servisleri aktif.
        </p>
        
        <div className="buttons">
          <Link href="/portfolios" className="btn btn-primary">
            📊 Portföyleri Gör
          </Link>
          
          <Link href="/sp500" className="btn btn-secondary">
            📈 S&P 500 Dashboard
          </Link>
          
          <Link href="/screener" className="btn btn-api">
            🔍 Stock Screener
          </Link>
          
          <Link href="/dcf/AAPL" className="btn btn-dcf">
            📊 DCF Analysis
          </Link>
        </div>
        
        <div className="status-grid">
          <div className="status-card">
            <div className="status-icon">✅</div>
            <div className="status-title">Backend API</div>
            <div className="status-detail">Next.js API Routes - Aktif</div>
          </div>
          
          <div className="status-card">
            <div className="status-icon">✅</div>
            <div className="status-title">Frontend</div>
            <div className="status-detail">Next.js 14 - Aktif</div>
          </div>
          
          <div className="status-card">
            <div className="status-icon">🗂️</div>
            <div className="status-title">S&P 500 Data</div>
            <div className="status-detail">503 Companies</div>
          </div>
          
          <div className="status-card">
            <div className="status-icon">🤖</div>
            <div className="status-title">AI Engine</div>
            <div className="status-detail">Ready</div>
          </div>
        </div>
        
        <div className="api-test">
          <strong>🔗 API Test:</strong><br />
          <span>{apiStatus}</span>
        </div>
      </div>
    </>
  );
}