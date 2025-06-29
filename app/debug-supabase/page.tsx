'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function DebugSupabasePage() {
  const [diagnostics, setDiagnostics] = useState<any>({})
  const [isLoading, setIsLoading] = useState(false)

  const runDiagnostics = async () => {
    setIsLoading(true)
    const results: any = {}

    // Test 1: Environment Variables
    results.env = {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not set',
      key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set (hidden)' : 'Not set',
      urlValid: process.env.NEXT_PUBLIC_SUPABASE_URL?.startsWith('https://'),
    }

    // Test 2: Direct URL Test
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`, {
        method: 'GET',
        headers: {
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
      })
      
      results.directFetch = {
        success: response.ok,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
      }
    } catch (error: any) {
      results.directFetch = {
        success: false,
        error: error.message,
        name: error.name,
        stack: error.stack,
      }
    }

    // Test 3: Auth Endpoint Test
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/user`, {
        method: 'GET',
        headers: {
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
      })
      
      results.authFetch = {
        success: response.ok,
        status: response.status,
        statusText: response.statusText,
      }
    } catch (error: any) {
      results.authFetch = {
        success: false,
        error: error.message,
        name: error.name,
      }
    }

    // Test 4: Network Info
    results.network = {
      online: navigator.onLine,
      userAgent: navigator.userAgent,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
    }

    setDiagnostics(results)
    setIsLoading(false)
  }

  useEffect(() => {
    runDiagnostics()
  }, [])

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Supabase Debug Dashboard</h1>
        <Button onClick={runDiagnostics} disabled={isLoading}>
          {isLoading ? 'Running...' : 'Refresh Tests'}
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Environment Variables */}
        <Card>
          <CardHeader>
            <CardTitle>Environment Variables</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>URL: {diagnostics.env?.url}</div>
              <div>API Key: {diagnostics.env?.key}</div>
              <div>URL Valid: {diagnostics.env?.urlValid ? '✅' : '❌'}</div>
            </div>
          </CardContent>
        </Card>

        {/* Direct Fetch Test */}
        <Card>
          <CardHeader>
            <CardTitle>Direct API Fetch Test</CardTitle>
          </CardHeader>
          <CardContent>
            {diagnostics.directFetch ? (
              <div className="space-y-2">
                <div>Success: {diagnostics.directFetch.success ? '✅' : '❌'}</div>
                {diagnostics.directFetch.success ? (
                  <>
                    <div>Status: {diagnostics.directFetch.status}</div>
                    <div>Status Text: {diagnostics.directFetch.statusText}</div>
                  </>
                ) : (
                  <>
                    <div>Error: {diagnostics.directFetch.error}</div>
                    <div>Error Type: {diagnostics.directFetch.name}</div>
                    {diagnostics.directFetch.stack && (
                      <details>
                        <summary>Stack Trace</summary>
                        <pre className="text-xs mt-2 p-2 bg-gray-100 rounded">
                          {diagnostics.directFetch.stack}
                        </pre>
                      </details>
                    )}
                  </>
                )}
              </div>
            ) : (
              <div>Running test...</div>
            )}
          </CardContent>
        </Card>

        {/* Auth Fetch Test */}
        <Card>
          <CardHeader>
            <CardTitle>Auth Endpoint Test</CardTitle>
          </CardHeader>
          <CardContent>
            {diagnostics.authFetch ? (
              <div className="space-y-2">
                <div>Success: {diagnostics.authFetch.success ? '✅' : '❌'}</div>
                <div>Status: {diagnostics.authFetch.status}</div>
                <div>Status Text: {diagnostics.authFetch.statusText}</div>
                {diagnostics.authFetch.error && (
                  <div>Error: {diagnostics.authFetch.error}</div>
                )}
              </div>
            ) : (
              <div>Running test...</div>
            )}
          </CardContent>
        </Card>

        {/* Network Info */}
        <Card>
          <CardHeader>
            <CardTitle>Network Information</CardTitle>
          </CardHeader>
          <CardContent>
            {diagnostics.network && (
              <div className="space-y-2">
                <div>Online: {diagnostics.network.online ? '✅' : '❌'}</div>
                <div>Cookies Enabled: {diagnostics.network.cookieEnabled ? '✅' : '❌'}</div>
                <div>Language: {diagnostics.network.language}</div>
                <div>User Agent: {diagnostics.network.userAgent}</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Raw Diagnostics */}
        <Card>
          <CardHeader>
            <CardTitle>Raw Diagnostics Data</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto max-h-96">
              {JSON.stringify(diagnostics, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>

      <Alert>
        <AlertDescription>
          This page helps diagnose Supabase connection issues. Check each test result above to identify the problem.
          Common issues include: incorrect environment variables, network connectivity problems, CORS issues, or Supabase service outages.
        </AlertDescription>
      </Alert>
    </div>
  )
}