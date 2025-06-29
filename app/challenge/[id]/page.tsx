'use client'

import { useState, useEffect } from 'react'

// Force dynamic rendering for user-specific data
export const dynamic = 'force-dynamic'
export const revalidate = 0

// Required for App Router dynamic routes
export async function generateStaticParams() {
  // Return empty array to force dynamic rendering at request time
  // This prevents build-time static generation issues
  return []
}
import { useParams } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Circle } from 'lucide-react'
import { DayModal } from '@/components/day-modal'
import { AnalyticsPanel } from '@/components/analytics/analytics-panel'
import { ChallengePlan, AnalyticsData, DayStatus } from '@/types/challenge'

interface LocalChallengePlan {
  id: string
  title: string
  description: string
  metrics: {
    success_likelihood: number
    effort_level: string
    time_per_day: number
  }
  days: Array<{
    day: number
    tasks: string[]
    tips?: string[]
    bonus_task?: string
  }>
}



export default function ChallengePage() {
  const params = useParams()
  const [challengePlan, setChallengePlan] = useState<ChallengePlan | null>(null)
  const [dayStatuses, setDayStatuses] = useState<DayStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)

  const supabase = createSupabaseClient()

  useEffect(() => {
    fetchChallengeData()
  }, [])

  const fetchChallengeData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch challenge plan
      const { data: planData, error: planError } = await supabase
        .from('challenges')
        .select('*')
        .eq('id', params.id)
        .single()

      if (planError) throw planError
      setChallengePlan(planData)

      // Fetch day statuses
      const { data: statusData, error: statusError } = await supabase
        .from('daily_progress')
        .select('*')
        .eq('challenge_id', params.id)
        .eq('user_id', user.id)

      if (statusError) throw statusError
      setDayStatuses(statusData || [])

      // Calculate analytics data
      const completedDays = statusData?.filter(day => day.status === 'completed').length || 0
      const missedDays = statusData?.filter(day => day.status === 'missed').length || 0
      const completionRate = Math.round((completedDays / 30) * 100)

      // Calculate streak
      let currentStreak = 0
      const sortedStatuses = [...(statusData || [])].sort((a, b) => b.day - a.day)
      for (const status of sortedStatuses) {
        if (status.status === 'completed') currentStreak++
        else break
      }

      // Format calendar status
      const calendarStatus: Record<string, 'completed' | 'missed'> = {}
      statusData?.forEach(day => {
        const date = new Date()
        date.setDate(date.getDate() - (30 - day.day))
        calendarStatus[date.toISOString().split('T')[0]] = day.status
      })

      // Format daily motivation data
      const dailyMotivation = statusData
        ?.filter(day => day.status === 'completed')
        ?.map(day => ({
          day: day.day,
          motivation: day.motivation_rating || 0,
          difficulty: 5 // Default difficulty, can be adjusted based on actual data
        })) || []

      setAnalyticsData({
        totalDays: challengePlan?.days?.length || 30,
        completedDays: dayStatuses.filter(d => d.status === 'completed').length,
        completionRate,
        currentStreak,
        longestStreak: currentStreak,
        averageReflectionLength: 0,
        streakCount: currentStreak,
        missedDays: dayStatuses.filter(d => d.status === 'missed').length,
        dailyMotivation: dayStatuses.map((status, index) => ({
          day: index + 1,
          motivation: status.motivationRating || 0,
          difficulty: status.difficultyRating || 0
        })),
        calendarStatus: dayStatuses.reduce((acc, status, index) => {
          acc[`day-${index + 1}`] = status.status === 'pending' ? 'missed' : (status.status === 'completed' ? 'completed' : 'missed')
          return acc
        }, {} as Record<string, 'completed' | 'missed'>),
        motivationTrend: dayStatuses.map((status, index) => ({
          day: index + 1,
          motivation: status.motivationRating || 0,
          difficulty: status.difficultyRating || 0,
          completion: status.completionRating || 0
        })),
        weeklyProgress: []
      })
    } catch (error) {
      console.error('Error fetching challenge data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (!challengePlan) {
    return <div>Challenge not found</div>
  }

  const completedDays = dayStatuses.filter(day => day.status === 'completed').length
  const progress = (completedDays / 30) * 100

  return (
    <div className="container max-w-6xl py-8 space-y-8">
      <Card className="bg-gradient-to-br from-teal-50 to-white">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl font-bold text-teal-900">{challengePlan.title}</CardTitle>
              <p className="text-sm text-teal-600 mt-1">Your 30-day journey to success</p>
            </div>
            <div className="flex gap-3">
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-xl font-bold text-teal-700">{challengePlan.metrics.success_likelihood}%</div>
                    <div className="text-xs text-teal-600">Success</div>
                  </div>
                </div>
                <svg className="w-20 h-20 transform -rotate-90">
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    className="stroke-current text-teal-100"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    className="stroke-current text-teal-500"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 36}`}
                    strokeDashoffset={`${2 * Math.PI * 36 * (1 - challengePlan.metrics.success_likelihood / 100)}`}
                  />
                </svg>
              </div>
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-xl font-bold text-blue-700">{challengePlan.metrics.time_per_day}</div>
                    <div className="text-xs text-blue-600">mins/day</div>
                  </div>
                </div>
                <svg className="w-20 h-20 transform -rotate-90">
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    className="stroke-current text-blue-100"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    className="stroke-current text-blue-500"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 36}`}
                    strokeDashoffset={`${2 * Math.PI * 36 * (1 - challengePlan.metrics.time_per_day / 60)}`}
                  />
                </svg>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose mb-6 text-gray-700">
            <p>{challengePlan.description}</p>
          </div>
          
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Your Progress</h3>
                <p className="text-sm text-gray-500 mt-1">{completedDays}/30 days completed</p>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <Badge variant="outline" className="bg-green-50 gap-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  {completedDays} Done
                </Badge>
                <Badge variant="outline" className="bg-red-50 gap-1">
                  <XCircle className="w-4 h-4 text-red-500" />
                  {dayStatuses.filter(d => d.status === 'missed').length} Missed
                </Badge>
                <Badge variant="outline" className="bg-gray-50 gap-1">
                  <Circle className="w-4 h-4 text-gray-400" />
                  {30 - completedDays - dayStatuses.filter(d => d.status === 'missed').length} Left
                </Badge>
              </div>
            </div>
            
            <div className="relative">
              <Progress value={progress} className="h-3 rounded-full bg-gray-100" />
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-teal-500 text-white">{Math.round(progress)}%</Badge>
              </div>
            </div>
            
            <motion.div 
              className="grid grid-cols-6 gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {Array.from({ length: 30 }, (_, i) => {
                const dayStatus = dayStatuses.find(d => d.day === i + 1)?.status || 'inactive'
                const hasReflection = dayStatuses.find(d => d.day === i + 1)?.reflection
                const hasProof = dayStatuses.find(d => d.day === i + 1)?.proofUrl
                
                return (
                  <motion.div
                    key={i}
                    className={`relative aspect-square rounded-xl flex flex-col items-center justify-center cursor-pointer shadow-sm transition-shadow
                      ${dayStatus === 'completed' ? 'bg-gradient-to-br from-green-50 to-green-100 hover:shadow-md' : ''}
                      ${dayStatus === 'missed' ? 'bg-gradient-to-br from-red-50 to-red-100 hover:shadow-md' : ''}
                      ${dayStatus === 'inactive' ? 'bg-gradient-to-br from-gray-50 to-gray-100 hover:shadow-md' : ''}
                    `}
                    whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedDay(i + 1)}
                  >
                    <span className="text-sm font-medium mb-1">Day {i + 1}</span>
                    {dayStatus === 'completed' && (
                      <>
                        <CheckCircle className="w-6 h-6 text-green-500" />
                        {(hasReflection || hasProof) && (
                          <div className="absolute top-1 right-1 flex gap-1">
                            {hasReflection && <div className="w-2 h-2 rounded-full bg-blue-400" />}
                            {hasProof && <div className="w-2 h-2 rounded-full bg-purple-400" />}
                          </div>
                        )}
                      </>
                    )}
                    {dayStatus === 'missed' && <XCircle className="w-6 h-6 text-red-500" />}
                    {dayStatus === 'inactive' && <Circle className="w-6 h-6 text-gray-300" />}
                  </motion.div>
                )
              })}
            </motion.div>
            
            <div className="flex justify-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-blue-400" />
                Has Reflection
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-purple-400" />
                Has Proof
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {analyticsData && (
        <AnalyticsPanel
          completionRate={analyticsData.completionRate}
          streakCount={analyticsData.streakCount}
          missedDays={analyticsData.missedDays}
          dailyMotivation={analyticsData.dailyMotivation}
          calendarStatus={analyticsData.calendarStatus}
        />
      )}

      {selectedDay && challengePlan.days[selectedDay - 1] && (
        <DayModal
          isOpen={true}
          onClose={() => setSelectedDay(null)}
          day={selectedDay}
          tasks={challengePlan.days[selectedDay - 1].tasks.map(task => 
            typeof task === 'string' ? task : task.title || ''
          )}
          tips={challengePlan.days[selectedDay - 1].tips}
          onSubmit={async (data) => {
            try {
              const { data: { user } } = await supabase.auth.getUser()
              if (!user) return

              // Save progress to database
              const { error } = await supabase.from('daily_progress').upsert({
                challenge_id: params.id,
                user_id: user.id,
                day: selectedDay,
                status: 'completed',
                completed_tasks: data.completedTasks,
                reflection: data.reflection,
                proof_url: data.proofUrl,
                motivation_rating: data.motivationRating
              })

              if (error) throw error

              // Update local state
              setDayStatuses(prev => [
                ...prev.filter(d => d.day !== selectedDay),
                { 
                  day: selectedDay, 
                  status: 'completed',
                  hasReflection: false,
                  hasProof: false,
                  date: new Date().toISOString().split('T')[0]
                }
              ])

              // Close modal after successful submission
              setTimeout(() => setSelectedDay(null), 2000)
            } catch (error) {
              console.error('Error saving progress:', error)
            }
          }}
        />
      )}
    </div>
  )
}