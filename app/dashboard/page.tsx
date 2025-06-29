'use client'

import { useState, useEffect } from 'react'
import { createSupabaseClient } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { motion } from 'framer-motion'
import { Calendar, Clock, BarChart, Flame, Plus, ArrowRight, CheckCircle, XCircle, Circle } from 'lucide-react'
import { toast } from 'sonner'

interface ChallengeSummary {
  id: string
  title: string
  description: string
  category: string
  createdAt: string
  completedDays: number
  streakCount: number
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [challenges, setChallenges] = useState<ChallengeSummary[]>([])
  const router = useRouter()
  const supabase = createSupabaseClient()
  
  // Function to fetch user data that can be called on demand
  const fetchUserData = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/auth/signin')
        return
      }

      // Fetch user profile
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') { // No profile found
          // Create a new profile
          const { data: newProfile, error: createError } = await supabase
            .from('user_profiles')
            .insert({
              user_id: user.id,
              email: user.email,
              name: user.email?.split('@')[0] || 'User'
            })
            .select()
            .single()

          if (createError) throw createError
          setUserProfile(newProfile)
        } else {
          throw error
        }
      } else {
        setUserProfile(profile)
      }

      // Always check both tables and combine results
      let challengesFromMainTable = [];
      const { data, error: challengesQueryError } = await supabase
        .from('challenges')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      if (!challengesQueryError) {
        challengesFromMainTable = data || [];
      } else {
        console.log('Error fetching from challenges table:', challengesQueryError);
      }
      
      // Also try challenge_plans table
      const { data: planData, error: planError } = await supabase
        .from('challenge_plans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      let challengesFromPlansTable = [];
      if (!planError) {
        challengesFromPlansTable = planData || [];
      } else {
        console.log('Error fetching from challenge_plans table:', planError);
      }
      
      // Combine results, ensuring no duplicates by ID
      const combinedChallenges = [...challengesFromMainTable];
      
      // Add challenges from plans table that aren't already in the main table
      challengesFromPlansTable.forEach(planChallenge => {
        if (!combinedChallenges.some(c => c.id === planChallenge.id)) {
          combinedChallenges.push(planChallenge);
        }
      });
      
      if (combinedChallenges.length === 0) {
        console.log('No challenges found in either table');
      }

      // Fetch progress data for each challenge
      const challengesWithProgress = await Promise.all(
        combinedChallenges.map(async (challenge) => {
          // Skip if challenge or challenge.id is undefined
          if (!challenge || !challenge.id) {
            console.warn('Skipping challenge with missing ID:', challenge);
            return null;
          }
          
          const { data: progressData, error: progressError } = await supabase
            .from('daily_progress')
            .select('*')
            .eq('challenge_id', challenge.id)
          
          if (progressError) {
            console.error('Error fetching progress for challenge:', challenge.id, {
              message: progressError.message,
              details: progressError.details,
              hint: progressError.hint,
              code: progressError.code
            });
            return {
              id: challenge.id,
              title: challenge.title,
              description: challenge.description,
              category: challenge.category || 'General',
              createdAt: challenge.created_at,
              completedDays: 0,
              streakCount: 0
            };
          }
          
          // Calculate completed days and streak
          const completedDays = (progressData || []).filter(p => {
            // Check if completed_tasks array has at least one true value
            return Array.isArray(p.completed_tasks) && p.completed_tasks.some(task => task === true)
          }).length
          
          // Calculate streak (simplified version)
          let streakCount = 0
          const sortedProgress = [...(progressData || [])].sort((a, b) => a.day - b.day)
          
          for (let i = sortedProgress.length - 1; i >= 0; i--) {
            if (Array.isArray(sortedProgress[i].completed_tasks) && 
                sortedProgress[i].completed_tasks.some(task => task === true)) {
              streakCount++
            } else {
              break
            }
          }
          
          return {
            id: challenge.id,
            title: challenge.title,
            description: challenge.description,
            category: challenge.category || 'General',
            createdAt: challenge.created_at,
            completedDays,
            streakCount
          }
        })
      )
      
      // Filter out any null values from challenges with missing IDs
      const validChallenges = challengesWithProgress.filter(challenge => challenge !== null);
      setChallenges(validChallenges)
    } catch (error) {
      console.error('Error fetching user data:', error)
      toast.error('Failed to load challenges')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Initial data fetch
    fetchUserData()
    
    // Check if a challenge was just created
    if (typeof window !== 'undefined') {
      const challengeCreated = localStorage.getItem('challenge_created')
      const challengeTitle = localStorage.getItem('challenge_title')
      
      if (challengeCreated === 'true') {
        // Show success notification
        toast.success(`Challenge "${challengeTitle}" created successfully!`)
        
        // Clear the flags
        localStorage.removeItem('challenge_created')
        localStorage.removeItem('challenge_title')
        
        // Refresh data to show the new challenge
        fetchUserData()
      }
    }
    
    // Set up an interval to refresh data every 30 seconds
    const refreshInterval = setInterval(() => {
      fetchUserData()
    }, 30000)
    
    // Clean up interval on component unmount
    return () => clearInterval(refreshInterval)
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth/signin')
  }
  
  const renderChallengeCard = (challenge: ChallengeSummary) => {
    const startDate = new Date(challenge.createdAt)
    const endDate = new Date(startDate)
    endDate.setDate(startDate.getDate() + 29) // 30 days total (0-29)
    
    const today = new Date()
    const daysPassed = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    const daysRemaining = Math.max(0, 30 - daysPassed)
    const isActive = daysPassed < 30
    const completionPercentage = (challenge.completedDays / 30) * 100
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="h-full border-0 shadow-md hover:shadow-lg transition-all overflow-hidden bg-white dark:bg-slate-800/50">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl text-slate-800 dark:text-slate-200">{challenge.title}</CardTitle>
                <CardDescription className="text-slate-500 dark:text-slate-400 mt-1">{challenge.category}</CardDescription>
              </div>
              <Badge 
                variant="outline" 
                className={`
                  ${isActive 
                    ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300' 
                    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}
                `}
              >
                {isActive ? 'Active' : 'Completed'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 line-clamp-2">
              {challenge.description}
            </p>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Progress</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">{challenge.completedDays}/30 days</span>
                </div>
                <Progress value={completionPercentage} className="h-2" />
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <Calendar className="h-4 w-4" />
                  <span>{endDate.toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 justify-end">
                  <Flame className="h-4 w-4 text-orange-500" />
                  <span>{challenge.streakCount} day streak</span>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => {
                  const dayNumber = i + 1
                  const dayStatus = dayNumber <= challenge.completedDays % 5 ? 'completed' : 
                                   dayNumber <= Math.min(5, daysPassed % 5) ? 'missed' : 'pending'
                  
                  return (
                    <div key={i} className="w-6 h-6 flex items-center justify-center">
                      {dayStatus === 'completed' && <CheckCircle className="h-5 w-5 text-green-500" />}
                      {dayStatus === 'missed' && <XCircle className="h-5 w-5 text-red-500" />}
                      {dayStatus === 'pending' && <Circle className="h-5 w-5 text-slate-300 dark:text-slate-600" />}
                    </div>
                  )
                })}
                <span className="ml-1 text-xs text-slate-500 dark:text-slate-400">Recent days</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full gap-1">
              <Link href={`/dashboard/${challenge.id}`}>
                <span>View Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200">My Challenges</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">Track and manage your 30-day challenges</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-[300px] bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200">My Challenges</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">Track and manage your 30-day challenges</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={fetchUserData} disabled={loading}>
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Refreshing...
              </>
            ) : (
              <>Refresh</>  
            )}
          </Button>
          <Button variant="outline" onClick={handleSignOut}>
            Sign Out
          </Button>
          <Button asChild>
             <Link href="/generate">
               <Plus className="h-4 w-4 mr-2" />
               New Challenge
             </Link>
           </Button>
        </div>
      </div>
      
      {challenges.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-slate-100 dark:bg-slate-800 rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-4">
            <BarChart className="h-10 w-10 text-slate-400 dark:text-slate-500" />
          </div>
          <h3 className="text-xl font-medium text-slate-700 dark:text-slate-300 mb-2">No challenges yet</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
            Start your first 30-day challenge to build habits, learn skills, or achieve your goals.
          </p>
          <Button asChild>
             <Link href="/generate">
               <Plus className="h-4 w-4 mr-2" />
               Create Your First Challenge
             </Link>
           </Button>
        </div>
      ) : (
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All Challenges</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {challenges.map((challenge) => (
                <div key={challenge.id}>
                  {renderChallengeCard(challenge)}
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="active" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {challenges
                .filter(c => {
                  const startDate = new Date(c.createdAt)
                  const daysPassed = Math.floor((new Date().getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
                  return daysPassed < 30
                })
                .map((challenge) => (
                  <div key={challenge.id}>
                    {renderChallengeCard(challenge)}
                  </div>
                ))}
            </div>
          </TabsContent>
          
          <TabsContent value="completed" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {challenges
                .filter(c => {
                  const startDate = new Date(c.createdAt)
                  const daysPassed = Math.floor((new Date().getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
                  return daysPassed >= 30
                })
                .map((challenge) => (
                  <div key={challenge.id}>
                    {renderChallengeCard(challenge)}
                  </div>
                ))}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}