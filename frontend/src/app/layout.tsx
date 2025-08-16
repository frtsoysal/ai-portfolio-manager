import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AI Portfolio Manager',
  description: 'AI destekli portföy yönetim uygulaması',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  )
}







