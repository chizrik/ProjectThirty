import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  // Validate environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json(
      { error: 'Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY' },
      { status: 500 }
    )
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  try {
    const { user_id, day, difficulty_rating, motivation_rating, completion_rating, reflection } = await request.json()

    if (!user_id || !day || !difficulty_rating || !motivation_rating || !completion_rating || !reflection) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Groq API key is not configured' },
        { status: 500 }
      )
    }

    const apiEndpoint = 'https://api.groq.com/openai/v1/chat/completions'
    const model = 'llama-3.3-70b-versatile'

    // Generate AI feedback using selected API
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
          content: `Generate personalized feedback and a bonus task based on this daily reflection:

Day: ${day}
Difficulty Rating: ${difficulty_rating}/10
Motivation Level: ${motivation_rating}/10
Completion Rate: ${completion_rating}/10
Reflection: ${reflection}

Provide encouraging feedback that addresses their experience and a specific bonus task to help them improve. Format the response as a JSON object with 'ai_feedback' and 'bonus_task' fields.`
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
        { error: 'Failed to generate AI feedback' },
        { status: 500 }
      )
    }

    const json = await response.json()
    const content = json.choices?.[0]?.message?.content

    if (!content) {
      return NextResponse.json(
        { error: 'No feedback generated' },
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

    // Store the reflection and AI feedback in Supabase
    const { data, error } = await supabase
      .from('daily_progress')
      .upsert([
        {
          user_id,
          day,
          completed: true,
          motivation_level: motivation_rating,
          reflection,
          ai_feedback: parsedContent.ai_feedback,
          bonus_task: parsedContent.bonus_task,
          difficulty_rating,
          completion_rating
        }
      ])
      .select()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to save reflection' },
        { status: 500 }
      )
    }

    return NextResponse.json(data[0])
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}