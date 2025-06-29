"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Target, Calendar, Clock, Zap, CheckCircle } from "lucide-react"

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(false)

  const handleGetStarted = () => {
    setIsLoading(true)
    // Navigate to sign up page
    window.location.href = '/auth/signup'
    setIsLoading(false)
  }

  const features = [
    {
      icon: Target,
      title: "AI-Powered Challenge Generation",
      description: "Get personalized 30-day challenges crafted by GPT-4o, perfectly tailored to your goals and time commitment",
    },
    {
      icon: Calendar,
      title: "Interactive Progress Tracking",
      description: "Track your journey with our visual 6x5 grid, daily task management, and proof uploads",
    },
    {
      icon: Zap,
      title: "AI Feedback & Motivation",
      description: "Receive personalized AI feedback, motivation boosts, and bonus tasks to keep you engaged",
    },
    {
      icon: CheckCircle,
      title: "Smart Analytics",
      description: "Monitor your progress with detailed analytics, performance metrics, and trend analysis",
    },
  ]

  const sampleChallenges = [
    { title: "Morning Routine Mastery", category: "Productivity", difficulty: "Beginner", timePerDay: "30 mins" },
    { title: "Full-Stack Developer Journey", category: "Education", difficulty: "Advanced", timePerDay: "2 hours" },
    { title: "Mindful Living Challenge", category: "Wellness", difficulty: "Intermediate", timePerDay: "45 mins" },
    { title: "Creative Portfolio Builder", category: "Creativity", difficulty: "Intermediate", timePerDay: "1 hour" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">ChallengeCraft</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost">Sign In</Button>
            <Button onClick={handleGetStarted} disabled={isLoading}>
              {isLoading ? "Loading..." : "Get Started"}
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <Badge className="mb-4" variant="secondary">
            ✨ AI-Powered Personal Growth
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Craft Your Perfect
            <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent"> 30-Day Challenge </span>
            with AI
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Experience personalized challenge generation powered by GPT-4o. Set your goals, track progress,
            and receive AI-driven feedback to ensure your success.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={handleGetStarted} disabled={isLoading} className="text-lg px-8 py-3">
              {isLoading ? "Loading..." : "Start Your Challenge"}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-3">
              Browse Challenges
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Powered by Advanced AI</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our platform combines cutting-edge AI with proven habit-building techniques to create your perfect challenge journey.
            Our platform provides all the tools and support you need to complete your 30-day challenge
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-violet-100 to-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-violet-600" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Popular Challenges */}
      <section className="container mx-auto px-4 py-16 bg-gradient-to-br from-violet-50/50 to-indigo-50/50 rounded-3xl mx-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Example Challenges</h2>
          <p className="text-gray-600">Get inspired by these AI-generated challenges to start your own</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {sampleChallenges.map((challenge, index) => (
            <Card key={index} className="hover:shadow-lg transition-all hover:scale-105 cursor-pointer">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="bg-violet-50">{challenge.category}</Badge>
                  <Badge variant="secondary" className="bg-indigo-50">{challenge.difficulty}</Badge>
                </div>
                <CardTitle className="text-lg mb-2">{challenge.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {challenge.timePerDay}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    30 Days
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-3xl mx-auto bg-gradient-to-br from-violet-50 to-indigo-50 rounded-3xl p-12">
          <Badge className="mb-4" variant="secondary">
            🎯 Achieve Your Goals
          </Badge>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Ready to Craft Your Perfect
            <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent"> 30-Day Journey</span>?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Let our AI create a personalized challenge that fits your schedule, matches your goals, and keeps you motivated every step of the way.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={handleGetStarted} disabled={isLoading} className="text-lg px-8 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700">
              {isLoading ? "Loading..." : "Generate Your Challenge"}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-12 border-t">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Target className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">ChallengeCraft</span>
          </div>
          <div className="text-center text-gray-600">
            <p>&copy; 2024 ChallengeCraft. Powered by Next.js, Supabase, and GPT-4o.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
