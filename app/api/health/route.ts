import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "30-day-challenge-app",
  })
}
