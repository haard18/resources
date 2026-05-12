import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Resource Share',
  description: 'Team resource sharing board',
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}