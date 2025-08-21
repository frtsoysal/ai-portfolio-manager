export default function HealthPage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Health Check</h1>
      <p className="text-green-600">OK</p>
      <div className="mt-4 text-sm text-gray-600">
        <p>Frontend: ✅ Running</p>
        <p>Routing: ✅ Working</p>
        <p>Timestamp: {new Date().toISOString()}</p>
      </div>
    </div>
  )
}
