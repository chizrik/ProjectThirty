'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Calendar } from '@/components/ui/calendar'
import { TrendingUp, BarChart2, CalendarIcon, ChevronDown, ChevronUp, Lightbulb, Users, Activity } from 'lucide-react'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import { Challenge, DayProgress } from '@/types/challenge'

// Dynamically import chart components to avoid SSR issues
const RechartsComponents = {
  LineChart: dynamic(() => import('recharts').then(mod => ({ default: mod.LineChart })), { ssr: false }),
  Line: dynamic(() => import('recharts').then(mod => ({ default: mod.Line as any })), { ssr: false }),
  XAxis: dynamic(() => import('recharts').then(mod => ({ default: mod.XAxis as any })), { ssr: false }),
  YAxis: dynamic(() => import('recharts').then(mod => ({ default: mod.YAxis as any })), { ssr: false }),
  CartesianGrid: dynamic(() => import('recharts').then(mod => ({ default: mod.CartesianGrid })), { ssr: false }),
  Tooltip: dynamic(() => import('recharts').then(mod => ({ default: mod.Tooltip as any })), { ssr: false }),
  ResponsiveContainer: dynamic(() => import('recharts').then(mod => ({ default: mod.ResponsiveContainer })), { ssr: false }),
  BarChart: dynamic(() => import('recharts').then(mod => ({ default: mod.BarChart })), { ssr: false }),
  Bar: dynamic(() => import('recharts').then(mod => ({ default: mod.Bar as any })), { ssr: false }),
  PieChart: dynamic(() => import('recharts').then(mod => ({ default: mod.PieChart })), { ssr: false }),
  Pie: dynamic(() => import('recharts').then(mod => ({ default: mod.Pie as any })), { ssr: false }),
  Cell: dynamic(() => import('recharts').then(mod => ({ default: mod.Cell })), { ssr: false }),
  Legend: dynamic(() => import('recharts').then(mod => ({ default: mod.Legend as any })), { ssr: false })
}

interface DailyData {
  day: number
  motivation: number
  difficulty: number
}

interface CompletionData {
  name: string
  value: number
  color: string
}

interface CalendarStatus {
  [date: string]: 'completed' | 'missed'
}

interface AnalyticsTrendsPanelProps {
  dailyData: DailyData[]
  completionData: CompletionData[]
  calendarStatus: CalendarStatus
  weeklyInsight: string
}

// Helper function to calculate current streak
function calculateCurrentStreak(calendarStatus: CalendarStatus): number {
  const dates = Object.keys(calendarStatus).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
  let streak = 0
  
  for (const date of dates) {
    if (calendarStatus[date] === 'completed') {
      streak++
    } else {
      break
    }
  }
  
  return streak
}

export function AnalyticsTrendsPanel({
  dailyData,
  completionData,
  calendarStatus,
  weeklyInsight
}: AnalyticsTrendsPanelProps) {
  const [showDifficulty, setShowDifficulty] = useState(true)
  
  // Calculate key metrics
  const totalDays = dailyData.length
  const completedDays = completionData.find(d => d.name === 'Completed')?.value || 0
  const missedDays = completionData.find(d => d.name === 'Missed')?.value || 0
  const completionRate = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0
  const avgMotivation = totalDays > 0 ? Math.round(dailyData.reduce((sum, d) => sum + d.motivation, 0) / totalDays) : 0
  const avgDifficulty = totalDays > 0 ? Math.round(dailyData.reduce((sum, d) => sum + d.difficulty, 0) / totalDays) : 0
  
  // Calculate streak
  const currentStreak = calculateCurrentStreak(calendarStatus)
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-900/20 dark:to-slate-900/10 border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
              <BarChart2 className="h-6 w-6 text-blue-500" />
              Analytics Overview
            </CardTitle>
            <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
              {totalDays} days tracked
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-green-500" />
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Completion</span>
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {completionRate}%
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{completedDays}/{totalDays} days</div>
            </div>
            
            <div className="bg-white dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Current Streak</span>
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {currentStreak}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">days in a row</div>
            </div>
            
            <div className="bg-white dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-purple-500" />
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Avg Motivation</span>
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {avgMotivation}/10
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">daily average</div>
            </div>
            
            <div className="bg-white dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-2">
                <BarChart2 className="w-4 h-4 text-orange-500" />
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Avg Difficulty</span>
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {avgDifficulty}/10
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">perceived level</div>
            </div>
          </div>
          
          {/* Weekly Insight Card */}
          <Card className="bg-gradient-to-br from-amber-50 to-amber-100/30 dark:from-amber-900/20 dark:to-amber-900/5 border border-amber-200 dark:border-amber-800 shadow-sm mb-6">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start gap-3">
                <div className="bg-amber-100 dark:bg-amber-900/50 p-2 rounded-full">
                  <Lightbulb className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-1">Weekly Insight</h4>
                  <p className="text-sm text-amber-700 dark:text-amber-400">{weeklyInsight}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Tabs defaultValue="trends">
                <TabsList className="grid grid-cols-3 mb-4">
                  <TabsTrigger value="trends" className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Trends
                  </TabsTrigger>
                  <TabsTrigger value="completion" className="flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Completion
                  </TabsTrigger>
                  <TabsTrigger value="calendar" className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    Calendar
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="trends" className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Motivation & Difficulty Trends</h4>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="show-difficulty"
                        checked={showDifficulty}
                        onCheckedChange={setShowDifficulty}
                        className="data-[state=checked]:bg-blue-500"
                      />
                      <Label htmlFor="show-difficulty" className="text-xs text-slate-600 dark:text-slate-400">Show Difficulty</Label>
                    </div>
                  </div>
                  
                  <div className="h-[300px] w-full bg-white dark:bg-slate-800/50 rounded-lg p-4">
                    <RechartsComponents.ResponsiveContainer width="100%" height="100%">
                      <RechartsComponents.LineChart
                        data={dailyData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <RechartsComponents.CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <RechartsComponents.XAxis 
                          dataKey="day" 
                          stroke="#64748b"
                          tick={{ fill: '#64748b' }}
                          {...({} as any)}
                        />
                        <RechartsComponents.YAxis 
                          stroke="#64748b"
                          tick={{ fill: '#64748b' }}
                          {...({} as any)}
                        />
                        <RechartsComponents.Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#ffffff', 
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                          }}
                          {...({} as any)}
                        />
                        <RechartsComponents.Legend 
                          wrapperStyle={{
                            paddingTop: '20px',
                            color: '#64748b'
                          }}
                          {...({} as any)}
                        />
                        <RechartsComponents.Line
                          type="monotone"
                          dataKey="motivation"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          dot={{ fill: '#3b82f6', strokeWidth: 2 }}
                          name="Motivation"
                          activeDot={{ r: 8 }}
                          {...({} as any)}
                        />
                        {showDifficulty && (
                          <RechartsComponents.Line
                            type="monotone"
                            dataKey="difficulty"
                            stroke="#10b981"
                            strokeWidth={2}
                            dot={{ fill: '#10b981', strokeWidth: 2 }}
                            name="Difficulty"
                            {...({} as any)}
                          />
                        )}
                      </RechartsComponents.LineChart>
                    </RechartsComponents.ResponsiveContainer>
                  </div>
                </TabsContent>
                
                <TabsContent value="completion" className="space-y-4">
                  <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Completion Breakdown</h4>
                  
                  <div className="h-[300px] w-full bg-white dark:bg-slate-800/50 rounded-lg p-4">
                    <RechartsComponents.ResponsiveContainer width="100%" height="100%">
                      <RechartsComponents.BarChart
                        data={completionData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <RechartsComponents.CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <RechartsComponents.XAxis 
                          dataKey="day" 
                          stroke="#64748b"
                          tick={{ fill: '#64748b' }}
                          {...({} as any)}
                        />
                        <RechartsComponents.YAxis 
                          stroke="#64748b"
                          tick={{ fill: '#64748b' }}
                          {...({} as any)}
                        />
                        <RechartsComponents.Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#ffffff', 
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                          }}
                          {...({} as any)}
                        />
                        <RechartsComponents.Bar 
                          dataKey="completion" 
                          fill="#8b5cf6" 
                          radius={[4, 4, 0, 0]}
                          name="Completion Rate"
                          {...({} as any)}
                        />
                      </RechartsComponents.BarChart>
                    </RechartsComponents.ResponsiveContainer>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    {completionData.map((item, index) => (
                      <Card key={index} className="bg-white dark:bg-slate-800/50 border-0 shadow-sm">
                        <CardContent className="p-4 flex items-center justify-between">
                          <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{item.name}</p>
                            <p className="text-xl font-bold" style={{ color: item.color }}>{item.value}</p>
                          </div>
                          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${item.color}20` }}>
                            <Users className="w-5 h-5" style={{ color: item.color }} />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="calendar" className="space-y-4">
                  <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Activity Calendar</h4>
                  
                  <div className="flex justify-center bg-white dark:bg-slate-800/50 rounded-lg p-4">
                    <Calendar
                      mode="single"
                      className="rounded-lg border-0 shadow-sm bg-white dark:bg-slate-800"
                      modifiers={{
                        completed: (date) =>
                          calendarStatus[date.toISOString().split('T')[0]] === 'completed',
                        missed: (date) =>
                          calendarStatus[date.toISOString().split('T')[0]] === 'missed',
                      }}
                      modifiersStyles={{
                        completed: { 
                          color: '#ffffff',
                          backgroundColor: '#3b82f6',
                          borderRadius: '4px'
                        },
                        missed: { 
                          color: '#ffffff',
                          backgroundColor: '#ef4444',
                          borderRadius: '4px'
                        },
                      }}
                      classNames={{
                        day_today: 'bg-slate-100 text-slate-900 dark:bg-slate-700 dark:text-slate-100',
                        day_outside: 'text-slate-400 dark:text-slate-500',
                        day: 'h-9 w-9 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors'
                      }}
                    />
                  </div>
                  
                  <div className="flex justify-center gap-6 text-sm text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-sm bg-blue-500" />
                      Completed
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-sm bg-red-500" />
                      Missed
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-sm bg-slate-200 dark:bg-slate-700" />
                      Today
                    </div>
                  </div>
                </TabsContent>
               </Tabs>
         </CardContent>
       </Card>
     </motion.div>
   )
}