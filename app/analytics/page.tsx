'use client'

import { useState, useEffect } from 'react'
import { createSupabaseClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Challenge, DayProgress, AnalyticsData } from '@/types/challenge'
import { ChallengePlan } from '@/lib/generateChallengePlan'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { motion } from 'framer-motion'
import { 
  Calendar, 
  Clock, 
  BarChart, 
  Flame, 
  TrendingUp, 
  Target, 
  Award, 
  Camera,
  MessageSquare,
  Download,
  Settings,
  RefreshCw,
  Share,
  Filter,
  Eye,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import DayModal from '@/components/analytics/day-modal'
import { toast } from 'sonner'
import { format, addDays, startOfMonth, endOfMonth } from 'date-fns'
import dynamic from 'next/dynamic'

// Dynamic imports for charts to avoid SSR issues
const ResponsiveContainer = dynamic(
  () => import('recharts').then((mod) => mod.ResponsiveContainer),
  { ssr: false }
)

const LineChart = dynamic(
  () => import('recharts').then((mod) => mod.LineChart),
  { ssr: false }
)

const Line = dynamic(
  () => import('recharts').then((mod) => mod.Line),
  { ssr: false }
)

const BarChart = dynamic(
  () => import('recharts').then((mod) => mod.BarChart),
  { ssr: false }
)

const Bar = dynamic(
  () => import('recharts').then((mod) => mod.Bar),
  { ssr: false }
)

const CartesianGrid = dynamic(
  () => import('recharts').then((mod) => mod.CartesianGrid),
  { ssr: false }
)

const XAxis = dynamic(
  () => import('recharts').then((mod) => mod.XAxis),
  { ssr: false }
)

const YAxis = dynamic(
  () => import('recharts').then((mod) => mod.YAxis),
  { ssr: false }
)

const Tooltip = dynamic(
  () => import('recharts').then((mod) => mod.Tooltip),
  { ssr: false }
)

const Legend = dynamic(
  () => import('recharts').then((mod) => mod.Legend),
  { ssr: false }
)

// DayProgress and Challenge types are imported from @/types/challenge

interface LocalAnalyticsData {
  totalDaysCompleted: number
  currentStreak: number
  longestStreak: number
  daysRemaining: number
  projectedCompletionDate: string
  overallCompletionRate: number
  motivationTrend: Array<{ day: number; motivation: number; difficulty: number; completion: number }>
  weeklyProgress: Array<{ week: string; completed: number; missed: number }>
  calendarHeatmap: Array<{ date: string; intensity: number }>
  consistencyIndex: number
  proofsCount: number
  reflectionsCount: number
}

export default function AnalyticsDashboard() {
  const [loading, setLoading] = useState(true)
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null)
  const [dailyProgress, setDailyProgress] = useState<DayProgress[]>([])
  const [analyticsData, setAnalyticsData] = useState<LocalAnalyticsData | null>(null)
  const [expandedSections, setExpandedSections] = useState({
    overview: true,
    grid: true,
    analytics: false,
    proofs: false
  })
  const [filterOptions, setFilterOptions] = useState({
    showOnlyWithProofs: false,
    showOnlyHighDifficulty: false,
    showOnlySkipped: false
  })
  const [mounted, setMounted] = useState(false)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [isDayModalOpen, setIsDayModalOpen] = useState(false)
  
  const router = useRouter()
  const supabase = createSupabaseClient()

  useEffect(() => {
    setMounted(true)
    fetchUserChallenges()
  }, [])

  useEffect(() => {
    if (selectedChallenge) {
      fetchChallengeProgress(selectedChallenge.id)
    }
  }, [selectedChallenge])

  const fetchUserChallenges = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/auth/signin')
        return
      }

      // Fetch challenges from both tables
      const { data: challengesData, error: challengesError } = await supabase
        .from('challenges')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      const { data: plansData, error: plansError } = await supabase
        .from('challenge_plans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      // Combine and deduplicate
      const allChallenges = [...(challengesData || []), ...(plansData || [])]
      const uniqueChallenges = allChallenges.filter((challenge, index, self) => 
        index === self.findIndex(c => c.id === challenge.id)
      )

      setChallenges(uniqueChallenges)
      
      if (uniqueChallenges.length > 0 && !selectedChallenge) {
        setSelectedChallenge(uniqueChallenges[0])
      }
    } catch (error) {
      console.error('Error fetching challenges:', error)
      toast.error('Failed to load challenges')
    } finally {
      setLoading(false)
    }
  }

  const fetchChallengeProgress = async (challengeId: string) => {
    try {
      const { data: progressData, error } = await supabase
        .from('daily_progress')
        .select('*')
        .eq('challenge_id', challengeId)
        .order('day', { ascending: true })

      if (error) throw error

      setDailyProgress(progressData || [])
      calculateAnalytics(progressData || [])
    } catch (error) {
      console.error('Error fetching progress:', error)
      toast.error('Failed to load progress data')
    }
  }

  const calculateAnalytics = (progress: DayProgress[]) => {
    const completedDays = progress.filter(p => 
      Array.isArray(p.completed_tasks) && p.completed_tasks.some(task => task === true)
    )
    
    const totalDaysCompleted = completedDays.length
    const overallCompletionRate = (totalDaysCompleted / 30) * 100
    
    // Calculate current streak
    let currentStreak = 0
    const sortedProgress = [...progress].sort((a, b) => b.day - a.day)
    
    for (const dayProgress of sortedProgress) {
      if (Array.isArray(dayProgress.completed_tasks) && 
          dayProgress.completed_tasks.some(task => task === true)) {
        currentStreak++
      } else {
        break
      }
    }
    
    // Calculate longest streak
    let longestStreak = 0
    let tempStreak = 0
    
    progress.forEach(dayProgress => {
      if (Array.isArray(dayProgress.completed_tasks) && 
          dayProgress.completed_tasks.some(task => task === true)) {
        tempStreak++
        longestStreak = Math.max(longestStreak, tempStreak)
      } else {
        tempStreak = 0
      }
    })
    
    const daysRemaining = 30 - totalDaysCompleted
    const projectedCompletionDate = format(
      addDays(new Date(), daysRemaining), 
      'MMM dd, yyyy'
    )
    
    // Motivation trend data
    const motivationTrend = progress.map(p => ({
      day: p.day,
      motivation: p.motivation_rating || Math.floor(Math.random() * 10) + 1,
      difficulty: p.difficulty_rating || Math.floor(Math.random() * 10) + 1,
      completion: p.completion_rating || (p.completed_tasks?.some(t => t) ? 8 : 3)
    }))
    
    // Weekly progress
    const weeklyProgress = []
    for (let week = 0; week < 5; week++) {
      const weekStart = week * 7 + 1
      const weekEnd = Math.min((week + 1) * 7, 30)
      const weekData = progress.filter(p => p.day >= weekStart && p.day <= weekEnd)
      
      weeklyProgress.push({
        week: `Week ${week + 1}`,
        completed: weekData.filter(p => p.completed_tasks?.some(t => t)).length,
        missed: weekData.filter(p => !p.completed_tasks?.some(t => t)).length
      })
    }
    
    // Calendar heatmap
    const calendarHeatmap = progress.map(p => ({
      date: format(addDays(new Date(), p.day - 30), 'yyyy-MM-dd'),
      intensity: p.completed_tasks?.filter(t => t).length || 0
    }))
    
    // Consistency index (custom metric)
    const consistencyIndex = Math.round(
      (currentStreak / 30) * 40 + 
      (overallCompletionRate / 100) * 40 + 
      (longestStreak / 30) * 20
    )
    
    const proofsCount = progress.filter(p => p.proof_file).length
    const reflectionsCount = progress.filter(p => p.proof_text && p.proof_text.length > 10).length
    
    setAnalyticsData({
      totalDaysCompleted,
      currentStreak,
      longestStreak,
      daysRemaining,
      projectedCompletionDate,
      overallCompletionRate,
      motivationTrend,
      weeklyProgress,
      calendarHeatmap,
      consistencyIndex,
      proofsCount,
      reflectionsCount
    })
  }

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const openDayModal = (day: number) => {
    setSelectedDay(day)
    setIsDayModalOpen(true)
  }

  const closeDayModal = () => {
    setSelectedDay(null)
    setIsDayModalOpen(false)
  }

  const handleProgressUpdate = (progress: DayProgress) => {
    setDailyProgress(prev => {
      const updated = prev.filter(p => p.day !== progress.day)
      updated.push(progress)
      return updated.sort((a, b) => a.day - b.day)
    })
    
    // Recalculate analytics with updated data
    const updatedProgress = dailyProgress.filter(p => p.day !== progress.day)
    updatedProgress.push(progress)
    calculateAnalytics(updatedProgress.sort((a, b) => a.day - b.day))
  }

  const exportData = () => {
    if (!analyticsData || !selectedChallenge) return
    
    const csvData = [
      ['Day', 'Completed Tasks', 'Motivation', 'Difficulty', 'Proof', 'Reflection'],
      ...dailyProgress.map(p => [
        p.day,
        p.completed_tasks?.filter(t => t).length || 0,
        p.motivation_rating || 'N/A',
        p.difficulty_rating || 'N/A',
        p.proof_file ? 'Yes' : 'No',
        p.proof_text ? 'Yes' : 'No'
      ])
    ]
    
    const csvContent = csvData.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${selectedChallenge.title}-analytics.csv`
    a.click()
    URL.revokeObjectURL(url)
    
    toast.success('Analytics data exported successfully!')
  }

  if (!mounted) {
    return null
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (challenges.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <Card className="text-center py-12">
          <CardContent>
            <BarChart className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">No Challenges Found</h3>
            <p className="text-gray-600 mb-4">Create your first challenge to start tracking analytics.</p>
            <Button onClick={() => router.push('/generate')}>Create Challenge</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-gray-600">Track your progress, habits, and motivation across your 30-day challenge</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <select 
            className="px-3 py-2 border rounded-md"
            value={selectedChallenge?.id || ''}
            onChange={(e) => {
              const challenge = challenges.find(c => c.id === e.target.value)
              setSelectedChallenge(challenge || null)
            }}
          >
            {challenges.map(challenge => (
              <option key={challenge.id} value={challenge.id}>
                {challenge.title}
              </option>
            ))}
          </select>
          
          <Button variant="outline" onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          
          <Button variant="outline" onClick={() => fetchChallengeProgress(selectedChallenge?.id || '')}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {selectedChallenge && analyticsData && (
        <>
          {/* Dashboard Overview Panel */}
          <Card>
            <CardHeader className="cursor-pointer" onClick={() => toggleSection('overview')}>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <BarChart className="h-5 w-5" />
                  Dashboard Overview
                </CardTitle>
                {expandedSections.overview ? <ChevronUp /> : <ChevronDown />}
              </div>
            </CardHeader>
            
            {expandedSections.overview && (
              <CardContent className="space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 border-0">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Days Completed</p>
                          <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                            {analyticsData.totalDaysCompleted} / 30
                          </p>
                        </div>
                        <Target className="h-8 w-8 text-blue-500" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-900/10 border-0">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-orange-700 dark:text-orange-300">Current Streak</p>
                          <p className="text-2xl font-bold text-orange-900 dark:text-orange-100 flex items-center gap-1">
                            🔥 {analyticsData.currentStreak}
                          </p>
                        </div>
                        <Flame className="h-8 w-8 text-orange-500" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/10 border-0">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-green-700 dark:text-green-300">Days Remaining</p>
                          <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                            {analyticsData.daysRemaining}
                          </p>
                        </div>
                        <Clock className="h-8 w-8 text-green-500" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/10 border-0">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Completion Rate</p>
                          <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                            {Math.round(analyticsData.overallCompletionRate)}%
                          </p>
                        </div>
                        <Award className="h-8 w-8 text-purple-500" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-900/10 border-0">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-teal-700 dark:text-teal-300">Consistency</p>
                          <p className="text-2xl font-bold text-teal-900 dark:text-teal-100">
                            {analyticsData.consistencyIndex}%
                          </p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-teal-500" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Overall Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Overall Progress</span>
                    <span>{Math.round(analyticsData.overallCompletionRate)}%</span>
                  </div>
                  <Progress value={analyticsData.overallCompletionRate} className="h-3" />
                </div>
                
                {/* Projected Completion */}
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Projected Completion Date</p>
                  <p className="text-lg font-semibold">{analyticsData.projectedCompletionDate}</p>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Challenge Grid Panel */}
          <Card>
            <CardHeader className="cursor-pointer" onClick={() => toggleSection('grid')}>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  30-Day Challenge Grid
                </CardTitle>
                {expandedSections.grid ? <ChevronUp /> : <ChevronDown />}
              </div>
            </CardHeader>
            
            {expandedSections.grid && (
              <CardContent>
                <div className="grid grid-cols-6 md:grid-cols-10 gap-2">
                  {Array.from({ length: 30 }, (_, i) => {
                    const day = i + 1
                    const dayProgress = dailyProgress.find(p => p.day === day)
                    const isCompleted = dayProgress?.completed_tasks?.some(task => task === true)
                    const hasProof = dayProgress?.proof_file
                    const hasReflection = dayProgress?.proof_text && dayProgress.proof_text.length > 10
                    
                    return (
                      <motion.div
                        key={day}
                        className={`
                          relative aspect-square rounded-lg border-2 cursor-pointer transition-all duration-200
                          flex items-center justify-center text-sm font-medium
                          ${
                            isCompleted 
                              ? 'bg-green-100 border-green-300 text-green-800 hover:bg-green-200' 
                              : dayProgress 
                              ? 'bg-red-100 border-red-300 text-red-800 hover:bg-red-200'
                              : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'
                          }
                        `}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openDayModal(day)}
                      >
                        <span>{day}</span>
                        
                        {/* Indicators */}
                        <div className="absolute top-1 right-1 flex gap-1">
                          {hasProof && <Camera className="h-3 w-3 text-blue-600" />}
                          {hasReflection && <MessageSquare className="h-3 w-3 text-purple-600" />}
                        </div>
                        
                        {/* Bonus task indicator */}
                        {dayProgress?.completion_rating && dayProgress.completion_rating > 8 && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
                        )}
                      </motion.div>
                    )
                  })}
                </div>
                
                {/* Legend */}
                <div className="flex flex-wrap gap-4 mt-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-100 border-2 border-green-300 rounded"></div>
                    <span>Completed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-100 border-2 border-red-300 rounded"></div>
                    <span>Missed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-100 border-2 border-gray-300 rounded"></div>
                    <span>Upcoming</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Camera className="h-4 w-4 text-blue-600" />
                    <span>Has Proof</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-purple-600" />
                    <span>Has Reflection</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <span>Bonus Achievement</span>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Analytics Section */}
          <Card>
            <CardHeader className="cursor-pointer" onClick={() => toggleSection('analytics')}>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Analytics & Trends
                </CardTitle>
                {expandedSections.analytics ? <ChevronUp /> : <ChevronDown />}
              </div>
            </CardHeader>
            
            {expandedSections.analytics && (
              <CardContent className="space-y-6">
                <Tabs defaultValue="motivation" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="motivation">Motivation Trends</TabsTrigger>
                    <TabsTrigger value="weekly">Weekly Progress</TabsTrigger>
                    <TabsTrigger value="heatmap">Activity Heatmap</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="motivation" className="space-y-4">
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={analyticsData.motivationTrend}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="day" />
                          <YAxis domain={[0, 10]} />
                          <Tooltip />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="motivation" 
                            stroke="#3b82f6" 
                            strokeWidth={2}
                            name="Motivation"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="difficulty" 
                            stroke="#ef4444" 
                            strokeWidth={2}
                            name="Difficulty"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="completion" 
                            stroke="#10b981" 
                            strokeWidth={2}
                            name="Completion"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="weekly" className="space-y-4">
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analyticsData.weeklyProgress}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="week" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="completed" fill="#10b981" name="Completed" />
                          <Bar dataKey="missed" fill="#ef4444" name="Missed" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="heatmap" className="space-y-4">
                    <div className="grid grid-cols-7 gap-1">
                      {analyticsData.calendarHeatmap.map((day, index) => (
                        <div
                          key={index}
                          className={`
                            aspect-square rounded text-xs flex items-center justify-center
                            ${
                              day.intensity === 0 ? 'bg-gray-100' :
                              day.intensity === 1 ? 'bg-green-200' :
                              day.intensity === 2 ? 'bg-green-400' :
                              'bg-green-600 text-white'
                            }
                          `}
                          title={`${day.date}: ${day.intensity} tasks completed`}
                        >
                          {day.intensity}
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
                
                {/* AI Weekly Insight */}
                <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      🧠 AI Weekly Insight
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Your motivation peaked around day {analyticsData.motivationTrend.reduce((max, curr) => 
                        curr.motivation > max.motivation ? curr : max
                      ).day}. Consider reinforcing similar habits and maintaining that momentum. 
                      Your consistency index of {analyticsData.consistencyIndex}% shows strong commitment!
                    </p>
                  </CardContent>
                </Card>
              </CardContent>
            )}
          </Card>

          {/* Proofs & Reflections Panel */}
          <Card>
            <CardHeader className="cursor-pointer" onClick={() => toggleSection('proofs')}>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Proofs & Reflections ({analyticsData.proofsCount} proofs, {analyticsData.reflectionsCount} reflections)
                </CardTitle>
                {expandedSections.proofs ? <ChevronUp /> : <ChevronDown />}
              </div>
            </CardHeader>
            
            {expandedSections.proofs && (
              <CardContent className="space-y-4">
                {/* Filter Options */}
                <div className="flex flex-wrap gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filterOptions.showOnlyWithProofs}
                      onChange={(e) => setFilterOptions(prev => ({
                        ...prev,
                        showOnlyWithProofs: e.target.checked
                      }))}
                    />
                    <span className="text-sm">Only show days with uploads</span>
                  </label>
                  
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filterOptions.showOnlyHighDifficulty}
                      onChange={(e) => setFilterOptions(prev => ({
                        ...prev,
                        showOnlyHighDifficulty: e.target.checked
                      }))}
                    />
                    <span className="text-sm">Only show high-difficulty days</span>
                  </label>
                  
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filterOptions.showOnlySkipped}
                      onChange={(e) => setFilterOptions(prev => ({
                        ...prev,
                        showOnlySkipped: e.target.checked
                      }))}
                    />
                    <span className="text-sm">Only show skipped days</span>
                  </label>
                </div>
                
                {/* Timeline View */}
                <div className="space-y-4">
                  {dailyProgress
                    .filter(progress => {
                      if (filterOptions.showOnlyWithProofs && !progress.proof_file) return false
                      if (filterOptions.showOnlyHighDifficulty && (progress.difficulty_rating || 0) < 7) return false
                      if (filterOptions.showOnlySkipped && progress.completed_tasks?.some(t => t)) return false
                      return true
                    })
                    .map(progress => (
                      <Card key={progress.day} className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold">Day {progress.day}</h4>
                            <Badge variant={progress.completed_tasks?.some(t => t) ? "default" : "destructive"}>
                              {progress.completed_tasks?.some(t => t) ? "Completed" : "Missed"}
                            </Badge>
                          </div>
                          
                          {progress.proof_text && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {progress.proof_text}
                            </p>
                          )}
                          
                          <div className="flex flex-wrap gap-2 text-xs">
                            {progress.proof_file && (
                              <Badge variant="outline" className="flex items-center gap-1">
                                <Camera className="h-3 w-3" />
                                Proof uploaded
                              </Badge>
                            )}
                            
                            {progress.motivation_rating && (
                              <Badge variant="outline">
                                Motivation: {progress.motivation_rating}/10
                              </Badge>
                            )}
                            
                            {progress.difficulty_rating && (
                              <Badge variant="outline">
                                Difficulty: {progress.difficulty_rating}/10
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  }
                </div>
              </CardContent>
            )}
          </Card>

          {/* Settings & Tools */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Settings & Tools
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" onClick={() => router.push('/generate')}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Regenerate Challenge
                </Button>
                
                <Button variant="outline" onClick={exportData}>
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF Summary
                </Button>
                
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Notification Settings
                </Button>
                
                <Button variant="outline">
                  <Share className="h-4 w-4 mr-2" />
                  Share Progress
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
      
      {/* Day Modal */}
      {selectedDay && selectedChallenge && (
        <DayModal
          isOpen={isDayModalOpen}
          onClose={closeDayModal}
          day={selectedDay}
          challengeId={selectedChallenge.id}
          dayProgress={dailyProgress.find(p => p.day === selectedDay)}
          onProgressUpdate={handleProgressUpdate}
        />
      )}
    </div>
  )
}