'use client'

import * as React from 'react'
import { ThemeProvider } from '@/components/theme-provider'
import { SimpleThemeProvider } from '@/components/simple-theme-provider'
import AppLayout from '@/components/app-layout'

interface ClientLayoutProps {
  children: React.ReactNode
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const [useSimpleTheme, setUseSimpleTheme] = React.useState(false)
  const [hasChunkError, setHasChunkError] = React.useState(false)

  // Global error handler for chunk loading errors
  React.useEffect(() => {
    const originalOnError = window.onerror
    
    // Add a global error handler
    window.onerror = (message, source, lineno, colno, error) => {
      // Check if it's a chunk loading error
      if (
        message.toString().includes('Loading chunk') ||
        (error && error.message && error.message.includes('Loading chunk')) ||
        message.toString().includes('ChunkLoadError')
      ) {
        console.log('Detected chunk loading error, switching to simple theme')
        setHasChunkError(true)
        setUseSimpleTheme(true)
        return true // Prevent default error handling
      }
      
      // Call the original handler for other errors
      if (originalOnError) {
        return originalOnError(message, source, lineno, colno, error)
      }
      return false
    }
    
    return () => {
      window.onerror = originalOnError
    }
  }, [])

  return (
    <ErrorBoundary 
      fallback={
        <SimpleThemeProvider defaultTheme="system">
          <div className="p-4">Theme provider error. Using simplified theme.</div>
          <AppLayout>{children}</AppLayout>
        </SimpleThemeProvider>
      }
    >
      {useSimpleTheme ? (
        <SimpleThemeProvider defaultTheme="system">
          {hasChunkError && (
            <div className="fixed top-0 left-0 right-0 bg-yellow-100 dark:bg-yellow-900 p-2 text-center text-sm">
              Using simplified theme due to loading issues. <button onClick={() => window.location.reload()} className="underline">Refresh</button>
            </div>
          )}
          <AppLayout>{children}</AppLayout>
        </SimpleThemeProvider>
      ) : (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AppLayout>{children}</AppLayout>
        </ThemeProvider>
      )}
    </ErrorBoundary>
  )
}

// Simple error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('Error in ClientLayout:', error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}