import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import AppLayout from '@/components/app-layout'
import ClientLayout from '@/components/client-layout'

export const metadata: Metadata = {
  title: 'ProjectThirty - 30 Day Challenge Platform',
  description: 'Your personal AI-powered 30-day challenge companion',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}
