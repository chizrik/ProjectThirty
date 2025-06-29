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

export interface Challenge {
  id: string
  user_id: string
  title: string
  description: string
  category?: string
  difficulty?: string
  time_commitment?: number
  created_at?: string
  updated_at?: string
}

export interface DayProgress {
  id: string
  challenge_id: string
  user_id: string
  day: number
  completed: boolean
  reflection?: string
  ai_feedback?: string
  created_at?: string
  updated_at?: string
}

export interface AnalyticsData {
  totalDays: number
  completedDays: number
  completionRate: number
  currentStreak: number
  longestStreak: number
  averageReflectionLength: number
  weeklyProgress: Array<{
    week: number
    completed: number
    total: number
  }>
}