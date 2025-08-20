import { getScreenerData } from '@/lib/fmpAggregator'

export default async function TestApiPage() {
  try {
    const data = await getScreenerData()
    const summary = {
      count: data.length,
      firstThree: data.slice(0, 3).map(company => ({
        symbol: company.symbol,
        name: company.companyName,
        price: company.price,
        sector: company.sector
      })),
      hasApiKey: !!process.env.FMP_API_KEY,
      timestamp: new Date().toISOString()
    }

    return (
      <div className="container mx-auto p-8">
        <h1 className="text-2xl font-bold mb-4">API Test Results</h1>
        <div className="bg-gray-100 p-4 rounded-lg">
          <pre className="text-sm overflow-auto">
            {JSON.stringify(summary, null, 2)}
          </pre>
        </div>
        
        {!process.env.FMP_API_KEY && (
          <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            <strong>Warning:</strong> FMP_API_KEY environment variable is not set!
          </div>
        )}
        
        {data.length === 0 && (
          <div className="mt-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
            <strong>Warning:</strong> No data returned from FMP API
          </div>
        )}
      </div>
    )
  } catch (error) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-2xl font-bold mb-4">API Test - Error</h1>
        <div className="bg-red-100 p-4 rounded-lg border border-red-400">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Error Details:</h2>
          <pre className="text-sm text-red-700 overflow-auto">
            {error instanceof Error ? error.message : 'Unknown error'}
          </pre>
        </div>
        
        <div className="mt-4 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded">
          <h3 className="font-semibold mb-2">Troubleshooting:</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>Check if FMP_API_KEY is set in Vercel environment variables</li>
            <li>Verify the API key is valid and has sufficient quota</li>
            <li>Check network connectivity to FMP API</li>
          </ul>
        </div>
      </div>
    )
  }
}