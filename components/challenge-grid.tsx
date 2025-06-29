'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { createSupabaseClient } from '@/lib/supabase'
import { DayProgress } from '@/types/challenge'
import { ChallengePlan } from '@/lib/generateChallengePlan'

interface DailyProgress {
  id: string
  date: string
  completed: boolean
  motivation: number
  difficulty: number
  notes: string
}

// ChallengePlan type is imported from @/types/challenge

export function ChallengeGrid() {
  const [challenge, setChallenge] = useState<ChallengePlan | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createSupabaseClient()

  useEffect(() => {
    fetchChallenge()
  }, [])

  const fetchChallenge = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Try to fetch from challenges table first
      let data;
      let error;
      
      const { data: challengeData, error: challengeError } = await supabase
        .from('challenges')
        .select('*, daily_progress(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      
      data = challengeData;
      error = challengeError;
      
      // If not found in challenges table, try challenge_plans table
      if (error) {
        console.log('Challenge not found in challenges table, trying challenge_plans table');
        const { data: planData, error: planError } = await supabase
          .from('challenge_plans')
          .select('*, daily_progress(*)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()
        
        if (!planError) {
          data = planData;
          error = null;
        }
      }

      if (error) throw error
      setChallenge(data)
    } catch (error) {
      console.error('Error fetching challenge:', error)
      toast.error('Failed to load challenge')
    } finally {
      setLoading(false)
    }

    }

  const toggleProgress = async (progressId: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from('daily_progress')
        .update({ completed: !completed })
        .eq('id', progressId)

      if (error) throw error
      await fetchChallenge()
      toast.success('Progress updated')
    } catch (error) {
      console.error('Error updating progress:', error)
      toast.error('Failed to update progress')
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
             <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!challenge) return null

  const completedDays = 0 // TODO: Calculate from actual progress data
  const progressPercentage = (completedDays / (challenge.days?.length || 1)) * 100

  return (
    <Card>
      <CardHeader>
        <CardTitle>{challenge.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{challenge.description}</p>
          <div className="flex items-center space-x-2">
            <Progress value={progressPercentage} />
            <span className="text-sm font-medium">{Math.round(progressPercentage)}%</span>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold">Daily Progress</h3>
          <div className="grid grid-cols-7 gap-2">
            {challenge.days?.map((day, index) => {
              const isCompleted = false // TODO: Get actual completion status
              const isToday = index === 0 // TODO: Calculate actual current day

              return (
                <Button
                  key={day.day}
                  variant={isCompleted ? 'default' : 'outline'}
                  className={`p-2 h-auto ${isToday ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => {}}
                >
                  <div className="text-center space-y-1">
                    <div className="text-xs">{day.day}</div>
                    {isCompleted ? (
                      <CheckCircle className="w-4 h-4 mx-auto" />
                    ) : (
                      <XCircle className="w-4 h-4 mx-auto" />
                    )}
                  </div>
                </Button>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}