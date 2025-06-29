'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, TrendingUp, Flame, FileText, Download, Settings, Camera, Brain } from 'lucide-react'
import DayModal from '@/components/analytics/day-modal'
import AnalyticsOverview from '@/components/dashboard/analytics-overview'
import TrendsGraphs from '@/components/dashboard/trends-graphs'
import StreakTracker from '@/components/dashboard/streak-tracker'
import ProofsReflections from '@/components/dashboard/proofs-reflections'
import ExportTools from '@/components/dashboard/export-tools'
import ChallengeSettings from '@/components/dashboard/challenge-settings'
import { Challenge, DayProgress } from '@/types/challenge'

interface DayData {
  day: number
  tasks: { task_id: number; title: string; completed: boolean }[]
  motivation: number
  reflection: string
  proof_upload_url: string
  difficulty_rating: number
  completion_rating: number
  timestamp: string
  status: 'neutral' | 'complete' | 'missed' | 'partial'
  hasProof: boolean
  hasReflection: boolean
}

const defaultTasks = [
  { task_id: 1, title: 'Morning routine completion', completed: false },
  { task_id: 2, title: 'Main challenge activity', completed: false },
  { task_id: 3, title: 'Evening reflection', completed: false }
]

export default function ChallengeDashboard() {
  const params = useParams()
  const challengeId = params.id as string
  const supabase = createSupabaseClient()
  
  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [dailyProgress, setDailyProgress] = useState<DayProgress[]>([])
  const [dayData, setDayData] = useState<DayData[]>([])
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null)
  const [isDayModalOpen, setIsDayModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [challengeTitle, setChallengeTitle] = useState('')
  const [challengeDescription, setChallengeDescription] = useState('')

  useEffect(() => {
    fetchChallengeData()
  }, [challengeId])

  useEffect(() => {
    if (challenge && dailyProgress.length > 0) {
      generateDayData()
    }
  }, [challenge, dailyProgress])

  const fetchChallengeData = async () => {
    try {
      // Fetch challenge details
      const { data: challengeData, error: challengeError } = await supabase
        .from('challenges')
        .select('*')
        .eq('id', challengeId)
        .single()

      if (challengeError) throw challengeError
      setChallenge(challengeData)
      setChallengeTitle(challengeData.title || '')
      setChallengeDescription(challengeData.description || '')

      // Fetch daily progress
      const { data: progressData, error: progressError } = await supabase
        .from('daily_progress')
        .select('*')
        .eq('challenge_id', challengeId)
        .order('day', { ascending: true })

      if (progressError) throw progressError
      setDailyProgress(progressData || [])
    } catch (error) {
      console.error('Error fetching challenge data:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateDayData = () => {
    const days: DayData[] = []
    
    for (let day = 1; day <= 30; day++) {
      const progress = dailyProgress.find(p => p.day === day)
      const isCompleted = progress?.completed || false
      
      let status: 'neutral' | 'complete' | 'missed' | 'partial' = 'neutral'
      if (isCompleted) status = 'complete'
      else if (day < getCurrentDay()) status = 'missed'
      
      const tasks = defaultTasks.map((task, index) => ({
        ...task,
        completed: (progress?.completed_tasks as number[] || [])[index] || false
      }))

      days.push({
        day,
        tasks,
        motivation: progress?.motivation || 5,
        reflection: progress?.proof_text || '',
        proof_upload_url: progress?.proof_file || '',
        difficulty_rating: progress?.difficulty_rating || 5,
        completion_rating: progress?.completion_rating || 5,
        timestamp: progress?.completed_at || new Date().toISOString(),
        status,
        hasProof: !!progress?.proof_file,
        hasReflection: !!progress?.proof_text
      })
    }
    
    setDayData(days)
  }

  const getCurrentDay = () => {
    if (!challenge) return 1
    const startDate = new Date(challenge.created_at)
    const today = new Date()
    const diffTime = Math.abs(today.getTime() - startDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.min(diffDays, 30)
  }

  const openDayModal = (day: DayData) => {
    setSelectedDay(day)
    setIsDayModalOpen(true)
  }

  const closeDayModal = () => {
    setIsDayModalOpen(false)
    setSelectedDay(null)
  }

  const handleProgressUpdate = async (updatedDay: DayData) => {
    // Update local state
    setDayData(prev => prev.map(d => d.day === updatedDay.day ? updatedDay : d))
    
    // Refresh data from database
    await fetchChallengeData()
    closeDayModal()
  }

  const handleChallengeUpdate = (newTitle: string, newDescription: string) => {
    setChallengeTitle(newTitle)
    setChallengeDescription(newDescription)
    if (challenge) {
      setChallenge({ ...challenge, title: newTitle, description: newDescription })
    }
  }

  const handleChallengeReset = () => {
    // Reset all progress data
    setDayData(Array.from({ length: 30 }, (_, i) => ({
      day: i + 1,
      tasks: defaultTasks,
      motivation: 5,
      reflection: '',
      proof_upload_url: '',
      difficulty_rating: 5,
      completion_rating: 5,
      timestamp: new Date().toISOString(),
      status: 'neutral' as const,
      hasProof: false,
      hasReflection: false
    })))
    
    setSelectedDay(null)
    setIsDayModalOpen(false)
  }

  const getDayColor = (status: string) => {
    switch (status) {
      case 'complete': return 'bg-green-500 hover:bg-green-600'
      case 'partial': return 'bg-yellow-500 hover:bg-yellow-600'
      case 'missed': return 'bg-red-500 hover:bg-red-600'
      default: return 'bg-gray-300 hover:bg-gray-400'
    }
  }

  const getCompletionStats = () => {
    const completed = dayData.filter(d => d.status === 'complete').length
    const partial = dayData.filter(d => d.status === 'partial').length
    const missed = dayData.filter(d => d.status === 'missed').length
    const remaining = dayData.filter(d => d.status === 'neutral').length
    
    return { completed, partial, missed, remaining }
  }

  const getCurrentStreak = () => {
    let streak = 0
    const currentDay = getCurrentDay()
    
    for (let i = currentDay - 1; i >= 0; i--) {
      const day = dayData[i]
      if (day && (day.status === 'complete' || day.status === 'partial')) {
        streak++
      } else {
        break
      }
    }
    
    return streak
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-2/3 mb-8"></div>
            <div className="grid grid-cols-6 gap-4">
              {Array.from({ length: 30 }).map((_, i) => (
                <div key={i} className="h-16 bg-gray-300 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!challenge) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-6">
          <CardContent>
            <p className="text-center text-gray-600">Challenge not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const stats = getCompletionStats()
  const currentStreak = getCurrentStreak()
  const completionRate = Math.round((stats.completed / 30) * 100)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Left Sidebar Navigation */}
        <div className="w-64 bg-white shadow-lg min-h-screen sticky top-0">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-6">Analytics</h2>
            <nav className="space-y-2">
              <Button
                variant={activeTab === 'overview' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveTab('overview')}
              >
                <Calendar className="mr-2 h-4 w-4" />
                Challenge Overview
              </Button>
              <Button
                variant={activeTab === 'trends' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveTab('trends')}
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                Trends & Graphs
              </Button>
              <Button
                variant={activeTab === 'streak' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveTab('streak')}
              >
                <Flame className="mr-2 h-4 w-4" />
                Streak Tracker
              </Button>
              <Button
                variant={activeTab === 'proofs' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveTab('proofs')}
              >
                <FileText className="mr-2 h-4 w-4" />
                Proofs & Reflections
              </Button>
              <Button
                variant={activeTab === 'export' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveTab('export')}
              >
                <Download className="mr-2 h-4 w-4" />
                Export & Tools
              </Button>
              <Button
                variant={activeTab === 'settings' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveTab('settings')}
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{challenge.title}</h1>
                <p className="text-gray-600 mt-2">{challenge.description}</p>
              </div>
              <Badge variant="secondary" className="text-sm">
                {challenge.category}
              </Badge>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                  <div className="text-sm text-gray-600">Days Completed</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-orange-600">{currentStreak}</div>
                  <div className="text-sm text-gray-600">Current Streak</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-blue-600">{stats.remaining}</div>
                  <div className="text-sm text-gray-600">Days Remaining</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-purple-600">{completionRate}%</div>
                  <div className="text-sm text-gray-600">Completion Rate</div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Content based on active tab */}
          {activeTab === 'overview' && (
            <div>
              {/* 30-Day Challenge Grid */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>30-Day Challenge Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-6 gap-3">
                    {dayData.map((day) => (
                      <motion.div
                        key={day.day}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`
                          relative h-16 rounded-lg cursor-pointer transition-all duration-200
                          ${getDayColor(day.status)}
                          flex items-center justify-center text-white font-semibold
                        `}
                        onClick={() => openDayModal(day)}
                      >
                        <span className="text-lg">{day.day}</span>
                        
                        {/* Icons for proof and reflection */}
                        <div className="absolute top-1 right-1 flex space-x-1">
                          {day.hasProof && <Camera className="h-3 w-3" />}
                          {day.hasReflection && <Brain className="h-3 w-3" />}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  
                  {/* Legend */}
                  <div className="flex items-center justify-center space-x-6 mt-6 text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-green-500 rounded"></div>
                      <span>Complete</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                      <span>Partial</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-red-500 rounded"></div>
                      <span>Missed</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-gray-300 rounded"></div>
                      <span>Upcoming</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <AnalyticsOverview dayData={dayData} stats={stats} currentStreak={currentStreak} />
            </div>
          )}
          
          {activeTab === 'trends' && <TrendsGraphs dayData={dayData} />}
          {activeTab === 'streak' && <StreakTracker dayData={dayData} currentStreak={currentStreak} />}
          {activeTab === 'proofs' && <ProofsReflections dayData={dayData} challengeTitle={challengeTitle} />}
          {activeTab === 'export' && <ExportTools dayData={dayData} challengeTitle={challengeTitle} challengeId={challengeId} onChallengeReset={handleChallengeReset} />}
          {activeTab === 'settings' && <ChallengeSettings challengeId={challengeId} challengeTitle={challengeTitle} challengeDescription={challengeDescription} onChallengeUpdate={handleChallengeUpdate} />}
        </div>
      </div>

      {/* Day Modal */}
      <AnimatePresence>
        {isDayModalOpen && selectedDay && (
          <DayModal
            isOpen={isDayModalOpen}
            onClose={closeDayModal}
            day={selectedDay}
            challengeId={challengeId}
            dayProgress={dailyProgress.find(p => p.day === selectedDay.day)}
            onProgressUpdate={handleProgressUpdate}
          />
        )}
      </AnimatePresence>
    </div>
  )
}