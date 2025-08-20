export const dynamic = 'force-static'

export default function HealthPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <div className="text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-green-600 mb-4">OK</h1>
          
          <div className="space-y-2 text-left">
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className="font-medium text-green-600">Healthy</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Environment:</span>
              <span className="font-medium">{process.env.VERCEL_ENV || 'development'}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Build Time:</span>
              <span className="font-medium text-xs">{new Date().toISOString()}</span>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <a 
              href="/" 
              className="text-blue-600 hover:text-blue-800 underline"
            >
              ← Back to Homepage
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
