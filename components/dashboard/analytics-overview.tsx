'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { TrendingUp, Target, Calendar, Award } from 'lucide-react'
import { DayData } from '@/types/challenge'

interface Stats {
  completed: number
  partial: number
  missed: number
  remaining: number
}

interface AnalyticsOverviewProps {
  dayData: DayData[]
  stats: Stats
  currentStreak: number
}

const COLORS = {
  complete: '#10b981',
  partial: '#f59e0b', 
  missed: '#ef4444',
  remaining: '#6b7280'
}

export default function AnalyticsOverview({ dayData, stats, currentStreak }: AnalyticsOverviewProps) {
  // Prepare data for charts
  const pieData = [
    { name: 'Completed', value: stats.completed, color: COLORS.complete },
    { name: 'Partial', value: stats.partial, color: COLORS.partial },
    { name: 'Missed', value: stats.missed, color: COLORS.missed },
    { name: 'Remaining', value: stats.remaining, color: COLORS.remaining }
  ].filter(item => item.value > 0)

  // Weekly progress data
  const weeklyData = []
  for (let week = 1; week <= 5; week++) {
    const weekStart = (week - 1) * 7 + 1
    const weekEnd = Math.min(week * 7, 30)
    const weekDays = dayData.slice(weekStart - 1, weekEnd)
    
    const weekCompleted = weekDays.filter(d => d.status === 'complete').length
    const weekPartial = weekDays.filter(d => d.status === 'partial').length
    const weekMissed = weekDays.filter(d => d.status === 'missed').length
    
    weeklyData.push({
      week: `Week ${week}`,
      completed: weekCompleted,
      partial: weekPartial,
      missed: weekMissed,
      total: weekDays.length
    })
  }

  // Calculate metrics
  const totalDaysActive = stats.completed + stats.partial + stats.missed
  const completionRate = totalDaysActive > 0 ? Math.round((stats.completed / totalDaysActive) * 100) : 0
  const consistencyRate = totalDaysActive > 0 ? Math.round(((stats.completed + stats.partial) / totalDaysActive) * 100) : 0
  
  // Average motivation
  const activeDays = dayData.filter(d => d.status !== 'neutral')
  const avgMotivation = activeDays.length > 0 
    ? Math.round(activeDays.reduce((sum, day) => sum + (day.motivation || 0), 0) / activeDays.length * 10) / 10
    : 0

  // Proof and reflection rates
  const proofsSubmitted = dayData.filter(d => d.hasProof).length
  const reflectionsSubmitted = dayData.filter(d => d.hasReflection).length
  const proofRate = totalDaysActive > 0 ? Math.round((proofsSubmitted / totalDaysActive) * 100) : 0
  const reflectionRate = totalDaysActive > 0 ? Math.round((reflectionsSubmitted / totalDaysActive) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold text-blue-600">{completionRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Consistency</p>
                <p className="text-2xl font-bold text-green-600">{consistencyRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Motivation</p>
                <p className="text-2xl font-bold text-purple-600">{avgMotivation}/10</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Days Active</p>
                <p className="text-2xl font-bold text-orange-600">{totalDaysActive}/30</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Progress Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Legend */}
            <div className="grid grid-cols-2 gap-2 mt-4">
              {pieData.map((item) => (
                <div key={item.name} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm text-gray-600">
                    {item.name}: {item.value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Weekly Progress Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="completed" stackId="a" fill={COLORS.complete} name="Completed" />
                  <Bar dataKey="partial" stackId="a" fill={COLORS.partial} name="Partial" />
                  <Bar dataKey="missed" stackId="a" fill={COLORS.missed} name="Missed" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Engagement Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Proof Submissions</span>
                <span className="text-sm text-gray-600">{proofsSubmitted}/{totalDaysActive}</span>
              </div>
              <Progress value={proofRate} className="h-2" />
              <p className="text-xs text-gray-500 mt-1">{proofRate}% of active days</p>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Reflection Entries</span>
                <span className="text-sm text-gray-600">{reflectionsSubmitted}/{totalDaysActive}</span>
              </div>
              <Progress value={reflectionRate} className="h-2" />
              <p className="text-xs text-gray-500 mt-1">{reflectionRate}% of active days</p>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Current Streak</span>
                <Badge variant={currentStreak >= 7 ? 'default' : 'secondary'}>
                  {currentStreak} days
                </Badge>
              </div>
              <Progress value={Math.min((currentStreak / 30) * 100, 100)} className="h-2" />
              <p className="text-xs text-gray-500 mt-1">
                {currentStreak >= 7 ? 'Great consistency!' : 'Keep building your streak'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Challenge Insights */}
        <Card>
          <CardHeader>
            <CardTitle>Challenge Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Best performing week */}
              {weeklyData.length > 0 && (
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">Best Week</h4>
                  <p className="text-sm text-green-700">
                    {weeklyData.reduce((best, week) => 
                      week.completed > best.completed ? week : best
                    ).week} with {weeklyData.reduce((best, week) => 
                      week.completed > best.completed ? week : best
                    ).completed} completed days
                  </p>
                </div>
              )}
              
              {/* Motivation insight */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">Motivation Level</h4>
                <p className="text-sm text-blue-700">
                  {avgMotivation >= 7 
                    ? 'High motivation maintained throughout the challenge!' 
                    : avgMotivation >= 5 
                    ? 'Moderate motivation - consider what drives you most.' 
                    : 'Low motivation detected - try adjusting your approach.'}
                </p>
              </div>
              
              {/* Consistency insight */}
              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-medium text-purple-800 mb-2">Consistency Pattern</h4>
                <p className="text-sm text-purple-700">
                  {consistencyRate >= 80 
                    ? 'Excellent consistency! You\'re building strong habits.' 
                    : consistencyRate >= 60 
                    ? 'Good consistency with room for improvement.' 
                    : 'Focus on building more consistent daily habits.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}