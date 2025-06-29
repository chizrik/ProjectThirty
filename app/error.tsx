'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  React.useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error)
  }, [error])

  // Check if it's a chunk loading error
  const isChunkError = error.message?.includes('Loading chunk') || 
                      error.message?.includes('ChunkLoadError') ||
                      error.stack?.includes('Loading chunk')

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <div className="max-w-md space-y-4">
        <h1 className="text-2xl font-bold">
          {isChunkError ? 'Application Loading Error' : 'Something went wrong!'}
        </h1>
        <p className="text-muted-foreground">
          {isChunkError 
            ? 'The application failed to load properly. This might be due to a network issue or a problem with the application code.'
            : error.message || 'An unexpected error occurred.'}
        </p>
        <div className="flex justify-center gap-4">
          <Button onClick={() => window.location.reload()}>Refresh Page</Button>
          <Button variant="outline" onClick={() => reset()}>Try Again</Button>
        </div>
        {isChunkError && (
          <div className="mt-4 text-sm text-muted-foreground">
            <p>If this problem persists, try the following:</p>
            <ul className="list-disc pl-5 text-left">
              <li>Clear your browser cache</li>
              <li>Check your internet connection</li>
              <li>Disable browser extensions</li>
              <li>Try a different browser</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}