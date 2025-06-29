"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createSupabaseClient } from "@/lib/supabase"

export default function TestConnectionPage() {
  const [testResults, setTestResults] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const runTests = async () => {
    setIsLoading(true)
    const results: any = {}

    try {
      const supabase = createSupabaseClient()
      console.log("Testing Supabase connection...")

      // Test 1: Environment variables
      results.environment = {
        success: !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
        url: process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Set" : "❌ Missing",
        key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ Set" : "❌ Missing",
      }

      // Test 2: Basic connection
      try {
        const { data: connectionTest, error: connectionError } = await supabase
          .from("user_profiles")
          .select("count")
          .limit(1)

        results.connection = {
          success: !connectionError,
          error: connectionError?.message || "Connection successful",
        }
      } catch (err: any) {
        results.connection = {
          success: false,
          error: err.message,
        }
      }

      // Test 3: Auth status
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser()

        results.auth = {
          success: !authError,
          user: user?.email || "No user logged in",
          error: authError?.message || "Auth working",
        }
      } catch (err: any) {
        results.auth = {
          success: false,
          error: err.message,
        }
      }

      // Test 4: Table access
      try {
        const { data: tableTest, error: tableError } = await supabase.from("user_profiles").select("*").limit(1)

        results.tableAccess = {
          success: !tableError,
          error: tableError?.message || "Table access working",
          tableExists: !tableError || tableError.code !== "42P01",
        }
      } catch (err: any) {
        results.tableAccess = {
          success: false,
          error: err.message,
          tableExists: false,
        }
      }

      console.log("Test results:", results)
    } catch (err: any) {
      results.general = {
        success: false,
        error: err.message,
      }
    }

    setTestResults(results)
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Supabase Connection Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={runTests} disabled={isLoading} className="w-full">
            {isLoading ? "Testing..." : "Run Connection Tests"}
          </Button>

          {testResults && (
            <div className="space-y-4">
              {Object.entries(testResults).map(([key, result]: [string, any]) => (
                <Alert key={key} variant={result.success ? "default" : "destructive"}>
                  <AlertDescription>
                    <div className="flex items-center justify-between">
                      <span className="font-medium capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
                      <span className={result.success ? "text-green-600" : "text-red-600"}>
                        {result.success ? "✅ Pass" : "❌ Fail"}
                      </span>
                    </div>
                    {result.error && <div className="mt-1 text-sm opacity-75">{result.error}</div>}
                    {result.url && <div className="mt-1 text-sm">URL: {result.url}</div>}
                    {result.key && <div className="mt-1 text-sm">Key: {result.key}</div>}
                    {result.user && <div className="mt-1 text-sm">User: {result.user}</div>}
                  </AlertDescription>
                </Alert>
              ))}

              <div className="mt-4">
                <h3 className="font-medium mb-2">Next Steps:</h3>
                <ul className="text-sm space-y-1 text-gray-600">
                  {!testResults.environment?.success && (
                    <li>• Check your .env.local file has the correct Supabase credentials</li>
                  )}
                  {!testResults.connection?.success && <li>• Verify your Supabase project is active</li>}
                  {!testResults.tableAccess?.success && (
                    <li>• Run the SQL schema in your Supabase dashboard to create tables</li>
                  )}
                </ul>
              </div>

              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-medium">Raw Test Results</summary>
                <pre className="mt-2 bg-gray-100 p-4 rounded text-xs overflow-auto">
                  {JSON.stringify(testResults, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
