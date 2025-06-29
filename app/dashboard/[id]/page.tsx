'use client'

import { ChallengeDashboard } from '@/components/dashboard/challenge-dashboard'

// Force dynamic rendering for user-specific data
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function DashboardPage() {
  return <ChallengeDashboard />
}