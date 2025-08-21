/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: false,
  output: 'standalone',
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "script-src 'self' 'unsafe-eval' 'unsafe-inline'; object-src 'none';"
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig







