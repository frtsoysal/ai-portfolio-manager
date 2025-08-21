import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    BACKEND_BASE_URL: process.env.BACKEND_BASE_URL || 'NOT_SET',
    NODE_ENV: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  })
}
