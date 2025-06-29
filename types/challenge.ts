export interface DayTask {
  task_id?: number
  title: string
  task?: string
  completed?: boolean
  tip?: string
}

export interface Day {
  day: number
  tasks: DayTask[]
  tips?: string[]
  bonus_task?: string
  difficulty_rating?: number
}

export interface DayStatus {
  day: number
  status: 'completed' | 'missed' | 'pending'
  hasReflection: boolean
  hasProof: boolean
  date: string
  completedTasks?: number[]
  reflection?: string
  proofUrl?: string
  proofType?: 'link' | 'video' | 'image'
  motivationRating?: number
  difficultyRating?: number
  completionRating?: number
}

export type CalendarStatus = Record<string, 'completed' | 'missed' | 'pending'>

export interface ChallengePlan {
  id: string
  user_id: string
  title: string
  description: string
  category?: string
  summary?: string
  difficultyLevel?: number
  createdAt?: string
  created_at?: string
  duration_days?: number
  daily_progress?: any[]
  days: Array<{
    day: number
    date?: string
    tasks: string[] | DayTask[]
    tips?: string[]
    bonus_task?: string
    difficulty_rating?: number
  }>
  metrics: {
    success_likelihood: number
    effort_level: string
    time_per_day: number
    difficulty_level?: string
    specific_goals?: string[]
    potential_obstacles?: string[]
  }
  specific_goals?: string[]
  potential_obstacles?: string[]
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

export interface DayData {
  day: number
  tasks: DayTask[]
  motivation?: number
  reflection?: string
  proof_file?: string
  difficulty_rating?: number
  completion_rating?: number
  timestamp?: string
  status?: 'completed' | 'missed' | 'pending' | 'complete' | 'neutral' | 'partial'
  hasProof?: boolean
  hasReflection?: boolean
}

export interface DayProgress {
  id: string
  challenge_id: string
  user_id: string
  day: number
  completed: boolean
  completed_tasks?: boolean[]
  proof_file?: string
  proof_text?: string
  motivation_rating?: number
  difficulty_rating?: number
  completion_rating?: number
  motivation?: number
  completed_at?: string
  reflection?: string
  ai_feedback?: string
  created_at?: string
  updated_at?: string
  status?: 'completed' | 'missed' | 'pending'
  hasProof?: boolean
  hasReflection?: boolean
}

export interface AnalyticsData {
  totalDays: number
  completedDays: number
  completionRate: number
  currentStreak: number
  longestStreak: number
  averageReflectionLength: number
  streakCount: number
  missedDays: number
  dailyMotivation: Array<{ day: number; motivation: number; difficulty: number; }>
  calendarStatus: Record<string, 'completed' | 'missed'>
  motivationTrend: Array<{
    day: number
    motivation: number
    difficulty: number
    completion: number
  }>
  weeklyProgress: Array<{
    week: number
    completed: number
    missed: number
    total: number
  }>
}