'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { ChallengeOverviewPanel } from './challenge-overview-panel'
import { InteractiveDayGrid } from './interactive-day-grid'
import { DayTaskPanel } from './day-task-panel'
import { ProgressStreakControls } from './progress-streak-controls'
import { AnalyticsTrendsPanel } from './analytics-trends-panel'
import { ProofsReflectionsHub } from './proofs-reflections-hub'
import { SettingsToolsPanel } from './settings-tools-panel'
import { Challenge, DayProgress } from '@/types/challenge'
import { ChallengePlan } from '@/lib/generateChallengePlan'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseKey)

interface Task {
  id: number
  description: string
  tip?: string
}

interface Day {
  day: number
  tasks: Task[]
}

// ChallengePlan type is imported from @/types/challenge

interface LocalChallengePlan {
  id: string
  user_id: string
  title: string
  description: string
  category?: string
  summary?: string
  difficultyLevel?: number
  days: Day[]
  metrics?: {
    success_likelihood: number
    effort_level: string
    time_per_day: number
  }
  created_at?: string
}

interface DayStatus {
  day: number
  date: string
  status: 'completed' | 'missed' | 'pending'
  completedTasks: number[]
  reflection?: string
  proofUrl?: string
  proofType?: 'image' | 'video' | 'link'
  motivationRating?: number
  difficultyRating?: number
  completionRating?: number
}

interface AnalyticsData {
  streakCount: number
  longestStreak: number
  completionRate: number
  calendarStatus: Record<string, 'completed' | 'missed' | 'pending'>
  dailyMotivation: { day: number; value: number }[]
  dailyDifficulty: { day: number; value: number }[]
  completedCount: number
  missedCount: number
  pendingCount: number
}

interface ProofItem {
  day: number
  date: string
  proofUrl: string
  proofType: 'image' | 'video' | 'link'
  reflection?: string
  motivationRating?: number
}

export function ChallengeDashboard() {
  const params = useParams()
  const challengeId = params?.id as string
  
  const [isLoading, setIsLoading] = useState(true)
  const [challengePlan, setChallengePlan] = useState<ChallengePlan | null>(null)
  const [dayStatuses, setDayStatuses] = useState<DayStatus[]>([])
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [proofs, setProofs] = useState<ProofItem[]>([])
  
  // Fetch challenge data and day statuses
  useEffect(() => {
    const fetchChallengeData = async () => {
      if (!challengeId) {
        console.warn('No challenge ID provided');
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true)
      
      // Check if user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.warn('User not authenticated, using anonymous access');
      }
      
      try {
        // Try to fetch from challenges table first
        let { data: challengeData, error: challengeError } = await supabase
          .from('challenges')
          .select('*')
          .eq('id', challengeId)
          .single()
        
        // If not found in challenges table, try challenge_plans table
        if (challengeError) {
          console.log('Challenge not found in challenges table, trying challenge_plans table')
          const { data: planData, error: planError } = await supabase
            .from('challenge_plans')
            .select('*')
            .eq('id', challengeId)
            .single()
          
          if (planError) {
            throw planError
          }
          
          // Use the data from challenge_plans
          challengeData = planData
          challengeError = null
        }
        
        if (challengeError) throw challengeError
        
        if (!challengeData) {
          throw new Error('No challenge data found');
        }
        
        // Fetch daily progress
        const { data: progressData, error: progressError } = await supabase
          .from('daily_progress')
          .select('*')
          .eq('challenge_id', challengeId)
          .order('day', { ascending: true })
        
        if (progressError) {
          console.warn('Error fetching progress data:', {
            message: progressError.message,
            details: progressError.details,
            hint: progressError.hint,
            code: progressError.code
          });
          // Continue with empty progress data instead of throwing
        }
        
        // Process and set the data
        const plan = challengeData as ChallengePlan
        setChallengePlan(plan)
        
        // Initialize day statuses
        const statuses: DayStatus[] = Array.from({ length: 30 }, (_, i) => {
          const dayNumber = i + 1
          const startDate = new Date(plan.created_at || new Date().toISOString())
          const dayDate = new Date(startDate)
          dayDate.setDate(startDate.getDate() + i)
          
          // Find existing progress data for this day
          const existingProgress = progressData?.find(p => p.day === dayNumber)
          
          if (existingProgress) {
            return {
              day: dayNumber,
              date: dayDate.toISOString(),
              status: existingProgress.completed ? 'completed' : existingProgress.missed ? 'missed' : 'pending',
              completedTasks: existingProgress.completed_tasks || [],
              reflection: existingProgress.reflection,
              proofUrl: existingProgress.proof_url,
              proofType: existingProgress.proof_type,
              motivationRating: existingProgress.motivation_rating,
              difficultyRating: existingProgress.difficulty_rating,
              completionRating: existingProgress.completion_rating
            }
          }
          
          // Default status based on date
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          const dayDateNormalized = new Date(dayDate)
          dayDateNormalized.setHours(0, 0, 0, 0)
          
          return {
            day: dayNumber,
            date: dayDate.toISOString(),
            status: dayDateNormalized < today ? 'missed' : 'pending',
            completedTasks: []
          }
        })
        
        setDayStatuses(statuses)
        
        // Calculate analytics data
        calculateAnalytics(statuses)
        
        // Prepare proofs data
        const proofsData = statuses
          .filter(day => day.proofUrl || day.reflection)
          .map(day => ({
            day: day.day,
            date: day.date,
            proofUrl: day.proofUrl || '',
            proofType: day.proofType || 'link',
            reflection: day.reflection,
            motivationRating: day.motivationRating
          }))
        
        setProofs(proofsData)
        
      } catch (error) {
        console.error('Error fetching challenge data:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          challengeId: challengeId,
          error: error
        });
        // Set a more specific error message based on the error type
        if (error instanceof Error) {
          console.error('Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
          });
        }
        // Set a fallback challenge plan to prevent UI crashes
        setChallengePlan({
          id: challengeId,
          user_id: '',
          title: 'Challenge Not Found',
          description: 'This challenge could not be loaded. Please check if it exists or try creating a new one.',
          category: 'General',
          days: [],
          created_at: new Date().toISOString()
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchChallengeData()
  }, [challengeId])
  
  // Calculate analytics data from day statuses
  const calculateAnalytics = (statuses: DayStatus[]) => {
    // Calculate completion rate
    const completedDays = statuses.filter(day => day.status === 'completed').length
    const totalDays = statuses.length
    const completionRate = (completedDays / totalDays) * 100
    
    // Calculate streak
    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 0
    
    // Sort by day to ensure correct order
    const sortedStatuses = [...statuses].sort((a, b) => a.day - b.day)
    
    // Calculate longest streak
    for (const day of sortedStatuses) {
      if (day.status === 'completed') {
        tempStreak++
        longestStreak = Math.max(longestStreak, tempStreak)
      } else {
        tempStreak = 0
      }
    }
    
    // Calculate current streak (consecutive completed days up to today)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Reverse to start from most recent
    const reversedStatuses = [...sortedStatuses].reverse()
    
    for (const day of reversedStatuses) {
      const dayDate = new Date(day.date)
      dayDate.setHours(0, 0, 0, 0)
      
      if (dayDate > today) continue // Skip future days
      
      if (day.status === 'completed') {
        currentStreak++
      } else {
        break // Break on first non-completed day
      }
    }
    
    // Prepare calendar status data
    const calendarStatus: Record<string, 'completed' | 'missed' | 'pending'> = {}
    statuses.forEach(day => {
      const date = new Date(day.date)
      const dateStr = date.toISOString().split('T')[0] // YYYY-MM-DD format
      calendarStatus[dateStr] = day.status
    })
    
    // Prepare motivation and difficulty data
    const dailyMotivation = statuses
      .filter(day => day.motivationRating !== undefined)
      .map(day => ({
        day: day.day,
        value: day.motivationRating || 0
      }))
    
    const dailyDifficulty = statuses
      .filter(day => day.difficultyRating !== undefined)
      .map(day => ({
        day: day.day,
        value: day.difficultyRating || 0
      }))
    
    // Count by status
    const completedCount = statuses.filter(day => day.status === 'completed').length
    const missedCount = statuses.filter(day => day.status === 'missed').length
    const pendingCount = statuses.filter(day => day.status === 'pending').length
    
    setAnalyticsData({
      streakCount: currentStreak,
      longestStreak,
      completionRate,
      calendarStatus,
      dailyMotivation,
      dailyDifficulty,
      completedCount,
      missedCount,
      pendingCount
    })
  }
  
  // Handle day selection
  const handleDayClick = (day: number) => {
    setSelectedDay(day)
  }
  
  // Handle day submission
  const handleDaySubmit = async (day: number, data: {
    completedTasks: number[],
    reflection?: string,
    proofUrl?: string,
    proofType?: 'image' | 'video' | 'link',
    motivationRating?: number,
    difficultyRating?: number,
    completionRating?: number
  }) => {
    try {
      // Update in Supabase
      const { error } = await supabase
        .from('daily_progress')
        .upsert({
          challenge_id: challengeId,
          day,
          completed: data.completedTasks.length > 0,
          missed: false,
          completed_tasks: data.completedTasks,
          reflection: data.reflection,
          proof_url: data.proofUrl,
          proof_type: data.proofType,
          motivation_rating: data.motivationRating,
          difficulty_rating: data.difficultyRating,
          completion_rating: data.completionRating,
          updated_at: new Date().toISOString()
        })
      
      if (error) throw error
      
      // Update local state
      setDayStatuses(prev => {
        const updated = prev.map(status => {
          if (status.day === day) {
            return {
              ...status,
              status: data.completedTasks.length > 0 ? 'completed' : 'pending',
              completedTasks: data.completedTasks,
              reflection: data.reflection,
              proofUrl: data.proofUrl,
              proofType: data.proofType,
              motivationRating: data.motivationRating,
              difficultyRating: data.difficultyRating,
              completionRating: data.completionRating
            }
          }
          return status
        })
        
        // Recalculate analytics with updated statuses
        calculateAnalytics(updated)
        
        // Update proofs data
        const updatedProofs = updated
          .filter(day => day.proofUrl || day.reflection)
          .map(day => ({
            day: day.day,
            date: day.date,
            proofUrl: day.proofUrl || '',
            proofType: day.proofType || 'link',
            reflection: day.reflection,
            motivationRating: day.motivationRating
          }))
        
        setProofs(updatedProofs)
        
        return updated
      })
      
      // Close the day panel
      setSelectedDay(null)
      
    } catch (error) {
      console.error('Error updating day progress:', error)
    }
  }
  
  // Handle challenge reset
  const handleResetChallenge = async () => {
    try {
      // Delete all progress from Supabase
      const { error } = await supabase
        .from('daily_progress')
        .delete()
        .eq('challenge_id', challengeId)
      
      if (error) throw error
      
      // Reset local state
      if (challengePlan) {
        const resetStatuses: DayStatus[] = Array.from({ length: 30 }, (_, i) => {
          const dayNumber = i + 1
          const startDate = new Date(challengePlan.createdAt)
          const dayDate = new Date(startDate)
          dayDate.setDate(startDate.getDate() + i)
          
          // Default status based on date
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          const dayDateNormalized = new Date(dayDate)
          dayDateNormalized.setHours(0, 0, 0, 0)
          
          return {
            day: dayNumber,
            date: dayDate.toISOString(),
            status: dayDateNormalized < today ? 'missed' : 'pending',
            completedTasks: []
          }
        })
        
        setDayStatuses(resetStatuses)
        calculateAnalytics(resetStatuses)
        setProofs([])
      }
      
    } catch (error) {
      console.error('Error resetting challenge:', error)
    }
  }
  
  // Handle export progress
  const handleExportProgress = () => {
    if (!challengePlan || !dayStatuses.length) return
    
    // Create CSV content
    const headers = ['Day', 'Date', 'Status', 'Completed Tasks', 'Motivation', 'Difficulty', 'Reflection']
    const rows = dayStatuses.map(day => [
      day.day,
      new Date(day.date).toLocaleDateString(),
      day.status,
      day.completedTasks.length,
      day.motivationRating || '',
      day.difficultyRating || '',
      day.reflection ? `"${day.reflection.replace(/"/g, '""')}"` : ''
    ])
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')
    
    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `${challengePlan.title.replace(/\s+/g, '_')}_progress.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
  
  // Handle share snapshot
  const handleShareSnapshot = () => {
    // This would typically generate a shareable image or link
    // For now, we'll just simulate it with a console log
    console.log('Sharing challenge snapshot:', {
      challengeId,
      title: challengePlan?.title,
      completionRate: analyticsData?.completionRate,
      streakCount: analyticsData?.streakCount
    })
    
    // In a real implementation, this would generate a social card image
    // and provide sharing options for social media
  }
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading challenge dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  // Show error state if challenge couldn't be loaded
  if (!challengePlan || challengePlan.title === 'Challenge Not Found') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Challenge Not Found</h2>
              <p className="text-gray-600 mb-6">
                The challenge you're looking for doesn't exist or couldn't be loaded.
              </p>
              <div className="space-y-3">
                <button 
                  onClick={() => window.location.href = '/dashboard'}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Go to Dashboard
                </button>
                <button 
                  onClick={() => window.location.href = '/create-challenge'}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Create New Challenge
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
            <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
            <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
            <div className="h-60 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Challenge Overview Panel */}
        <ChallengeOverviewPanel 
          title={challengePlan.title}
          description={challengePlan.description}
          category={challengePlan.category || 'General'}
          summary={challengePlan.summary}
          successLikelihood={challengePlan.metrics?.success_likelihood || 0}
          difficultyLevel={challengePlan.difficultyLevel || 30}
          timePerDay={challengePlan.metrics?.time_per_day || 0}
        />
        
        {/* Progress & Streak Controls */}
        <ProgressStreakControls 
          completedDays={analyticsData.completedCount}
          totalDays={30}
          streakCount={analyticsData.streakCount}
          longestStreak={analyticsData.longestStreak}
          endDate={new Date(dayStatuses[29].date)}
        />
        
        {/* Interactive Day Grid */}
        <InteractiveDayGrid 
          days={challengePlan.days}
          progress={dayStatuses.map(status => ({
            day: status.day,
            status: status.status,
            hasReflection: !!status.reflection,
            hasProof: !!status.proofUrl
          }))}
          onDayClick={handleDayClick}
        />
        
        {/* Analytics & Trends Panel */}
        <AnalyticsTrendsPanel 
          dailyData={analyticsData.dailyMotivation.map((item, index) => ({
            day: item.day,
            motivation: item.value,
            difficulty: analyticsData.dailyDifficulty[index]?.value || 0
          }))}
          completionData={[
            { name: 'Completed', value: analyticsData.completedCount, color: '#10b981' },
            { name: 'Missed', value: analyticsData.missedCount, color: '#ef4444' },
            { name: 'Pending', value: analyticsData.pendingCount, color: '#6b7280' }
          ]}
          calendarStatus={analyticsData.calendarStatus}
          weeklyInsight="Keep up the great work! Your consistency is improving."
        />
        
        {/* Proofs & Reflections Hub */}
        <ProofsReflectionsHub proofs={proofs} />
        
        {/* Day Task Panel (Modal) */}
        {selectedDay !== null && challengePlan.days[selectedDay - 1] && (
          <DayTaskPanel 
            isOpen={selectedDay !== null}
            onClose={() => setSelectedDay(null)}
            day={selectedDay}
            date={dayStatuses[selectedDay - 1].date}
            tasks={challengePlan.days[selectedDay - 1].tasks}
            initialData={{
              completedTasks: dayStatuses[selectedDay - 1].completedTasks,
              reflection: dayStatuses[selectedDay - 1].reflection,
              proofUrl: dayStatuses[selectedDay - 1].proofUrl,
              proofType: dayStatuses[selectedDay - 1].proofType,
              motivationRating: dayStatuses[selectedDay - 1].motivationRating,
              difficultyRating: dayStatuses[selectedDay - 1].difficultyRating,
              completionRating: dayStatuses[selectedDay - 1].completionRating
            }}
            onSubmit={(data) => handleDaySubmit(selectedDay, data)}
          />
        )}
        
        {/* Settings & Tools Panel */}
        <SettingsToolsPanel 
          challengeId={challengeId}
          onResetChallenge={handleResetChallenge}
          onExportProgress={handleExportProgress}
          onShareSnapshot={handleShareSnapshot}
        />
      </div>
    </div>
  )
}