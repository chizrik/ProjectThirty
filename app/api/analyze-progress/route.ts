import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export async function POST(request: Request) {
  try {
    const { user_id } = await request.json()

    if (!user_id) {
      return NextResponse.json(
        { error: 'Missing user_id' },
        { status: 400 }
      )
    }



    // Fetch user's progress data from Supabase
    const { data: reflections, error: reflectionsError } = await supabase
      .from('daily_reflections')
      .select('*')
      .eq('user_id', user_id)
      .order('day', { ascending: true })

    if (reflectionsError) {
      console.error('Supabase error:', reflectionsError)
      return NextResponse.json(
        { error: 'Failed to fetch progress data' },
        { status: 500 }
      )
    }

    // Fetch user's challenge plan
    let plan;
    let planError;
    
    // Try to fetch from challenges table first
    const { data: challengeData, error: challengeError } = await supabase
      .from('challenges')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    
    plan = challengeData;
    planError = challengeError;
    
    // If not found in challenges table, try challenge_plans table
    if (planError) {
      console.log('Challenge not found in challenges table, trying challenge_plans table');
      const { data: planData, error: planDataError } = await supabase
        .from('challenge_plans')
        .select('*')
        .eq('user_id', user_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      
      if (!planDataError) {
        plan = planData;
        planError = null;
      }
    }

    if (planError) {
      console.error('Supabase error:', planError)
      return NextResponse.json(
        { error: 'Failed to fetch challenge plan' },
        { status: 500 }
      )
    }

    // Prepare progress data for analysis
    const progressData = reflections.map(r => ({
      day: r.day,
      difficulty: r.difficulty,
      motivation: r.motivation,
      completion: r.completion,
      reflection: r.reflection
    }))

    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Groq API key is not configured' },
        { status: 500 }
      )
    }

    const apiEndpoint = 'https://api.groq.com/openai/v1/chat/completions'
    const model = 'llama-3.3-70b-versatile'

    // Generate analytics insights using selected API
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages: [{
        role: 'system',
        content: 'You are a helpful assistant that always responds in valid JSON format.'
      }, {
          role: 'user',
          content: `Analyze this 30-day challenge progress data and provide insights:\n\nChallenge Plan: ${JSON.stringify(plan)}\n\nDaily Progress: ${JSON.stringify(progressData)}\n\nProvide a comprehensive analysis including:\n1. Overall progress trends\n2. Pattern identification in motivation and difficulty\n3. Areas of improvement\n4. Specific recommendations\n\nFormat the response as a JSON object with these fields:\n- progress_summary: Overall progress analysis\n- identified_patterns: Key patterns in the data\n- improvement_areas: Areas needing attention\n- recommendations: Specific actionable recommendations\n- success_metrics: Numerical assessment of progress (0-100)`
        }],
        max_tokens: 3000,
        temperature: 0.7,
      response_format: { type: "json_object" }
      })
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('API error:', error)
      return NextResponse.json(
        { error: 'Failed to generate analytics' },
        { status: 500 }
      )
    }

    const json = await response.json()
    const content = json.choices?.[0]?.message?.content

    if (!content) {
      return NextResponse.json(
        { error: 'No analytics generated' },
        { status: 500 }
      )
    }

    // Parse the AI response
    let parsedContent
    try {
      parsedContent = JSON.parse(content)
    } catch (e) {
      console.error('Failed to parse AI response:', e)
      return NextResponse.json(
        { error: 'Invalid AI response format' },
        { status: 500 }
      )
    }

    return NextResponse.json(parsedContent)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}