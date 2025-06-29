'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Flame, Award, Target, TrendingUp, Calendar } from 'lucide-react'
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts'

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

interface StreakTrackerProps {
  dayData: DayData[]
  currentStreak: number
}

export default function StreakTracker({ dayData, currentStreak }: StreakTrackerProps) {
  // Calculate streak statistics
  const calculateStreakStats = () => {
    let longestStreak = 0
    let currentStreakCount = 0
    let streaks: number[] = []
    let tempStreak = 0
    
    dayData.forEach((day) => {
      if (day.status === 'complete' || day.status === 'partial') {
        tempStreak++
        longestStreak = Math.max(longestStreak, tempStreak)
      } else if (day.status === 'missed') {
        if (tempStreak > 0) {
          streaks.push(tempStreak)
        }
        tempStreak = 0
      }
    })
    
    // Add final streak if it exists
    if (tempStreak > 0) {
      streaks.push(tempStreak)
    }
    
    const totalStreaks = streaks.length
    const avgStreakLength = streaks.length > 0 ? Math.round(streaks.reduce((sum, s) => sum + s, 0) / streaks.length * 10) / 10 : 0
    const streaksOver3 = streaks.filter(s => s >= 3).length
    const streaksOver7 = streaks.filter(s => s >= 7).length
    
    return {
      longestStreak,
      currentStreak,
      totalStreaks,
      avgStreakLength,
      streaksOver3,
      streaksOver7,
      allStreaks: streaks
    }
  }

  // Generate streak timeline data
  const generateStreakTimeline = () => {
    let currentStreakCount = 0
    const timeline = dayData.map((day) => {
      if (day.status === 'complete' || day.status === 'partial') {
        currentStreakCount++
      } else if (day.status === 'missed') {
        currentStreakCount = 0
      }
      
      return {
        day: day.day,
        streak: currentStreakCount,
        status: day.status,
        isActive: day.status !== 'neutral'
      }
    })
    
    return timeline
  }

  // Generate heatmap data (weekly view)
  const generateHeatmapData = () => {
    const weeks = []
    for (let week = 0; week < 5; week++) {
      const weekData = []
      for (let day = 0; day < 7; day++) {
        const dayNumber = week * 7 + day + 1
        if (dayNumber <= 30) {
          const dayInfo = dayData[dayNumber - 1]
          weekData.push({
            day: dayNumber,
            weekDay: day,
            week: week,
            status: dayInfo.status,
            intensity: dayInfo.status === 'complete' ? 3 : 
                      dayInfo.status === 'partial' ? 2 : 
                      dayInfo.status === 'missed' ? 1 : 0
          })
        }
      }
      weeks.push(weekData)
    }
    return weeks
  }

  // Generate streak distribution data
  const generateStreakDistribution = () => {
    const stats = calculateStreakStats()
    return [
      { range: '1 day', count: stats.allStreaks.filter(s => s === 1).length },
      { range: '2-3 days', count: stats.allStreaks.filter(s => s >= 2 && s <= 3).length },
      { range: '4-6 days', count: stats.allStreaks.filter(s => s >= 4 && s <= 6).length },
      { range: '7+ days', count: stats.allStreaks.filter(s => s >= 7).length }
    ]
  }

  const streakStats = calculateStreakStats()
  const streakTimeline = generateStreakTimeline()
  const heatmapData = generateHeatmapData()
  const streakDistribution = generateStreakDistribution()
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete': return 'bg-green-500'
      case 'partial': return 'bg-yellow-500'
      case 'missed': return 'bg-red-500'
      default: return 'bg-gray-200'
    }
  }

  const getIntensityColor = (intensity: number) => {
    switch (intensity) {
      case 3: return 'bg-green-600'
      case 2: return 'bg-green-400'
      case 1: return 'bg-red-400'
      default: return 'bg-gray-200'
    }
  }

  const getStreakBadgeVariant = (streak: number) => {
    if (streak >= 14) return 'default'
    if (streak >= 7) return 'secondary'
    return 'outline'
  }

  const getStreakMessage = (streak: number) => {
    if (streak >= 21) return "🔥 Incredible! You're on fire!"
    if (streak >= 14) return "🚀 Amazing consistency!"
    if (streak >= 7) return "💪 Great momentum!"
    if (streak >= 3) return "📈 Building habits!"
    if (streak >= 1) return "🌱 Good start!"
    return "💡 Ready to begin your streak?"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-6">
        <Flame className="h-6 w-6 text-orange-600" />
        <h2 className="text-2xl font-bold text-gray-900">Streak Tracker</h2>
      </div>

      {/* Streak Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Flame className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Current Streak</p>
                <div className="flex items-center space-x-2">
                  <p className="text-2xl font-bold text-orange-600">{streakStats.currentStreak}</p>
                  <Badge variant={getStreakBadgeVariant(streakStats.currentStreak)}>
                    {streakStats.currentStreak >= 7 ? 'Hot' : streakStats.currentStreak >= 3 ? 'Good' : 'Building'}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Longest Streak</p>
                <p className="text-2xl font-bold text-purple-600">{streakStats.longestStreak}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Streaks</p>
                <p className="text-2xl font-bold text-blue-600">{streakStats.totalStreaks}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Streak</p>
                <p className="text-2xl font-bold text-green-600">{streakStats.avgStreakLength}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Streak Message */}
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-lg font-medium text-gray-800 mb-2">
              {getStreakMessage(streakStats.currentStreak)}
            </p>
            <Progress 
              value={Math.min((streakStats.currentStreak / 30) * 100, 100)} 
              className="h-3 mb-2" 
            />
            <p className="text-sm text-gray-600">
              {streakStats.currentStreak < 30 
                ? `${30 - streakStats.currentStreak} days to complete the challenge` 
                : 'Challenge completed! 🎉'}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Streak Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Streak Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={streakTimeline}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`${value} days`, 'Streak Length']}
                    labelFormatter={(label) => `Day ${label}`}
                  />
                  <Area 
                    type="stepAfter" 
                    dataKey="streak" 
                    stroke="#f59e0b" 
                    fill="#f59e0b" 
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Streak Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Streak Length Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={streakDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} streaks`, 'Count']} />
                  <Bar dataKey="count" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calendar Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Activity Heatmap</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {/* Week labels */}
            <div className="grid grid-cols-8 gap-1 text-xs text-gray-500 mb-2">
              <div></div>
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
              <div>Sun</div>
            </div>
            
            {/* Heatmap grid */}
            {heatmapData.map((week, weekIndex) => (
              <div key={weekIndex} className="grid grid-cols-8 gap-1">
                <div className="text-xs text-gray-500 flex items-center">
                  Week {weekIndex + 1}
                </div>
                {Array.from({ length: 7 }).map((_, dayIndex) => {
                  const dayData = week.find(d => d.weekDay === dayIndex)
                  return (
                    <div
                      key={dayIndex}
                      className={`
                        h-8 w-8 rounded border border-gray-200 flex items-center justify-center text-xs font-medium
                        ${dayData ? getIntensityColor(dayData.intensity) : 'bg-gray-100'}
                        ${dayData?.intensity === 3 ? 'text-white' : 
                          dayData?.intensity === 2 ? 'text-white' : 
                          dayData?.intensity === 1 ? 'text-white' : 'text-gray-400'}
                      `}
                      title={dayData ? `Day ${dayData.day}: ${dayData.status}` : 'No data'}
                    >
                      {dayData?.day || ''}
                    </div>
                  )
                })}
              </div>
            ))}
            
            {/* Legend */}
            <div className="flex items-center justify-center space-x-4 mt-4 text-xs text-gray-600">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-gray-200 rounded"></div>
                <span>No activity</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-red-400 rounded"></div>
                <span>Missed</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-green-400 rounded"></div>
                <span>Partial</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-green-600 rounded"></div>
                <span>Complete</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Streak Achievements */}
      <Card>
        <CardHeader>
          <CardTitle>Streak Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={`p-4 rounded-lg border-2 ${
              streakStats.currentStreak >= 3 ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center space-x-2 mb-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  streakStats.currentStreak >= 3 ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  🌱
                </div>
                <div>
                  <p className="font-medium">Habit Builder</p>
                  <p className="text-xs text-gray-600">3-day streak</p>
                </div>
              </div>
              {streakStats.currentStreak >= 3 ? (
                <Badge variant="default" className="text-xs">Achieved!</Badge>
              ) : (
                <p className="text-xs text-gray-500">{3 - streakStats.currentStreak} days to go</p>
              )}
            </div>
            
            <div className={`p-4 rounded-lg border-2 ${
              streakStats.currentStreak >= 7 ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center space-x-2 mb-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  streakStats.currentStreak >= 7 ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  💪
                </div>
                <div>
                  <p className="font-medium">Week Warrior</p>
                  <p className="text-xs text-gray-600">7-day streak</p>
                </div>
              </div>
              {streakStats.currentStreak >= 7 ? (
                <Badge variant="default" className="text-xs">Achieved!</Badge>
              ) : (
                <p className="text-xs text-gray-500">{7 - streakStats.currentStreak} days to go</p>
              )}
            </div>
            
            <div className={`p-4 rounded-lg border-2 ${
              streakStats.currentStreak >= 14 ? 'bg-purple-50 border-purple-200' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center space-x-2 mb-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  streakStats.currentStreak >= 14 ? 'bg-purple-500 text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  🚀
                </div>
                <div>
                  <p className="font-medium">Momentum Master</p>
                  <p className="text-xs text-gray-600">14-day streak</p>
                </div>
              </div>
              {streakStats.currentStreak >= 14 ? (
                <Badge variant="default" className="text-xs">Achieved!</Badge>
              ) : (
                <p className="text-xs text-gray-500">{14 - streakStats.currentStreak} days to go</p>
              )}
            </div>
            
            <div className={`p-4 rounded-lg border-2 ${
              streakStats.currentStreak >= 30 ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center space-x-2 mb-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  streakStats.currentStreak >= 30 ? 'bg-yellow-500 text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  👑
                </div>
                <div>
                  <p className="font-medium">Challenge Champion</p>
                  <p className="text-xs text-gray-600">30-day streak</p>
                </div>
              </div>
              {streakStats.currentStreak >= 30 ? (
                <Badge variant="default" className="text-xs">Achieved!</Badge>
              ) : (
                <p className="text-xs text-gray-500">{30 - streakStats.currentStreak} days to go</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}