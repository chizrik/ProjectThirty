'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Loader2, CheckCircle, CheckCircle2, Clock, Target, AlertTriangle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const categories = [
  { value: 'fitness-light', label: 'Fitness - Light Intensity', description: 'Gentle exercises, stretching, and basic workouts' },
  { value: 'fitness-moderate', label: 'Fitness - Moderate Intensity', description: 'Balanced cardio and strength training' },
  { value: 'fitness-high', label: 'Fitness - High Intensity', description: 'Advanced workouts and intense training' },
  { value: 'productivity', label: 'Productivity & Time Management', description: 'Task management, focus techniques, and efficiency' },
  { value: 'learning', label: 'Learning & Skill Development', description: 'Structured learning paths and practice routines' },
  { value: 'mindfulness', label: 'Mindfulness & Mental Health', description: 'Meditation, stress management, and self-care' },
  { value: 'creativity', label: 'Creativity & Art', description: 'Artistic expression and creative projects' },
  { value: 'habits', label: 'Habit Building', description: 'Consistent routines and behavior change' }
]

const difficultyLevels = [
  { value: 'beginner', label: 'Beginner', description: 'Perfect for those just starting out' },
  { value: 'intermediate', label: 'Intermediate', description: 'For those with some experience' },
  { value: 'advanced', label: 'Advanced', description: 'Challenging goals for experienced individuals' }
]

export default function GeneratePage() {
  const [goal, setGoal] = useState('')
  const [timeCommitment, setTimeCommitment] = useState(30) // minutes
  const [category, setCategory] = useState('')
  const [difficulty, setDifficulty] = useState('')
  const [specificGoals, setSpecificGoals] = useState<string[]>([])
  const [obstacles, setObstacles] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [generatedPlan, setGeneratedPlan] = useState(null)
  const [showPreview, setShowPreview] = useState(false)

  const router = useRouter()
  const supabase = createSupabaseClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('Please sign in to create a challenge')
      }

      const response = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal,
          time_commitment: timeCommitment,
          category,
          difficulty,
          specific_goals: specificGoals,
          obstacles,
          user_id: user.id
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate challenge')
      }

      const data = await response.json()
      if (!data.plan) {
        throw new Error('No plan data received from server')
      }
      setGeneratedPlan(data.plan)
      setShowPreview(true)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container max-w-2xl py-8">
      <AnimatePresence>
        {!showPreview ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Create Your 30-Day Challenge</CardTitle>
                <CardDescription>
                  Tell us about your goal and preferences, and we'll generate a personalized 30-day plan for you.
                </CardDescription>
              </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="goal">What's your main goal?</Label>
                <Input
                  id="goal"
                  placeholder="e.g., Get in shape, Learn photography, Build a coding habit"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="specific-goals">What specific outcomes do you want to achieve?</Label>
                <Input
                  id="specific-goals"
                  placeholder="e.g., Run 5km, Complete 3 projects, Learn 5 new techniques"
                  value={specificGoals.join(', ')}
                  onChange={(e) => setSpecificGoals(e.target.value.split(',').map(g => g.trim()).filter(Boolean))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="obstacles">What obstacles might you face?</Label>
                <Input
                  id="obstacles"
                  placeholder="e.g., Limited time, Lack of equipment, Distractions"
                  value={obstacles.join(', ')}
                  onChange={(e) => setObstacles(e.target.value.split(',').map(o => o.trim()).filter(Boolean))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Challenge Category</Label>
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        <div className="flex flex-col">
                          <span>{cat.label}</span>
                          <span className="text-sm text-gray-500">{cat.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="difficulty">Challenge Difficulty</Label>
                <Select value={difficulty} onValueChange={setDifficulty} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty level" />
                  </SelectTrigger>
                  <SelectContent>
                    {difficultyLevels.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        <div className="flex flex-col">
                          <span>{level.label}</span>
                          <span className="text-sm text-gray-500">{level.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Daily time commitment</Label>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Slider
                      min={30}
                      max={180}
                      step={15}
                      value={[timeCommitment]}
                      onValueChange={(value) => setTimeCommitment(value[0])}
                      className="flex-1"
                    />
                    <span className="w-20 text-right">{timeCommitment} mins</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Recommended: 30 minutes to 3 hours daily
                  </div>
                </div>
              </div>
            </div>



            {error && (
              <div className="text-sm text-red-500">{error}</div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating your plan...
                </>
              ) : (
                'Generate My Challenge'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  ) : generatedPlan ? (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{generatedPlan?.title || 'Challenge Plan'}</CardTitle>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium">
                {generatedPlan?.metrics?.success_likelihood || 0}% Success Rate
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>{generatedPlan?.description || 'No description available'}</p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium">
                    {generatedPlan?.metrics?.success_likelihood || 0}% Success Rate
                  </span>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Specific Goals</h4>
                  <div className="space-y-1">
                    {generatedPlan?.metrics?.specific_goals?.map((goal: string, i: number) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <Target className="w-4 h-4 text-blue-500 mt-1" />
                        <span>{goal}</span>
                      </div>
                    )) || <div className="text-sm text-gray-500">No specific goals defined</div>}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Potential Obstacles</h4>
                  <div className="space-y-1">
                    {generatedPlan?.metrics?.potential_obstacles?.map((obstacle: string, i: number) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <AlertTriangle className="w-4 h-4 text-yellow-500 mt-1" />
                        <span>{obstacle}</span>
                      </div>
                    )) || <div className="text-sm text-gray-500">No potential obstacles defined</div>}
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">Day 1 Preview</h4>
                  <Badge variant="outline" className="bg-purple-50">
                    {generatedPlan?.metrics?.difficulty_level || 'Unknown'} Difficulty
                  </Badge>
                </div>
                <div className="space-y-3">
                  {generatedPlan?.days?.[0]?.tasks?.map((task: string, i: number) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-1" />
                      <div className="flex-1">
                        <span>{task}</span>
                        {generatedPlan?.days?.[0]?.difficulty_rating && (
                          <div className="mt-1">
                            <Progress
                              value={generatedPlan?.days?.[0]?.difficulty_rating * 20}
                              className="h-1"
                            />
                            <span className="text-xs text-gray-500 mt-1">
                              Task Difficulty: {generatedPlan?.days?.[0]?.difficulty_rating}/5
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )) || <div className="text-sm text-gray-500">No tasks defined for day 1</div>}
                </div>
              </div>
            </div>
          </div>

          <Button
            className="w-full"
            onClick={async () => {
              setLoading(true)
              try {
                // Insert the challenge into the challenges table for dashboard display
                if (generatedPlan) {
                  const { data: { user } } = await supabase.auth.getUser()
                  
                  if (user) {
                    try {
                  // First, ensure the challenge exists in challenge_plans table
                  const { data: existingPlan, error: planCheckError } = await supabase
                    .from('challenge_plans')
                    .select('id')
                    .eq('id', generatedPlan.id)
                    .single()
                  
                  if (planCheckError && planCheckError.code !== 'PGRST116') {
                    console.error('Error checking challenge_plans:', planCheckError)
                  }
                  
                  // If plan doesn't exist in challenge_plans, insert it (shouldn't happen normally)
                  if (!existingPlan) {
                    console.log('Challenge plan not found in challenge_plans table, reinserting...')
                    const { error: planInsertError } = await supabase
                      .from('challenge_plans')
                      .insert({
                        id: generatedPlan.id,
                        user_id: user.id,
                        title: generatedPlan.title,
                        description: generatedPlan.description,
                        metrics: generatedPlan.metrics,
                        days: generatedPlan.days,
                        created_at: new Date().toISOString()
                      })
                    
                    if (planInsertError) {
                      console.error('Error inserting into challenge_plans:', planInsertError)
                    }
                  }
                  
                  // Now check if this challenge already exists in the challenges table
                  const { data: existingChallenge, error: challengeCheckError } = await supabase
                    .from('challenges')
                    .select('id')
                    .eq('id', generatedPlan.id)
                    .single()
                  
                  if (challengeCheckError && challengeCheckError.code !== 'PGRST116') {
                    console.error('Error checking challenges table:', challengeCheckError)
                  }
                  
                  // If it doesn't exist in challenges table, insert it
                  if (!existingChallenge) {
                    console.log('Inserting challenge into challenges table...')
                    try {
                      const { error: insertError } = await supabase
                        .from('challenges')
                        .insert({
                          id: generatedPlan.id,
                          user_id: user.id,
                          title: generatedPlan.title,
                          description: generatedPlan.description,
                          category: generatedPlan.metrics?.difficulty_level || 'General',
                          created_at: new Date().toISOString()
                        })
                      
                      if (insertError) {
                        console.error('Error inserting challenge:', insertError)
                        
                        // If the error is about the category column not existing, try inserting without it
                        if (insertError.message && insertError.message.includes('category')) {
                          console.log('Retrying without category field...')
                          const { error: retryError } = await supabase
                            .from('challenges')
                            .insert({
                              id: generatedPlan.id,
                              user_id: user.id,
                              title: generatedPlan.title,
                              description: generatedPlan.description,
                              created_at: new Date().toISOString()
                            })
                          
                          if (retryError) {
                            console.error('Still failed to insert into challenges table:', retryError)
                            throw new Error('Failed to save challenge')
                          } else {
                            console.log('Successfully inserted into challenges table without category')
                          }
                        } else {
                          throw new Error('Failed to save challenge')
                        }
                      } else {
                        console.log('Successfully inserted challenge into challenges table')
                      }
                    } catch (insertError) {
                      console.error('Error during challenge insertion:', insertError)
                      // Continue anyway - we'll still have the challenge_plans entry
                    }
                  } else {
                    console.log('Challenge already exists in challenges table')
                  }
                } catch (error) {
                  console.error('Error handling challenge insertion:', error)
                }
                  }
                }
                
                // Give Supabase a moment to complete any pending operations
                await new Promise(resolve => setTimeout(resolve, 1000))
                
                // Set a success flag in localStorage to show a notification on the dashboard
                localStorage.setItem('challenge_created', 'true')
                localStorage.setItem('challenge_title', generatedPlan.title || 'New challenge')
                
                // Navigate to dashboard
                await router.push('/dashboard')
              } catch (error) {
                console.error('Navigation error:', error)
                setError('Failed to navigate to dashboard')
              } finally {
                setLoading(false)
              }
            }}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Starting your challenge...
              </>
            ) : (
              'Start Your Challenge'
            )}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  ) : null}
</AnimatePresence>
    </div>
  )
}