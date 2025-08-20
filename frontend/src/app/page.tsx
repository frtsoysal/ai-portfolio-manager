export default function Home() {
  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h1>🎉 Site Çalışıyor!</h1>
      <p>Build Time: {new Date().toISOString()}</p>
      <div style={{ marginTop: '30px' }}>
        <a href="/screener" style={{ margin: '10px', padding: '10px 20px', background: '#0070f3', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>
          Screener
        </a>
        <a href="/sp500" style={{ margin: '10px', padding: '10px 20px', background: '#10b981', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>
          S&P 500
        </a>
        <a href="/dcf/AAPL" style={{ margin: '10px', padding: '10px 20px', background: '#8b5cf6', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>
          DCF Analysis
        </a>
      </div>
    </div>
  )
}