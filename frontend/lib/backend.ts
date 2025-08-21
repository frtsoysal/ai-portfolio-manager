/**
 * Server-only backend utilities
 * This file must NOT be imported in client components
 */

export function getBackendBaseUrl(): string {
  const url = process.env.BACKEND_BASE_URL
  if (!url) {
    throw new Error('BACKEND_BASE_URL environment variable is required')
  }
  return url
}

interface HttpGetJSONOptions {
  timeoutMs?: number
  searchParams?: Record<string, string | number | boolean>
}

export async function httpGetJSON(
  path: string, 
  options: HttpGetJSONOptions = {}
): Promise<any> {
  const { timeoutMs = 12000, searchParams } = options
  const baseUrl = getBackendBaseUrl()
  
  // Build URL with search params
  const url = new URL(path, baseUrl)
  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      url.searchParams.set(key, String(value))
    })
  }

  const maxRetries = 2
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

    try {
      const response = await fetch(url.toString(), {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'AI-Portfolio-Manager/1.0'
        }
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        console.error('[BE]', path, response.status)
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return data

    } catch (error) {
      clearTimeout(timeoutId)
      lastError = error as Error
      
      console.error('[BE]', path, 'attempt', attempt + 1, error)

      // Don't retry on the last attempt
      if (attempt < maxRetries) {
        // Exponential backoff: 1s, 2s
        const delay = Math.pow(2, attempt) * 1000
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError || new Error(`Failed to fetch ${path} after ${maxRetries + 1} attempts`)
}
