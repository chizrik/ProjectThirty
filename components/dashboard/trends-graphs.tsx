'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, ScatterChart, Scatter } from 'recharts'
import { TrendingUp, BarChart3, Activity, Calendar } from 'lucide-react'
import { DayProgress } from '@/types/challenge'

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

interface TrendsGraphsProps {
  dayData: DayData[]
}

export default function TrendsGraphs({ dayData }: TrendsGraphsProps) {
  // Prepare motivation trend data
  const motivationData = dayData
    .filter(d => d.status !== 'neutral')
    .map(day => ({
      day: day.day,
      motivation: day.motivation,
      difficulty: day.difficulty_rating,
      completion: day.completion_rating,
      tasksCompleted: day.tasks.filter(t => t.completed).length
    }))

  // Prepare completion trend data
  const completionData = dayData.map(day => {
    const tasksCompleted = day.tasks.filter(t => t.completed).length
    return {
      day: day.day,
      completionRate: (tasksCompleted / 3) * 100,
      status: day.status,
      tasksCompleted
    }
  })

  // Weekly aggregated data
  const weeklyData = []
  for (let week = 1; week <= 5; week++) {
    const weekStart = (week - 1) * 7 + 1
    const weekEnd = Math.min(week * 7, 30)
    const weekDays = dayData.slice(weekStart - 1, weekEnd)
    
    const activeDays = weekDays.filter(d => d.status !== 'neutral')
    const avgMotivation = activeDays.length > 0 
      ? activeDays.reduce((sum, day) => sum + day.motivation, 0) / activeDays.length
      : 0
    
    const avgDifficulty = activeDays.length > 0
      ? activeDays.reduce((sum, day) => sum + day.difficulty_rating, 0) / activeDays.length
      : 0
    
    const avgCompletion = activeDays.length > 0
      ? activeDays.reduce((sum, day) => sum + day.completion_rating, 0) / activeDays.length
      : 0
    
    const completedDays = weekDays.filter(d => d.status === 'complete').length
    const partialDays = weekDays.filter(d => d.status === 'partial').length
    const missedDays = weekDays.filter(d => d.status === 'missed').length
    
    weeklyData.push({
      week: `W${week}`,
      avgMotivation: Math.round(avgMotivation * 10) / 10,
      avgDifficulty: Math.round(avgDifficulty * 10) / 10,
      avgCompletion: Math.round(avgCompletion * 10) / 10,
      completed: completedDays,
      partial: partialDays,
      missed: missedDays,
      successRate: weekDays.length > 0 ? Math.round(((completedDays + partialDays) / weekDays.length) * 100) : 0
    })
  }

  // Correlation data (motivation vs completion)
  const correlationData = motivationData.map(day => ({
    motivation: day.motivation,
    completion: day.completion,
    day: day.day,
    tasksCompleted: day.tasksCompleted
  }))

  // Streak analysis data
  const streakData = []
  let currentStreak = 0
  let longestStreak = 0
  
  dayData.forEach((day, index) => {
    if (day.status === 'complete' || day.status === 'partial') {
      currentStreak++
      longestStreak = Math.max(longestStreak, currentStreak)
    } else if (day.status === 'missed') {
      currentStreak = 0
    }
    
    streakData.push({
      day: day.day,
      streak: currentStreak,
      status: day.status
    })
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-6">
        <TrendingUp className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">Trends & Analytics</h2>
      </div>

      <Tabs defaultValue="motivation" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="motivation">Motivation Trends</TabsTrigger>
          <TabsTrigger value="completion">Completion Patterns</TabsTrigger>
          <TabsTrigger value="weekly">Weekly Analysis</TabsTrigger>
          <TabsTrigger value="correlation">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="motivation" className="space-y-6">
          {/* Motivation Over Time */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Motivation Trend</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={motivationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis domain={[0, 10]} />
                    <Tooltip 
                      formatter={(value, name) => [
                        `${value}/10`, 
                        name === 'motivation' ? 'Motivation' : 
                        name === 'difficulty' ? 'Difficulty' : 'Completion'
                      ]}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="motivation" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                      name="motivation"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="difficulty" 
                      stroke="#ef4444" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="difficulty"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="completion" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="completion"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Motivation Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Motivation Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { range: '1-2', count: motivationData.filter(d => d.motivation <= 2).length },
                    { range: '3-4', count: motivationData.filter(d => d.motivation > 2 && d.motivation <= 4).length },
                    { range: '5-6', count: motivationData.filter(d => d.motivation > 4 && d.motivation <= 6).length },
                    { range: '7-8', count: motivationData.filter(d => d.motivation > 6 && d.motivation <= 8).length },
                    { range: '9-10', count: motivationData.filter(d => d.motivation > 8).length }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} days`, 'Count']} />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completion" className="space-y-6">
          {/* Daily Completion Rate */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Task Completion</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={completionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip formatter={(value) => [`${value}%`, 'Completion Rate']} />
                    <Area 
                      type="monotone" 
                      dataKey="completionRate" 
                      stroke="#10b981" 
                      fill="#10b981" 
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Streak Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Streak Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={streakData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} days`, 'Current Streak']} />
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
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{longestStreak}</div>
                  <div className="text-sm text-orange-700">Longest Streak</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{currentStreak}</div>
                  <div className="text-sm text-blue-700">Current Streak</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weekly" className="space-y-6">
          {/* Weekly Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Weekly Performance</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="completed" stackId="a" fill="#10b981" name="Completed" />
                    <Bar dataKey="partial" stackId="a" fill="#f59e0b" name="Partial" />
                    <Bar dataKey="missed" stackId="a" fill="#ef4444" name="Missed" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly Metrics Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis domain={[0, 10]} />
                    <Tooltip formatter={(value, name) => [
                      `${value}/10`, 
                      name === 'avgMotivation' ? 'Avg Motivation' : 
                      name === 'avgDifficulty' ? 'Avg Difficulty' : 'Avg Completion'
                    ]} />
                    <Line type="monotone" dataKey="avgMotivation" stroke="#3b82f6" strokeWidth={2} name="avgMotivation" />
                    <Line type="monotone" dataKey="avgDifficulty" stroke="#ef4444" strokeWidth={2} name="avgDifficulty" />
                    <Line type="monotone" dataKey="avgCompletion" stroke="#10b981" strokeWidth={2} name="avgCompletion" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="correlation" className="space-y-6">
          {/* Motivation vs Completion Scatter */}
          <Card>
            <CardHeader>
              <CardTitle>Motivation vs Completion Correlation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart data={correlationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="motivation" domain={[0, 10]} name="Motivation" />
                    <YAxis dataKey="completion" domain={[0, 10]} name="Completion" />
                    <Tooltip 
                      formatter={(value, name) => [
                        `${value}/10`, 
                        name === 'motivation' ? 'Motivation' : 'Completion'
                      ]}
                      labelFormatter={(label) => `Day ${correlationData[label]?.day || ''}`}
                    />
                    <Scatter 
                      dataKey="completion" 
                      fill="#3b82f6" 
                      fillOpacity={0.7}
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Performance Insights */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Best performing days */}
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">High Performance Days</h4>
                  <p className="text-sm text-green-700">
                    Days with motivation ≥ 7: {motivationData.filter(d => d.motivation >= 7).length} days
                  </p>
                  <p className="text-sm text-green-700">
                    Average completion on high motivation days: {Math.round(
                      motivationData.filter(d => d.motivation >= 7)
                        .reduce((sum, d) => sum + d.completion, 0) / 
                      Math.max(motivationData.filter(d => d.motivation >= 7).length, 1) * 10
                    ) / 10}/10
                  </p>
                </div>
                
                {/* Challenging days */}
                <div className="p-4 bg-red-50 rounded-lg">
                  <h4 className="font-medium text-red-800 mb-2">Challenging Days</h4>
                  <p className="text-sm text-red-700">
                    Days with difficulty ≥ 7: {motivationData.filter(d => d.difficulty >= 7).length} days
                  </p>
                  <p className="text-sm text-red-700">
                    Average motivation on difficult days: {Math.round(
                      motivationData.filter(d => d.difficulty >= 7)
                        .reduce((sum, d) => sum + d.motivation, 0) / 
                      Math.max(motivationData.filter(d => d.difficulty >= 7).length, 1) * 10
                    ) / 10}/10
                  </p>
                </div>
                
                {/* Consistency pattern */}
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">Consistency Pattern</h4>
                  <p className="text-sm text-blue-700">
                    Most consistent week: {weeklyData.reduce((best, week) => 
                      week.successRate > best.successRate ? week : best, weeklyData[0] || { week: 'N/A', successRate: 0 }
                    ).week} ({weeklyData.reduce((best, week) => 
                      week.successRate > best.successRate ? week : best, weeklyData[0] || { successRate: 0 }
                    ).successRate}% success rate)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}