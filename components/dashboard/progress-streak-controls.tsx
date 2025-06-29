'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Flame, Calendar, Clock, Info } from 'lucide-react'
import { motion } from 'framer-motion'

interface ProgressStreakControlsProps {
  completedDays: number
  totalDays: number
  currentStreak: number
  longestStreak: number
  endDate: string
}

export function ProgressStreakControls({
  completedDays,
  totalDays,
  currentStreak,
  longestStreak,
  endDate
}: ProgressStreakControlsProps) {
  const progressPercentage = Math.round((completedDays / totalDays) * 100)
  const daysLeft = totalDays - completedDays
  const formattedEndDate = new Date(endDate).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric'
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <Card className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-900/20 dark:to-slate-900/10 border-0 shadow-md">
        <CardContent className="pt-6 pb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Your Progress</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {completedDays}/{totalDays} Days Complete
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800 gap-1.5 py-1.5 px-3">
                      <Flame className="w-4 h-4 text-amber-500" />
                      <span className="font-medium text-amber-700 dark:text-amber-300">{currentStreak}-day streak</span>
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <div className="text-sm">
                      <p>Current streak: {currentStreak} days</p>
                      <p>Longest streak: {longestStreak} days</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 gap-1.5 py-1.5 px-3">
                      <Calendar className="w-4 h-4 text-blue-500" />
                      <span className="font-medium text-blue-700 dark:text-blue-300">Ends {formattedEndDate}</span>
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p className="text-sm">Challenge end date</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="bg-purple-50 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800 gap-1.5 py-1.5 px-3">
                      <Clock className="w-4 h-4 text-purple-500" />
                      <span className="font-medium text-purple-700 dark:text-purple-300">{daysLeft} days left</span>
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p className="text-sm">Days remaining in your challenge</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          
          <div className="relative mt-2">
            <Progress 
              value={progressPercentage} 
              className="h-3 rounded-full bg-gray-100 dark:bg-gray-800"
            />
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge className="bg-teal-500 text-white dark:bg-teal-600">{progressPercentage}%</Badge>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <div className="flex items-center gap-1">
                      <Info className="h-3 w-3" />
                      <span className="text-sm">Overall completion rate</span>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}