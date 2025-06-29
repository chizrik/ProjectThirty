'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Upload, Star } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface DayModalProps {
  isOpen: boolean
  onClose: () => void
  day: number
  tasks: string[]
  tips?: string[]
  onSubmit: (data: {
    completedTasks: string[]
    reflection: string
    proofUrl: string
    motivationRating: number
  }) => void
}

export function DayModal({ isOpen, onClose, day, tasks, tips, onSubmit }: DayModalProps) {
  const [completedTasks, setCompletedTasks] = useState<string[]>([])
  const [reflection, setReflection] = useState('')
  const [proofUrl, setProofUrl] = useState('')
  const [motivationRating, setMotivationRating] = useState(5)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      await onSubmit({
        completedTasks,
        reflection,
        proofUrl,
        motivationRating
      })
      setShowFeedback(true)
    } catch (error) {
      console.error('Error submitting day progress:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-2xl font-bold">Day {day}</DialogTitle>
          <p className="text-sm text-gray-500">Track your progress and reflect on your journey</p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Task Checklist */}
          <Card className="bg-gradient-to-br from-teal-50 to-white border-none">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-teal-900">Today's Tasks</h4>
                <Badge variant="outline" className="bg-teal-50">
                  {completedTasks.length}/{tasks.length} Done
                </Badge>
              </div>
              {tasks.map((task, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start space-x-3 p-3 rounded-lg hover:bg-teal-50/50 transition-colors"
                >
                  <Checkbox
                    checked={completedTasks.includes(task)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setCompletedTasks([...completedTasks, task])
                      } else {
                        setCompletedTasks(completedTasks.filter(t => t !== task))
                      }
                    }}
                    className="mt-1"
                  />
                  <div className="space-y-1 flex-1">
                    <label className="text-sm font-medium text-gray-900">{task}</label>
                    {tips?.[index] && (
                      <p className="text-xs text-gray-500">{tips[index]}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            {/* Proof Upload */}
            <Card className="bg-gradient-to-br from-purple-50 to-white border-none">
              <CardContent className="pt-6 space-y-3">
                <h4 className="font-semibold text-purple-900">Upload Proof</h4>
                <div className="border-2 border-dashed border-purple-200 rounded-lg p-4 text-center cursor-pointer hover:bg-purple-50/50 transition-colors">
                  <Upload className="w-8 h-8 mx-auto text-purple-400 mb-2" />
                  <p className="text-sm text-purple-600">Drop your file here or click to browse</p>
                </div>
              </CardContent>
            </Card>

            {/* Motivation Rating */}
            <Card className="bg-gradient-to-br from-blue-50 to-white border-none">
              <CardContent className="pt-6 space-y-3">
                <h4 className="font-semibold text-blue-900">Motivation Level</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-blue-600">{motivationRating}</span>
                    <span className="text-sm text-blue-500">/10</span>
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
              </CardContent>
            </Card>
          </div>

          {/* Reflection */}
          <Card className="bg-gradient-to-br from-orange-50 to-white border-none">
            <CardContent className="pt-6 space-y-3">
              <h4 className="font-semibold text-orange-900">Daily Reflection</h4>
              <Textarea
                placeholder="Share your thoughts, challenges, and victories from today..."
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                className="min-h-[100px] bg-white/50 border-orange-200 focus:border-orange-300 focus:ring-orange-200"
              />
            </CardContent>
          </Card>

          <AnimatePresence mode="wait">
            {showFeedback ? (
              <motion.div
                key="feedback"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <Card className="bg-gradient-to-br from-yellow-50 to-white border-none overflow-hidden">
                  <CardContent className="pt-6 relative">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                      className="absolute top-0 right-0 w-32 h-32 bg-yellow-100 rounded-full -translate-y-1/2 translate-x-1/2 opacity-50"
                    />
                    <div className="relative flex items-start space-x-4">
                      <div className="flex-shrink-0 bg-yellow-100 p-3 rounded-full">
                        <Star className="w-6 h-6 text-yellow-600" />
                      </div>
                      <div className="space-y-3">
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 }}
                        >
                          <h4 className="font-semibold text-yellow-900">Excellent Progress!</h4>
                          <p className="text-sm text-yellow-700">You're building great momentum. Each completed task brings you closer to your goal!</p>
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 }}
                          className="flex flex-col gap-2"
                        >
                          <Badge variant="outline" className="bg-green-50 w-fit">
                            🎯 {completedTasks.length} Tasks Completed
                          </Badge>
                          <Badge variant="outline" className="bg-blue-50 w-fit">
                            💪 Motivation Level: {motivationRating}/10
                          </Badge>
                          {reflection && (
                            <Badge variant="outline" className="bg-purple-50 w-fit">
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
                    className="bg-white hover:bg-gray-50"
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
                  className="flex-1 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700"
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
      </DialogContent>
    </Dialog>
  )
}