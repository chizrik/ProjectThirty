'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { DayProgress } from '@/types/challenge'
import { 
  Camera, 
  Upload, 
  Save, 
  Lightbulb, 
  Target, 
  Heart,
  Brain,
  CheckCircle,
  XCircle,
  Clock,
  Star
} from 'lucide-react'
import { createSupabaseClient } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'

interface Task {
  id: string
  title: string
  description: string
  tip?: string
  completed: boolean
}

// DayProgress type is imported from @/types/challenge

interface DayModalProps {
  isOpen: boolean
  onClose: () => void
  day: number
  challengeId: string
  dayProgress?: DayProgress
  onProgressUpdate: (progress: DayProgress) => void
}

interface AIFeedback {
  motivationalInsight: string
  bonusTask: string
  encouragement: string
}

export default function DayModal({ 
  isOpen, 
  onClose, 
  day, 
  challengeId, 
  dayProgress, 
  onProgressUpdate 
}: DayModalProps) {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Morning Routine Reset',
      description: 'Complete your optimized morning routine',
      tip: '5-minute journaling can boost clarity',
      completed: false
    },
    {
      id: '2', 
      title: 'Mindful Movement',
      description: 'Engage in 20 minutes of physical activity',
      tip: 'Even a walk counts as movement',
      completed: false
    },
    {
      id: '3',
      title: 'Learning Session',
      description: 'Dedicate time to skill development',
      tip: 'Focus on one specific skill for better results',
      completed: false
    }
  ])
  
  const [motivationLevel, setMotivationLevel] = useState([7])
  const [difficultyRating, setDifficultyRating] = useState([5])
  const [completionRating, setCompletionRating] = useState([8])
  const [proofText, setProofText] = useState('')
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [aiFeedback, setAiFeedback] = useState<AIFeedback | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  
  const supabase = createSupabaseClient()

  useEffect(() => {
    if (dayProgress) {
      // Load existing progress
      setTasks(prev => prev.map((task, index) => ({
        ...task,
        completed: dayProgress.completed || false
      })))
      
      setMotivationLevel([dayProgress.motivation_rating || 7])
      setDifficultyRating([dayProgress.difficulty_rating || 5])
      setCompletionRating([dayProgress.completion_rating || 8])
      setProofText(dayProgress.proof_text || '')
    }
  }, [dayProgress])

  const toggleTask = (taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ))
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('File size must be less than 10MB')
        return
      }
      
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        toast.error('Please upload an image or video file')
        return
      }
      
      setProofFile(file)
      toast.success('File selected successfully')
    }
  }

  const generateAIFeedback = async () => {
    setLoading(true)
    try {
      const completedCount = tasks.filter(t => t.completed).length
      const motivationScore = motivationLevel[0]
      const difficultyScore = difficultyRating[0]
      
      // Simulate AI feedback generation
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const insights = [
        "Your consistency is building momentum - keep this energy flowing!",
        "Today's effort shows real commitment to your growth journey.",
        "You're developing strong habits that will serve you long-term.",
        "Your dedication today is an investment in tomorrow's success.",
        "Each completed task is a step closer to your transformation."
      ]
      
      const bonusTasks = [
        "Try a 5-minute meditation before bed",
        "Write down 3 things you're grateful for",
        "Reach out to someone you care about",
        "Take a photo of something beautiful you notice",
        "Do one small act of kindness for yourself or others"
      ]
      
      const encouragements = [
        "You're stronger than you think!",
        "Progress, not perfection, is the goal.",
        "Every small step counts toward big changes.",
        "You're building the life you want, one day at a time.",
        "Your future self will thank you for today's efforts."
      ]
      
      setAiFeedback({
        motivationalInsight: insights[Math.floor(Math.random() * insights.length)],
        bonusTask: bonusTasks[Math.floor(Math.random() * bonusTasks.length)],
        encouragement: encouragements[Math.floor(Math.random() * encouragements.length)]
      })
    } catch (error) {
      console.error('Error generating AI feedback:', error)
      toast.error('Failed to generate AI feedback')
    } finally {
      setLoading(false)
    }
  }

  const saveProgress = async () => {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const progressData = {
        challenge_id: challengeId,
        user_id: user.id,
        day: day,
        completed_tasks: tasks.map(t => t.completed),
        proof_text: proofText,
        motivation_rating: motivationLevel[0],
        difficulty_rating: difficultyRating[0],
        completion_rating: completionRating[0],
        completed_at: new Date().toISOString()
      }

      // Upload proof file if exists
      let proofFileUrl = null
      if (proofFile) {
        const fileExt = proofFile.name.split('.').pop()
        const fileName = `${user.id}/${challengeId}/day-${day}-${Date.now()}.${fileExt}`
        
        const { error: uploadError } = await supabase.storage
          .from('challenge-proofs')
          .upload(fileName, proofFile)
        
        if (uploadError) {
          console.error('Upload error:', uploadError)
        } else {
          proofFileUrl = fileName
        }
      }

      if (proofFileUrl) {
        progressData.proof_file = proofFileUrl
      }

      // Upsert progress data
      const { error } = await supabase
        .from('daily_progress')
        .upsert(progressData, {
          onConflict: 'challenge_id,day'
        })

      if (error) throw error

      // Update parent component
      onProgressUpdate({
        day,
        completed_tasks: tasks.map(t => t.completed),
        proof_text: proofText,
        proof_file: proofFileUrl || undefined,
        completed_at: new Date().toISOString(),
        motivation_rating: motivationLevel[0],
        difficulty_rating: difficultyRating[0],
        completion_rating: completionRating[0]
      })

      toast.success('Progress saved successfully!')
      
      // Generate AI feedback after saving
      if (tasks.some(t => t.completed)) {
        await generateAIFeedback()
      }
      
    } catch (error) {
      console.error('Error saving progress:', error)
      toast.error('Failed to save progress')
    } finally {
      setSaving(false)
    }
  }

  const completedTasksCount = tasks.filter(t => t.completed).length
  const isCompleted = completedTasksCount > 0

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Day {day}: Reset Your Daily Routine
            {isCompleted && <CheckCircle className="h-5 w-5 text-green-500" />}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Task Checklist */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Target className="h-4 w-4" />
                Daily Tasks ({completedTasksCount}/3 completed)
              </h3>
              
              <div className="space-y-3">
                {tasks.map((task, index) => (
                  <motion.div
                    key={task.id}
                    className={`
                      p-3 rounded-lg border transition-all duration-200
                      ${task.completed 
                        ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' 
                        : 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700'
                      }
                    `}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={() => toggleTask(task.id)}
                        className="mt-1"
                      />
                      
                      <div className="flex-1">
                        <h4 className={`font-medium ${task.completed ? 'line-through text-gray-500' : ''}`}>
                          {task.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {task.description}
                        </p>
                        
                        {task.tip && (
                          <div className="flex items-center gap-2 mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-sm">
                            <Lightbulb className="h-3 w-3 text-blue-500" />
                            <span className="text-blue-700 dark:text-blue-300">{task.tip}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Ratings */}
          <Card>
            <CardContent className="p-4 space-y-6">
              <h3 className="font-semibold flex items-center gap-2">
                <Star className="h-4 w-4" />
                Daily Ratings
              </h3>
              
              <div className="space-y-4">
                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <Heart className="h-4 w-4 text-red-500" />
                    Motivation Level: {motivationLevel[0]}/10
                  </Label>
                  <Slider
                    value={motivationLevel}
                    onValueChange={setMotivationLevel}
                    max={10}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4 text-orange-500" />
                    Difficulty Rating: {difficultyRating[0]}/10
                  </Label>
                  <Slider
                    value={difficultyRating}
                    onValueChange={setDifficultyRating}
                    max={10}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Completion Satisfaction: {completionRating[0]}/10
                  </Label>
                  <Slider
                    value={completionRating}
                    onValueChange={setCompletionRating}
                    max={10}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Proof Upload */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Upload Proof (Optional)
              </h3>
              
              <div className="space-y-3">
                <div>
                  <Label htmlFor="proof-file" className="cursor-pointer">
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Click to upload image or video (max 10MB)
                      </p>
                      {proofFile && (
                        <p className="text-sm text-green-600 mt-2">
                          Selected: {proofFile.name}
                        </p>
                      )}
                    </div>
                  </Label>
                  <Input
                    id="proof-file"
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
                
                <div>
                  <Label htmlFor="reflection">Reflection Notes</Label>
                  <Textarea
                    id="reflection"
                    placeholder="How did today go? What did you learn? Any insights or challenges?"
                    value={proofText}
                    onChange={(e) => setProofText(e.target.value)}
                    rows={4}
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Feedback Section */}
          <AnimatePresence>
            {aiFeedback && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
                  <CardContent className="p-4 space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Brain className="h-4 w-4 text-purple-500" />
                      🧠 AI Feedback
                    </h3>
                    
                    <div className="space-y-3">
                      <div className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                        <h4 className="font-medium text-sm text-purple-700 dark:text-purple-300 mb-1">
                          Motivational Insight
                        </h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {aiFeedback.motivationalInsight}
                        </p>
                      </div>
                      
                      <div className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                        <h4 className="font-medium text-sm text-purple-700 dark:text-purple-300 mb-1">
                          Bonus Task for Tomorrow
                        </h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          💡 {aiFeedback.bonusTask}
                        </p>
                      </div>
                      
                      <div className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                        <h4 className="font-medium text-sm text-purple-700 dark:text-purple-300 mb-1">
                          Encouragement
                        </h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          ✨ {aiFeedback.encouragement}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button 
              onClick={saveProgress} 
              disabled={saving}
              className="flex-1"
            >
              {saving ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Progress
                </>
              )}
            </Button>
            
            {completedTasksCount > 0 && !aiFeedback && (
              <Button 
                variant="outline" 
                onClick={generateAIFeedback}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Brain className="h-4 w-4 mr-2 animate-pulse" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Get AI Feedback
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}