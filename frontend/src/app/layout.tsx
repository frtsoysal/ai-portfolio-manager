import type { Metadata } from 'next'
import './globals.css'
import Navigation from '@/components/Navigation'

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
      <body>
        <Navigation />
        <main>{children}</main>
      </body>
    </html>
  )
}







