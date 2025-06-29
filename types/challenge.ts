export interface ChallengePlan {
  id: string
  user_id: string
  title: string
  description: string
  days: Array<{
    date: string
    tasks: any[]
  }>
  metrics: {
    success_likelihood: number
    effort_level: string
    time_per_day: number
  }
  created_at?: string
}