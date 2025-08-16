/** @type {import('next').NextConfig} */
const nextConfig = {
  // Backend API'ye bağlanmak için
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/api/:path*',
      },
    ]
  },
}

module.exports = nextConfig







