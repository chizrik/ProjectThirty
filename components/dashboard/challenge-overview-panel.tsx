'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Info, Clock, Zap, BarChart3 } from 'lucide-react'
import { motion } from 'framer-motion'

interface ChallengeOverviewPanelProps {
  title: string
  description: string
  category?: string
  summary?: string
  successLikelihood: number
  difficultyLevel: number
  timePerDay: number
}

export function ChallengeOverviewPanel({ 
  title, 
  description, 
  category, 
  summary, 
  successLikelihood, 
  difficultyLevel, 
  timePerDay 
}: ChallengeOverviewPanelProps) {
  // Convert effort level string to numeric value for visualization
  // Convert difficulty level to effort level
  const effortLevel = difficultyLevel || 30
  
  // Calculate days remaining
  const today = new Date()
  const startDate = new Date() // This should come from challenge data
  const endDate = new Date(startDate)
  endDate.setDate(startDate.getDate() + 30)
  const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)))
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-slate-900/10 border-blue-100 dark:border-blue-800 shadow-lg overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <CardTitle className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                  {title}
                </CardTitle>
                {category && (
                  <Badge variant="outline" className="bg-blue-100/50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                    {category}
                  </Badge>
                )}
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed max-w-2xl">
                {description}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {daysRemaining}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Days Left
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          {/* Key Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-4 h-4 text-green-500" />
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Success Rate</span>
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {successLikelihood}%
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Predicted</div>
            </div>
            
            <div className="bg-white dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-orange-500" />
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Difficulty</span>
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {Math.round(effortLevel)}%
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Effort Level</div>
            </div>
            
            <div className="bg-white dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Daily Time</span>
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {timePerDay}m
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Per Day</div>
            </div>
            
            <div className="bg-white dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-4 h-4 text-purple-500" />
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Progress</span>
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {30 - daysRemaining}/30
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Days Done</div>
            </div>
          </div>
          
          {/* Challenge Summary */}
          {summary && (
            <div className="bg-slate-50 dark:bg-slate-800/30 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
                <Info className="w-4 h-4" />
                Challenge Summary
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {summary}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}