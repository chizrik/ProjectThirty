'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import dynamic from 'next/dynamic';
import { Calendar } from '@/components/ui/calendar';
import { CheckCircle2, XCircle, Trophy, Calendar as CalendarIcon, TrendingUp } from 'lucide-react';

const ResponsiveContainer = dynamic(
  () => import('recharts').then((mod) => mod.ResponsiveContainer),
  { ssr: false }
);

const LineChart = dynamic(
  () => import('recharts').then((mod) => mod.LineChart),
  { ssr: false }
);

const Line = dynamic(
  () => import('recharts').then((mod) => mod.Line),
  { ssr: false }
);

const CartesianGrid = dynamic(
  () => import('recharts').then((mod) => mod.CartesianGrid),
  { ssr: false }
);

const XAxis = dynamic(
  () => import('recharts').then((mod) => mod.XAxis),
  { ssr: false }
);

const YAxis = dynamic(
  () => import('recharts').then((mod) => mod.YAxis),
  { ssr: false }
);

const Tooltip = dynamic(
  () => import('recharts').then((mod) => mod.Tooltip),
  { ssr: false }
);

const Legend = dynamic(
  () => import('recharts').then((mod) => mod.Legend),
  { ssr: false }
);

interface AnalyticsPanelProps {
  completionRate: number;
  streakCount: number;
  missedDays: number;
  dailyMotivation: Array<{
    day: number;
    motivation: number;
    difficulty: number;
  }>;
  calendarStatus: Record<string, 'completed' | 'missed'>;
}

export function AnalyticsPanel({
  completionRate,
  streakCount,
  missedDays,
  dailyMotivation,
  calendarStatus,
}: AnalyticsPanelProps) {
  const [showDifficulty, setShowDifficulty] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Stats Summary Panel */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">Users</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{completionRate}</div>
            <Progress value={completionRate} className="mt-2 bg-blue-200 dark:bg-blue-700" />
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">Active users this month</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/10 border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">New Users</CardTitle>
            <Trophy className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">{streakCount}</div>
            <div className="text-xs text-green-600 dark:text-green-400 mt-2">+{streakCount}% from last month</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/10 border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">Sessions</CardTitle>
            <XCircle className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">{missedDays}</div>
            <div className="text-xs text-purple-600 dark:text-purple-400 mt-2">Average sessions per user</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-900/10 border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">Bounce Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">4.71%</div>
            <div className="text-xs text-orange-600 dark:text-orange-400 mt-2">-0.5% from last month</div>
          </CardContent>
        </Card>
      </div>

      {/* Line Graph Viewer */}
      <Card className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/20 dark:to-slate-900/10 border-0 shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              User Activity
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Switch
                id="show-difficulty"
                checked={showDifficulty}
                onCheckedChange={setShowDifficulty}
                className="data-[state=checked]:bg-blue-500"
              />
              <Label htmlFor="show-difficulty" className="text-slate-600 dark:text-slate-400">Show Difficulty</Label>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={dailyMotivation}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="day" 
                  stroke="#64748b"
                  tick={{ fill: '#64748b' }}
                />
                <YAxis 
                  stroke="#64748b"
                  tick={{ fill: '#64748b' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }} 
                />
                <Legend 
                  wrapperStyle={{
                    paddingTop: '20px',
                    color: '#64748b'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="motivation"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', strokeWidth: 2 }}
                  name="Users"
                />
                {showDifficulty && (
                  <Line
                    type="monotone"
                    dataKey="difficulty"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ fill: '#10b981', strokeWidth: 2 }}
                    name="Sessions"
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Calendar View */}
      <Card className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/20 dark:to-slate-900/10 border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <CalendarIcon className="h-5 w-5 text-blue-500" />
            Activity Calendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
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
        </CardContent>
      </Card>
    </div>
  );
}