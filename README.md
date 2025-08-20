# AI Portfolio Manager

Modern AI destekli portföy yönetim ve DCF analiz uygulaması

## Teknoloji Stack
- **Frontend**: Next.js 13.5.6 + TypeScript + Tailwind CSS + Shadcn/UI
- **Backend**: FastAPI + Python + Uvicorn
- **Data Sources**: Financial Modeling Prep (FMP) API
- **Deployment**: Vercel (Frontend) + Railway (Backend)
- **UI Components**: TanStack Table, Recharts, Lucide Icons

## Özellikler
- 📊 **S&P 500 Screener**: Gelişmiş filtreleme ve sorting
- 📈 **DCF Analysis**: Tam DCF modeli ile hisse değerleme
- 🎯 **Scenario Analysis**: Bull/Bear/Base case senaryoları
- 📉 **Sensitivity Analysis**: Tornado chart, 2D matrix
- 🔄 **Reverse DCF**: Piyasa beklentilerini analiz et
- 🏠 **Portfolio Management**: AI destekli portföy takibi
- 📱 **Responsive Design**: Mobil ve desktop uyumlu

## Kurulum

### Gereksinimler
- Node.js 18+
- Python 3.9+
- FMP API Key (https://financialmodelingprep.com/)

### Local Development

#### Backend (FastAPI)
```bash
cd backend
pip install -r requirements.txt
export FMP_API_KEY=your_api_key_here
uvicorn main:app --reload --port 8001
```

#### Frontend (Next.js)
```bash
cd frontend
npm install
echo "BACKEND_URL=http://localhost:8001" > .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:8001" >> .env.local
npm run dev
```

### Deployment

#### Frontend (Vercel)
1. Fork this repository
2. Connect to Vercel
3. Set environment variables:
   - `NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app`

#### Backend (Railway)
1. Connect repository to Railway
2. Set environment variables:
   - `FMP_API_KEY=your_api_key_here`
   - `PORT=8001`

## Proje Yapısı
```
ai-manager/
├── frontend/                 # Next.js uygulaması
│   ├── src/app/             # App Router pages
│   ├── src/components/      # React components
│   ├── src/lib/            # Utility functions
│   └── src/types/          # TypeScript types
├── backend/                 # FastAPI backend
│   ├── main.py             # FastAPI app
│   ├── services/           # Business logic
│   └── requirements.txt    # Python dependencies
├── vercel.json             # Vercel config
└── railway.toml           # Railway config
```

## API Endpoints

### S&P 500 Data
- `GET /api/sp500/overview` - S&P 500 companies overview
- `GET /api/screener` - Advanced stock screening

### DCF Analysis  
- `GET /api/fmp/profile` - Company profile
- `GET /api/fmp/financials` - Financial statements
- `GET /api/fmp/dcf-data` - Complete DCF data

### Portfolio Management
- `GET /api/portfolios` - Portfolio list
- `GET /api/portfolios/{id}` - Portfolio details
