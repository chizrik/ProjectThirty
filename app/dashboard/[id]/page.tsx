'use client'

import { ChallengeDashboard } from '@/components/dashboard/challenge-dashboard'

// Force dynamic rendering for user-specific data
export const dynamic = 'force-dynamic'
export const revalidate = 0

// Required for App Router dynamic routes
export async function generateStaticParams() {
  // Return empty array to force dynamic rendering at request time
  // This prevents build-time static generation issues
  return []
}

export default function DashboardPage() {
  return <ChallengeDashboard />
}