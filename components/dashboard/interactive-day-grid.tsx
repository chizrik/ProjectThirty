'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { CheckCircle, XCircle, Circle, FileText, Image } from 'lucide-react'
import { motion } from 'framer-motion'

interface DayProgress {
  day: number
  status: 'completed' | 'missed' | 'pending'
  hasReflection?: boolean
  hasProof?: boolean
}

interface DayTask {
  task: string
  tip?: string
}

interface Day {
  day: number
  tasks: DayTask[]
  bonus_task?: string
}

interface InteractiveDayGridProps {
  days: Day[]
  progress: DayProgress[]
  onDayClick: (day: number) => void
}

export function InteractiveDayGrid({ days, progress, onDayClick }: InteractiveDayGridProps) {
  const [hoveredDay, setHoveredDay] = useState<number | null>(null)

  // Animation variants for grid items
  const gridItemVariants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: (index: number) => ({
      opacity: 1,
      scale: 1,
      transition: {
        delay: index * 0.02, // Staggered animation
        duration: 0.4,
        ease: 'easeOut'
      }
    }),
    hover: { scale: 1.08, y: -2 },
    tap: { scale: 0.95 }
  }

  // Calculate current day for highlighting
  const today = new Date().getDate()
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">30-Day Challenge Progress</h3>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-slate-600 dark:text-slate-400">Completed</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-slate-600 dark:text-slate-400">Missed</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-slate-300"></div>
            <span className="text-slate-600 dark:text-slate-400">Pending</span>
          </div>
        </div>
      </div>
      
      <motion.div 
        className="grid grid-cols-5 md:grid-cols-6 lg:grid-cols-7 gap-2 md:gap-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
      {Array.from({ length: 30 }, (_, i) => {
        const dayNumber = i + 1
        const dayProgress = progress.find(p => p.day === dayNumber) || { day: dayNumber, status: 'pending' }
        const day = days.find(d => d.day === dayNumber)
        
        const isToday = dayNumber === today
        const isCurrentWeek = Math.ceil(dayNumber / 7) === Math.ceil(today / 7)
        
        return (
          <TooltipProvider key={dayNumber}>
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.button
                  className={`relative aspect-square rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all border-2 group
                    ${dayProgress.status === 'completed' 
                      ? 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-900/10 border-green-300 dark:border-green-700 shadow-green-100 dark:shadow-green-900/20' 
                      : ''}
                    ${dayProgress.status === 'missed' 
                      ? 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-900/10 border-red-300 dark:border-red-700 shadow-red-100 dark:shadow-red-900/20' 
                      : ''}
                    ${dayProgress.status === 'pending' 
                      ? 'bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/30 dark:to-slate-800/10 border-slate-300 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-600' 
                      : ''}
                    ${isToday ? 'ring-2 ring-blue-400 ring-offset-2 dark:ring-offset-slate-900' : ''}
                    shadow-sm hover:shadow-md
                  `}
                  onClick={() => onDayClick(dayNumber)}
                  onMouseEnter={() => setHoveredDay(dayNumber)}
                  onMouseLeave={() => setHoveredDay(null)}
                  variants={gridItemVariants}
                  initial="initial"
                  animate="animate"
                  whileHover="hover"
                  whileTap="tap"
                  custom={i}
                >
                  {/* Day number */}
                  <span className={`text-xs font-bold mb-1 ${
                    dayProgress.status === 'completed' ? 'text-green-700 dark:text-green-300' :
                    dayProgress.status === 'missed' ? 'text-red-700 dark:text-red-300' :
                    'text-slate-600 dark:text-slate-400'
                  }`}>
                    {dayNumber}
                  </span>
                  
                  {/* Status icon */}
                  <div className="flex-1 flex items-center justify-center">
                    {dayProgress.status === 'completed' && (
                      <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" />
                    )}
                    {dayProgress.status === 'missed' && (
                      <XCircle className="w-5 h-5 text-red-500 dark:text-red-400" />
                    )}
                    {dayProgress.status === 'pending' && (
                      <Circle className="w-5 h-5 text-slate-400 dark:text-slate-500 group-hover:text-blue-500" />
                    )}
                  </div>
                  
                  {/* Today indicator */}
                  {isToday && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white dark:border-slate-900"></div>
                  )}
                  
                  {/* Indicators for reflection and proof */}
                  {(dayProgress.hasReflection || dayProgress.hasProof) && (
                    <div className="absolute bottom-1 right-1 flex gap-1">
                      {dayProgress.hasReflection && (
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" title="Has reflection" />
                      )}
                      {dayProgress.hasProof && (
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500" title="Has proof" />
                      )}
                    </div>
                  )}
                </motion.button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <div className="text-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">Day {dayNumber}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      dayProgress.status === 'completed' ? 'bg-green-100 text-green-700' :
                      dayProgress.status === 'missed' ? 'bg-red-100 text-red-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {dayProgress.status}
                    </span>
                  </div>
                  {day && (
                    <div className="space-y-1">
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        <strong>Task:</strong> {day.tasks[0]?.task || 'No task available'}
                      </p>
                      {day.tasks[0]?.tip && (
                        <p className="text-xs text-blue-600 dark:text-blue-400">
                          <strong>💡 Tip:</strong> {day.tasks[0].tip}
                        </p>
                      )}
                      {day.bonus_task && (
                        <p className="text-xs text-purple-600 dark:text-purple-400">
                          <strong>🎯 Bonus:</strong> {day.bonus_task}
                        </p>
                      )}
                    </div>
                  )}
                  {isToday && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                      📅 Today's challenge
                    </p>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      })}
      </motion.div>
    </div>
  )
}