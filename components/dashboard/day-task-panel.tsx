'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Loader2, Upload, Star, CheckCircle, FileText, Image, Calendar } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'

interface DayTask {
  task: string
  tip?: string
}

interface DayTaskPanelProps {
  isOpen: boolean
  onClose: () => void
  day: number
  tasks: DayTask[]
  bonus_task?: string
  onSubmit: (data: {
    completedTasks: string[]
    reflection: string
    proofUrl: string
    motivationRating: number
    difficultyRating: number
    completionRating: number
  }) => Promise<void>
  isMobile?: boolean
}

export function DayTaskPanel({
  isOpen,
  onClose,
  day,
  tasks,
  bonus_task,
  onSubmit,
  isMobile = false
}: DayTaskPanelProps) {
  const [completedTasks, setCompletedTasks] = useState<string[]>([])
  const [reflection, setReflection] = useState('')
  const [proofUrl, setProofUrl] = useState('')
  const [motivationRating, setMotivationRating] = useState(5)
  const [difficultyRating, setDifficultyRating] = useState(5)
  const [completionRating, setCompletionRating] = useState(5)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [activeTab, setActiveTab] = useState('tasks')

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      await onSubmit({
        completedTasks,
        reflection,
        proofUrl,
        motivationRating,
        difficultyRating,
        completionRating
      })
      
      // Trigger confetti effect
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      })
      
      setShowFeedback(true)
    } catch (error) {
      console.error('Error submitting day progress:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const Content = () => (
    <div className="space-y-6">
      <Tabs defaultValue="tasks" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="tasks" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Tasks
          </TabsTrigger>
          <TabsTrigger value="reflection" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Reflection
          </TabsTrigger>
          <TabsTrigger value="proof" className="flex items-center gap-2">
            <Image className="h-4 w-4" />
            Proof
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="space-y-4">
          <Card className="bg-gradient-to-br from-teal-50 to-white dark:from-teal-900/20 dark:to-slate-900/10 border-0 shadow-sm">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-teal-900 dark:text-teal-100">Today's Tasks</h4>
                <Badge variant="outline" className="bg-teal-50 dark:bg-teal-900/50">
                  {completedTasks.length}/{tasks.length} Done
                </Badge>
              </div>
              {tasks.map((task, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start space-x-3 p-3 rounded-lg hover:bg-teal-50/50 dark:hover:bg-teal-900/20 transition-colors"
                >
                  <Checkbox
                    id={`task-${index}`}
                    checked={completedTasks.includes(task.task)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setCompletedTasks([...completedTasks, task.task])
                      } else {
                        setCompletedTasks(completedTasks.filter(t => t !== task.task))
                      }
                    }}
                    className="mt-1"
                  />
                  <div className="space-y-1 flex-1">
                    <Label 
                      htmlFor={`task-${index}`}
                      className={`text-sm font-medium ${completedTasks.includes(task.task) ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-gray-100'}`}
                    >
                      {task.task}
                    </Label>
                    {task.tip && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">{task.tip}</p>
                    )}
                  </div>
                </motion.div>
              ))}
              
              {bonus_task && completedTasks.length === tasks.length && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 pt-4 border-t border-teal-100 dark:border-teal-800"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300">BONUS</Badge>
                    <h5 className="font-medium text-yellow-800 dark:text-yellow-300">Extra Challenge</h5>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{bonus_task}</p>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reflection" className="space-y-4">
          <Card className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-slate-900/10 border-0 shadow-sm">
            <CardContent className="pt-6 space-y-4">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100">Daily Reflection</h4>
              <Textarea
                placeholder="Share your thoughts, challenges, and victories from today..."
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                className="min-h-[150px] bg-white/50 dark:bg-slate-800/50 border-blue-200 dark:border-blue-800 focus:border-blue-300 dark:focus:border-blue-700"
              />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="space-y-2">
                  <Label className="text-sm text-blue-700 dark:text-blue-300">Motivation Level (1-10)</Label>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Low</span>
                    <span className="text-xl font-bold text-blue-600 dark:text-blue-400">{motivationRating}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">High</span>
                  </div>
                  <Slider
                    min={1}
                    max={10}
                    step={1}
                    value={[motivationRating]}
                    onValueChange={(value) => setMotivationRating(value[0])}
                    className="flex-1"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm text-purple-700 dark:text-purple-300">Difficulty Level (1-10)</Label>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Easy</span>
                    <span className="text-xl font-bold text-purple-600 dark:text-purple-400">{difficultyRating}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Hard</span>
                  </div>
                  <Slider
                    min={1}
                    max={10}
                    step={1}
                    value={[difficultyRating]}
                    onValueChange={(value) => setDifficultyRating(value[0])}
                    className="flex-1"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm text-green-700 dark:text-green-300">Completion Level (1-10)</Label>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Partial</span>
                    <span className="text-xl font-bold text-green-600 dark:text-green-400">{completionRating}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Full</span>
                  </div>
                  <Slider
                    min={1}
                    max={10}
                    step={1}
                    value={[completionRating]}
                    onValueChange={(value) => setCompletionRating(value[0])}
                    className="flex-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="proof" className="space-y-4">
          <Card className="bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/20 dark:to-slate-900/10 border-0 shadow-sm">
            <CardContent className="pt-6 space-y-4">
              <h4 className="font-semibold text-purple-900 dark:text-purple-100">Upload Proof</h4>
              <div className="border-2 border-dashed border-purple-200 dark:border-purple-800 rounded-lg p-8 text-center cursor-pointer hover:bg-purple-50/50 dark:hover:bg-purple-900/20 transition-colors">
                <Upload className="w-10 h-10 mx-auto text-purple-400 dark:text-purple-500 mb-3" />
                <p className="text-sm text-purple-600 dark:text-purple-300 mb-1">Drop your file here or click to browse</p>
                <p className="text-xs text-purple-500 dark:text-purple-400">Supports images, videos, or links</p>
              </div>
              
              <div className="mt-4">
                <Label className="text-sm text-purple-700 dark:text-purple-300 mb-2 block">Or add a link</Label>
                <input
                  type="text"
                  placeholder="https://example.com/my-proof"
                  value={proofUrl}
                  onChange={(e) => setProofUrl(e.target.value)}
                  className="w-full p-2 rounded-md border border-purple-200 dark:border-purple-800 bg-white/50 dark:bg-slate-800/50 focus:outline-none focus:ring-2 focus:ring-purple-300 dark:focus:ring-purple-700"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AnimatePresence mode="wait">
        {showFeedback ? (
          <motion.div
            key="feedback"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <Card className="bg-gradient-to-br from-yellow-50 to-white dark:from-yellow-900/20 dark:to-slate-900/10 border-0 shadow-sm overflow-hidden">
              <CardContent className="pt-6 relative">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="absolute top-0 right-0 w-32 h-32 bg-yellow-100 dark:bg-yellow-900/30 rounded-full -translate-y-1/2 translate-x-1/2 opacity-50"
                />
                <div className="relative flex items-start space-x-4">
                  <div className="flex-shrink-0 bg-yellow-100 dark:bg-yellow-900/50 p-3 rounded-full">
                    <Star className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div className="space-y-3">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <h4 className="font-semibold text-yellow-900 dark:text-yellow-100">Excellent Progress!</h4>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">You're building great momentum. Each completed task brings you closer to your goal!</p>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="flex flex-col gap-2"
                    >
                      <Badge variant="outline" className="bg-green-50 dark:bg-green-900/50 w-fit">
                        🎯 {completedTasks.length} Tasks Completed
                      </Badge>
                      <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/50 w-fit">
                        💪 Motivation Level: {motivationRating}/10
                      </Badge>
                      {reflection && (
                        <Badge variant="outline" className="bg-purple-50 dark:bg-purple-900/50 w-fit">
                          📝 Reflection Added
                        </Badge>
                      )}
                    </motion.div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex justify-end"
            >
              <Button
                variant="outline"
                onClick={onClose}
                className="bg-white hover:bg-gray-50 dark:bg-slate-800 dark:hover:bg-slate-700"
              >
                Close
              </Button>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="submit"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex gap-3"
          >
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Save for Later
            </Button>
            <Button
              className="flex-1 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 dark:from-teal-600 dark:to-teal-700 dark:hover:from-teal-500 dark:hover:to-teal-600"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Submitting...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>Complete Day {day}</span>
                </div>
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )

  // Render as Dialog on desktop, Sheet on mobile
  return isMobile ? (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
        <SheetHeader className="space-y-2 sticky top-0 bg-white dark:bg-slate-900 pt-6 pb-4 z-10">
          <SheetTitle className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="h-5 w-5 text-teal-500" />
            Day {day}
          </SheetTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400">Track your progress and reflect on your journey</p>
        </SheetHeader>
        <Content />
      </SheetContent>
    </Sheet>
  ) : (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="h-5 w-5 text-teal-500" />
            Day {day}
          </DialogTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400">Track your progress and reflect on your journey</p>
        </DialogHeader>
        <Content />
      </DialogContent>
    </Dialog>
  )
}